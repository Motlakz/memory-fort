import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Comment } from '@/types';

interface CommentsProps {
    comments: Comment[];
    onAddComment: (text: string) => void;
}

export function Comments({ comments, onAddComment }: CommentsProps) {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = () => {
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    return (
        <div className="w-full">
            {comments.map(comment => (
                <div key={comment.$id} className="py-2">
                    <p className="text-sm">
                        <span className="font-medium">{comment.userName}</span>: {comment.text}
                    </p>
                </div>
            ))}
            <div className="flex items-center space-x-2 mt-2">
                <Input
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSubmit();
                        }
                    }}
                />
                <Button size="sm" onClick={handleSubmit}>
                    Post
                </Button>
            </div>
        </div>
    );
}
