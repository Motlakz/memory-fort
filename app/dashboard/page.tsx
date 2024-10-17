'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { databases } from '@/lib/appwrite.config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Query } from 'appwrite';
import Image from 'next/image';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const [capsules, setCapsules] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth');
        }
    }, [user, router, loading]);

    useEffect(() => {
        if (user) {
            const fetchCapsules = async () => {
                try {
                    const response = await databases.listDocuments(
                        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
                        [Query.equal('userId', user.$id)]
                    );
                    setCapsules(response.documents);
                } catch (error: any) {
                    console.error('Error fetching capsules:', error);
                    setError(error.message || 'Failed to fetch capsules. Please try again.');
                }
            };
            fetchCapsules();
        }
    }, [user]);

    const isImageFile = (fileId: string): boolean => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const extension = fileId.split('.').pop()?.toLowerCase();
        return imageExtensions.includes(extension || '');
    };

    const renderFile = (fileId: string, title: string) => {
        if (!fileId) {
            return (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <span className="text-gray-500">No file available</span>
                </div>
            );
        }

        const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/files/${fileId}/view`;

        const isImage = isImageFile(fileId);
        
        if (isImage) {
            return (
                <div className="relative w-full h-40">
                    <Image
                        src={fileUrl}
                        alt={title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                        onError={(e) => {
                            console.error(`Error loading image for ${title}:`, e);
                            e.currentTarget.src = '/path/to/fallback-image.jpg';
                        }}
                    />
                </div>
            );
        } else {
            // For non-image files, display an icon or text representation
            return (
                <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <span className="text-gray-500">File: {title}</span>
                </div>
            );
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >
            <h1 className="text-3xl font-bold mb-4">Your Time Capsules</h1>
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <p>{error}</p>
                </div>
            )}
            <Link href="/create-capsule">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                >
                    Create New Capsule
                </motion.button>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {capsules.map((capsule) => (
                    <motion.div
                        key={capsule.$id}
                        whileHover={{ scale: 1.03 }}
                        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden"
                    >
                        {renderFile(capsule.fileId, capsule.title)}
                        <div className="p-4">
                            <h2 className="text-xl font-bold mb-2">{capsule.title}</h2>
                            <p className="mb-2">{capsule.description}</p>
                            <p className="mb-2">Open Date: {new Date(capsule.openDate).toLocaleDateString()}</p>
                            <div className="flex space-x-2">
                                <Link href={`/view-capsule/${capsule.$id}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-green-500 text-white px-3 py-1 rounded"
                                    >
                                        Open Capsule
                                    </motion.button>
                                </Link>
                                <Link href={`/edit-capsule/${capsule.$id}`}>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit Capsule
                                    </motion.button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
