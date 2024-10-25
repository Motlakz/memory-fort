/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Lock, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { client, databases } from '@/lib/appwrite.config';
import { Query } from 'appwrite';
import Link from 'next/link';
import { CapsuleCard } from '@/components/CapsuleCard';
import type { Capsule, Comment, Like, User } from '@/types';

export default function Dashboard() {
    const { user, loading } = useAuth() as { user: User | null; loading: boolean };
    const [publicCapsules, setPublicCapsules] = useState<Capsule[]>([]);
    const [privateCapsules, setPrivateCapsules] = useState<Capsule[]>([]);
    const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
    const [likes, setLikes] = useState<{ [key: string]: Like[] }>({});
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCapsules = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
    
        try {
            console.log('Fetching capsules for user:', user.$id);
            console.log('Database ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
            console.log('Collection ID:', process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID);
            
            // Fetch public and private capsules in parallel
            const [publicResponse, privateResponse] = await Promise.all([
                databases.listDocuments<Capsule>(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                    [Query.equal('isPublic', true)]
                ),
                databases.listDocuments<Capsule>(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                    [Query.equal('userId', user.$id)]
                )
            ]);
    
            console.log('Public capsules response:', publicResponse);
            console.log('Private capsules response:', privateResponse);
    
            setPublicCapsules(publicResponse.documents as Capsule[]);
            setPrivateCapsules(privateResponse.documents as Capsule[]);
    
        } catch (err) {
            const error = err as Error;
            console.error('Error fetching capsules:', error);
            setError(error.message || 'Failed to fetch capsules');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    const fetchCommentsAndLikes = useCallback(async (capsuleIds: string[]) => {
        // Early return if no capsule IDs
        if (!capsuleIds?.length) return;
    
        // Remove duplicates and validate IDs
        const uniqueCapsuleIds = Array.from(new Set(capsuleIds)).filter(id => id && typeof id === 'string');
        if (!uniqueCapsuleIds.length) return;
    
        try {
            // Create a cache key based on sorted capsule IDs for consistency
            const cacheKey = uniqueCapsuleIds.sort().join(',');
            
            // Check if we have cached data
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const { comments, likes, timestamp } = JSON.parse(cachedData);
                // Use cache if it's less than 1 minute old
                if (Date.now() - timestamp < 60000) {
                    setComments(comments);
                    setLikes(likes);
                    return;
                }
            }
    
            // Initialize empty objects for all comments and likes
            const allComments: { [key: string]: Comment[] } = {};
            const allLikes: { [key: string]: Like[] } = {};
    
            // Initialize with empty arrays
            uniqueCapsuleIds.forEach(id => {
                allComments[id] = [];
                allLikes[id] = [];
            });
    
            // Batch size for concurrent requests
            const BATCH_SIZE = 5;
            
            // Process capsules in batches
            for (let i = 0; i < uniqueCapsuleIds.length; i += BATCH_SIZE) {
                const batch = uniqueCapsuleIds.slice(i, i + BATCH_SIZE);
                
                await Promise.all(
                    batch.map(async (capsuleId) => {
                        try {
                            const [commentsResponse, likesResponse] = await Promise.all([
                                databases.listDocuments<Comment>(
                                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                                    process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
                                    [
                                        Query.equal('capsuleId', capsuleId),
                                        Query.limit(100) // Add reasonable limit
                                    ]
                                ),
                                databases.listDocuments<Like>(
                                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                                    process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
                                    [
                                        Query.equal('capsuleId', capsuleId),
                                        Query.limit(100) // Add reasonable limit
                                    ]
                                )
                            ]);
    
                            allComments[capsuleId] = commentsResponse.documents.sort((a, b) => 
                                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                            );
                            allLikes[capsuleId] = likesResponse.documents;
                        } catch (error) {
                            console.error(`Error fetching data for capsule ${capsuleId}:`, error);
                            // Keep the empty arrays for this capsule if there's an error
                        }
                    })
                );
    
                // Add small delay between batches to prevent rate limiting
                if (i + BATCH_SIZE < uniqueCapsuleIds.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
    
            // Cache the results
            const cacheData = {
                comments: allComments,
                likes: allLikes,
                timestamp: Date.now()
            };
            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    
            setComments(allComments);
            setLikes(allLikes);
    
        } catch (err) {
            console.error('Error fetching comments and likes:', err);
            // Initialize empty states in case of error
            const emptyComments = uniqueCapsuleIds.reduce((acc, id) => ({ ...acc, [id]: [] }), {});
            const emptyLikes = uniqueCapsuleIds.reduce((acc, id) => ({ ...acc, [id]: [] }), {});
            setComments(emptyComments);
            setLikes(emptyLikes);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchCapsules();
        }
    }, [user, fetchCapsules]);

    useEffect(() => {
        const allCapsuleIds = [...publicCapsules, ...privateCapsules].map(c => c.$id);
        fetchCommentsAndLikes(allCapsuleIds);
    }, [publicCapsules, privateCapsules, fetchCommentsAndLikes]);

    const handleEdit = async (capsuleId: string, updates: Partial<Capsule>) => {
        if (!user) return;
    
        try {
            const updatedCapsule = await databases.updateDocument<Capsule>(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                capsuleId,
                {
                    title: updates.title,
                    description: updates.description,
                    openDate: updates.openDate,
                    updatedAt: new Date().toISOString()
                }
            );
    
            // Update the state based on whether it's a public or private capsule
            setPublicCapsules(prev => 
                prev.map(capsule => 
                    capsule.$id === capsuleId ? { ...capsule, ...updatedCapsule } : capsule
                )
            );
    
            setPrivateCapsules(prev => 
                prev.map(capsule => 
                    capsule.$id === capsuleId ? { ...capsule, ...updatedCapsule } : capsule
                )
            );
    
        } catch (err) {
            console.error('Error updating capsule:', err);
            // Optionally show an error message to the user
        }
    };
    
    const handleDelete = async (capsuleId: string) => {
        if (!user) return;
    
        try {
            // Delete the capsule document
            await databases.deleteDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                capsuleId
            );
    
            // Delete associated comments
            if (comments[capsuleId]) {
                await Promise.all(
                    comments[capsuleId].map(comment =>
                        databases.deleteDocument(
                            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                            process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
                            comment.$id
                        )
                    )
                );
            }
    
            // Delete associated likes
            if (likes[capsuleId]) {
                await Promise.all(
                    likes[capsuleId].map(like =>
                        databases.deleteDocument(
                            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                            process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
                            like.$id
                        )
                    )
                );
            }
    
            // Update the state to remove the deleted capsule
            setPublicCapsules(prev => prev.filter(capsule => capsule.$id !== capsuleId));
            setPrivateCapsules(prev => prev.filter(capsule => capsule.$id !== capsuleId));
            
            // Clean up comments and likes state
            setComments(prev => {
                const newComments = { ...prev };
                delete newComments[capsuleId];
                return newComments;
            });
            
            setLikes(prev => {
                const newLikes = { ...prev };
                delete newLikes[capsuleId];
                return newLikes;
            });
    
        } catch (err) {
            console.error('Error deleting capsule:', err);
        }
    };

    const handleLike = async (capsuleId: string) => {
        if (!user) return;
    
        const existingLike = likes[capsuleId]?.find(like => like.userId === user.$id);
    
        try {
            if (existingLike) {
                // Unlike
                await databases.deleteDocument(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
                    existingLike.$id
                );
                setLikes(prev => ({
                    ...prev,
                    [capsuleId]: prev[capsuleId].filter(like => like.$id !== existingLike.$id)
                }));
            } else {
                // Like
                const newLike = await databases.createDocument<Like>(
                    process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                    process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
                    'unique()',
                    {
                        userId: user.$id,
                        capsuleId,
                        createdAt: new Date().toISOString()
                    }
                );
                setLikes(prev => ({
                    ...prev,
                    [capsuleId]: [...(prev[capsuleId] || []), newLike as Like]
                }));
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

// Inside the Dashboard component, add this useEffect:
useEffect(() => {
    if (!user) return;

    const unsubscribe = client.subscribe(
        `databases.${process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.${process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID}.documents`,
        (response: any) => {
            const { event, payload } = response;

            if (event === 'databases.*.collections.*.documents.*.create') {
                const newComment = payload as Comment;
                setComments(prev => ({
                    ...prev,
                    [newComment.capsuleId]: [...(prev[newComment.capsuleId] || []), newComment].sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                }));
            }
        }
    );

    return () => {
        unsubscribe();
    };
}, [user]);

    const handleComment = async (capsuleId: string, commentText: string) => {
        if (!user || !commentText.trim()) return;
    
        try {
            const newComment = await databases.createDocument<Comment>(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
                'unique()',
                {
                    userId: user.$id,
                    userName: user.name,
                    capsuleId,
                    text: commentText.trim(),
                    createdAt: new Date().toISOString()
                }
            );
    
            // Update local state
            setComments(prev => ({
                ...prev,
                [capsuleId]: [...(prev[capsuleId] || []), newComment as Comment].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            }));
        } catch (err) {
            console.error('Error adding comment:', err);
            // Optionally show an error message to the user
        }
    };

    if (loading || isLoading) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="text-center">Loading capsules...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Time Capsules</h1>
                <Link href="/create-capsule">
                    <Button className="flex items-center space-x-2">
                        <PlusCircle className="h-5 w-5" />
                        <span>Create Capsule</span>
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <p>{error}</p>
                </div>
            )}

            {!isLoading && publicCapsules.length === 0 && privateCapsules.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No capsules found. Create your first one!</p>
                    <Link href="/create-capsule">
                        <Button>Create a Capsule</Button>
                    </Link>
                </div>
            )}

            <Tabs defaultValue="public" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="public" className="flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <span>Public Feed</span>
                    </TabsTrigger>
                    <TabsTrigger value="private" className="flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Private Capsules</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="public">
                    {publicCapsules.map(capsule => (
                        <CapsuleCard
                            key={capsule.$id}
                            capsule={capsule}
                            isPublic={true}
                            user={user}
                            likes={likes[capsule.$id] || []}
                            comments={comments[capsule.$id] || []}
                            onLike={handleLike}
                            onComment={handleComment}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </TabsContent>

                <TabsContent value="private">
                    {privateCapsules.map(capsule => (
                        <CapsuleCard
                            key={capsule.$id}
                            capsule={capsule}
                            isPublic={false}
                            user={user}
                            likes={likes[capsule.$id] || []}
                            comments={comments[capsule.$id] || []}
                            onLike={handleLike}
                            onComment={handleComment}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}
