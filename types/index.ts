import { Models } from 'appwrite';

export interface CommentReaction {
    $id: string;
    userId: string;
    userName: string;
    commentId: string;
    type: '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';
    createdAt: string;
}

// Common base types
type BaseDocument = Models.Document;
type BaseUser = Models.User<Models.Preferences>;

// Common fields interface
interface TimestampFields {
    createdAt: string;
}

interface UserFields {
    userId: string;
    userName: string;
}

// Main interfaces
export interface User extends BaseUser {
    $id: string;
    name: string;
    avatarUrl?: string;
}

export interface Capsule extends BaseDocument, TimestampFields, UserFields {
    title: string;
    description: string;
    openDate: string;
    fileId?: string;
    isPublic: boolean;
    editableUntil: string;
}

export interface CapsuleInput {
    title: string;
    description: string;
    openDate: string;
    file?: File;
    isPublic?: boolean;
}

export interface Comment extends BaseDocument, TimestampFields, UserFields {
    capsuleId: string;
    text: string;
    parentId?: string;
    reactions?: CommentReaction[];
}

export interface Like extends BaseDocument, TimestampFields {
    userId: string;
    capsuleId: string;
}
