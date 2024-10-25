/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Capsule, CapsuleInput, Comment, Like } from '@/types';
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

// Collection IDs
const COLLECTIONS = {
    CAPSULES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
    COMMENTS: process.env.NEXT_PUBLIC_APPWRITE_COMMENTS_COLLECTION_ID!,
    LIKES: process.env.NEXT_PUBLIC_APPWRITE_LIKES_COLLECTION_ID!,
} as const;

// Initialize Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Capsule Operations
export const createCapsule = async (capsuleData: CapsuleInput, userId: string, userName: string) => {
    try {
        // Handle file upload if present
        let fileId = null;
        if (capsuleData.file) {
            const uploadedFile = await storage.createFile(
                process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
                ID.unique(),
                capsuleData.file
            );
            fileId = uploadedFile.$id;
        }

        const now = new Date();
        const editableUntil = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours from now

        // Create capsule document data without the file property
        const capsuleDoc = {
            title: capsuleData.title,
            description: capsuleData.description,
            openDate: capsuleData.openDate,
            fileId,
            userId,
            userName,
            isPublic: capsuleData.isPublic ?? false,
            createdAt: now.toISOString(),
            editableUntil: editableUntil.toISOString(),
        };

        const capsule = await databases.createDocument<Capsule>(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            COLLECTIONS.CAPSULES,
            ID.unique(),
            capsuleDoc
        );

        return capsule;
    } catch (error) {
        console.error('Error creating capsule:', error);
        throw error;
    }
};

export const getCapsules = async (userId: string) => {
    try {
        // Get both public capsules and user's private capsules
        const [publicCapsules, privateCapsules] = await Promise.all([
            databases.listDocuments<Capsule>(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                COLLECTIONS.CAPSULES,
                [
                    Query.equal('isPublic', true),
                    Query.orderDesc('createdAt')
                ]
            ),
            databases.listDocuments<Capsule>(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                COLLECTIONS.CAPSULES,
                [
                    Query.equal('userId', userId),
                    Query.orderDesc('createdAt')
                ]
            )
        ]);

        return {
            public: publicCapsules.documents,
            private: privateCapsules.documents.filter(cap => !cap.isPublic)
        };
    } catch (error) {
        console.error('Error fetching capsules:', error);
        throw error;
    }
};

export const updateCapsule = async (capsuleId: string, updatedData: Partial<Omit<CapsuleInput, 'file'>>) => {
    try {
        const capsule = await databases.updateDocument<Capsule>(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            COLLECTIONS.CAPSULES,
            capsuleId,
            updatedData
        );
        return capsule;
    } catch (error) {
        console.error('Error updating capsule:', error);
        throw error;
    }
};

export const getComments = async (capsuleId: string) => {
    try {
        const comments = await databases.listDocuments<Comment>(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            COLLECTIONS.COMMENTS,
            [
                Query.equal('capsuleId', capsuleId),
                Query.orderDesc('createdAt')
            ]
        );
        return comments.documents;
    } catch (error) {
        console.error('Error fetching comments:', error);
        throw error;
    }
};

export const getLikes = async (capsuleId: string) => {
    try {
        const likes = await databases.listDocuments<Like>(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            COLLECTIONS.LIKES,
            [Query.equal('capsuleId', capsuleId)]
        );
        return likes.documents;
    } catch (error) {
        console.error('Error fetching likes:', error);
        throw error;
    }
};

// Media Operations
export const uploadFile = async (file: File) => {
    try {
        const uploadedFile = await storage.createFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

export const deleteFile = async (fileId: string) => {
    try {
        await storage.deleteFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
            fileId
        );
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

export const getFilePreview = (fileId: string) => {
    return storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        fileId
    );
};

export const updateClientAuth = (jwt?: string) => {
  if (jwt) {
      client.setJWT(jwt);
  }
};

// Modify operations to handle authentication

// Like Operations
export const toggleLike = async (capsuleId: string, userId: string, jwt: string) => {
  try {
      // Set JWT for this request
      updateClientAuth(jwt);
      
      const likes = await databases.listDocuments<Like>(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          COLLECTIONS.LIKES,
          [
              Query.equal('capsuleId', capsuleId),
              Query.equal('userId', userId)
          ]
      );

      if (likes.documents.length > 0) {
          await databases.deleteDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              COLLECTIONS.LIKES,
              likes.documents[0].$id
          );
          return null;
      } else {
          const like = await databases.createDocument<Like>(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
              COLLECTIONS.LIKES,
              ID.unique(),
              {
                  userId,
                  capsuleId,
                  createdAt: new Date().toISOString()
              }
          );
          return like;
      }
  } catch (error) {
      if ((error as any).code === 401) {
          throw new Error('Authentication required');
      }
      console.error('Error toggling like:', error);
      throw error;
  }
};

// Comment Operations
export const createComment = async (
  capsuleId: string,
  userId: string,
  userName: string,
  text: string,
  jwt: string
) => {
  try {
      // Set JWT for this request
      updateClientAuth(jwt);

      const comment = await databases.createDocument<Comment>(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          COLLECTIONS.COMMENTS,
          ID.unique(),
          {
              userId,
              userName,
              capsuleId,
              text,
              createdAt: new Date().toISOString()
          }
      );
      return comment;
  } catch (error) {
      if ((error as any).code === 401) {
          throw new Error('Authentication required');
      }
      console.error('Error creating comment:', error);
      throw error;
  }
};

// Add authentication check helper
export const checkAuth = async () => {
  try {
      const session = await account.get();
      return session;
  } catch (error) {
      return null;
  }
};

export { client, ID };
