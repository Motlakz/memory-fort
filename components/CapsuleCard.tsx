import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Edit, Trash, Lock } from 'lucide-react';
import { CapsuleMedia } from '@/components/CapsuleMedia';
import { Comments } from './Comments';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Capsule, Comment, Like, User } from '@/types';

interface CapsuleCardProps {
    capsule: Capsule;
    isPublic: boolean;
    user: User;
    likes: Like[];
    comments: Comment[];
    onLike: (capsuleId: string) => Promise<void>;
    onComment: (capsuleId: string, text: string) => Promise<void>;
    onEdit: (capsuleId: string, updates: Partial<Capsule>) => Promise<void>;
    onDelete: (capsuleId: string) => Promise<void>;
}

export function CapsuleCard({
    capsule,
    isPublic,
    user,
    likes,
    comments,
    onLike,
    onComment,
    onEdit,
    onDelete
}: CapsuleCardProps) {
    const [showComments, setShowComments] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState<string>('');
    const [editForm, setEditForm] = useState({
        title: capsule.title,
        description: capsule.description,
        openDate: new Date(capsule.openDate).toISOString().split('T')[0]
    });
    
    const isLiked = likes.some(like => like.userId === user.$id);

    const isOwner = user && user.$id === capsule.userId;

    const isEditable = () => {
        const creationTime = new Date(capsule.createdAt).getTime();
        const currentTime = new Date().getTime();
        const twelveHours = 12 * 60 * 60 * 1000;
        return currentTime - creationTime < twelveHours;
    };

    const isOpenable = () => {
        const openDate = new Date(capsule.openDate).getTime();
        const currentTime = new Date().getTime();
        return currentTime >= openDate;
    };

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date().getTime();
            const openDate = new Date(capsule.openDate).getTime();
            const creationDate = new Date(capsule.createdAt).getTime();
            const editDeadline = creationDate + (12 * 60 * 60 * 1000);

            setIsLocked(now > editDeadline && now < openDate);

            if (now < openDate) {
                const distance = openDate - now;
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                setTimeRemaining(`Opens in: ${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeRemaining('');
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, [capsule.openDate, capsule.createdAt]);

    const handleEdit = () => {
        if (!isEditable()) return;
        onEdit(capsule.$id, editForm);
        setShowEditModal(false);
    };

    const handleDelete = () => {
        if (!isEditable()) return;
        onDelete(capsule.$id);
        setShowDeleteDialog(false);
    };

    const handleCardClick = () => {
        if (isLocked) return;
        if (!isPublic && !isOpenable()) return;
        setShowModal(true);
    };

    return (
        <>
            <Card 
                className={`w-full mb-6 overflow-hidden bg-white dark:bg-gray-800 transition-shadow
                    ${isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-lg'}`}
                onClick={handleCardClick}
            >
                <CardHeader className="pb-3">
                    {isPublic && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{capsule.userName[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{capsule.userName}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(capsule.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {isOwner && isEditable() && (
                                <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowDeleteDialog(true)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    <CardTitle className="text-xl flex items-center">
                        {capsule.title}
                        {isLocked && <Lock className="ml-2 h-4 w-4" />}
                    </CardTitle>
                </CardHeader>

                {(!isLocked && (isPublic || isOpenable())) ? (
                    <CapsuleMedia fileId={capsule.fileId} title={capsule.title} />
                ) : (
                    <div className="p-12 text-center bg-gray-100 dark:bg-gray-700">
                        <Lock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 font-medium">{timeRemaining}</p>
                    </div>
                )}

                <CardContent className="pt-4">
                    {(!isLocked && (isPublic || isOpenable())) ? (
                        <>
                            <p className="text-gray-600 dark:text-gray-300">{capsule.description}</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Opens: {new Date(capsule.openDate).toLocaleDateString()}
                            </p>
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-500">This time capsule is locked until</p>
                            <p className="font-medium">{new Date(capsule.openDate).toLocaleDateString()}</p>
                            {!isEditable() && isOwner && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Edit window has expired (12 hours after creation)
                                </p>
                            )}
                        </div>
                    )}
                </CardContent>

                {isPublic && !isLocked && (
                    <CardFooter className="flex flex-col border-t" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between w-full py-2">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : ''}`}
                                    onClick={() => onLike(capsule.$id)}
                                    disabled={!user} 
                                >
                                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                    <span>{likes.length}</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center space-x-1"
                                    onClick={() => setShowComments(!showComments)}
                                    disabled={!user}
                                >
                                    <MessageCircle className="h-5 w-5" />
                                    <span>{comments.length}</span>
                                </Button>
                            </div>
                        </div>

                        {showComments && user && (
                            <Comments
                                comments={comments}
                                onAddComment={(text) => onComment(capsule.$id, text)}
                            />
                        )}
                    </CardFooter>
                )}
            </Card>

            {/* View Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{capsule.title}</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div className="mt-4">
                        <CapsuleMedia fileId={capsule.fileId} title={capsule.title} />
                        <p className="mt-4">{capsule.description}</p>
                        {isPublic && !isLocked && user && (
                            <Comments
                                comments={comments}
                                onAddComment={(text) => onComment(capsule.$id, text)}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Time Capsule</DialogTitle>
                        <DialogClose />
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div>
                            <label className="text-sm font-medium">Title</label>
                            <Input
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Open Date</label>
                            <Input
                                type="date"
                                value={editForm.openDate}
                                onChange={(e) => setEditForm({ ...editForm, openDate: e.target.value })}
                            />
                        </div>
                        <Button onClick={handleEdit}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Time Capsule</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this time capsule? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
