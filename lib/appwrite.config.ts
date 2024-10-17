/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const createCapsule = async (capsuleData: any, userId: string) => {
    try {
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
  
      const capsule = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        ID.unique(),
        {
          title: capsuleData.title,
          description: capsuleData.description,
          openDate: capsuleData.openDate,
          fileId,
          userId,
          createdAt: now.toISOString(),
          editableUntil: editableUntil.toISOString(),
        }
      );
  
      return capsule.$id;
    } catch (error) {
      console.error('Error creating capsule:', error);
      throw error;
    }
};

export const getCapsules = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      [Query.equal('userId', userId)]
    );
    return response.documents;
  } catch (error) {
    console.error('Error fetching capsules:', error);
    throw error;
  }
};

export const getCapsule = async (capsuleId: string) => {
  try {
    const capsule = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
      capsuleId
    );
    return capsule;
  } catch (error) {
    console.error('Error fetching capsule:', error);
    throw error;
  }
};

export const updateCapsule = async (capsuleId: string, updatedData: any) => {
    try {
      const capsule = await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!,
        capsuleId,
        updatedData
      );
      return capsule;
    } catch (error) {
      console.error('Error updating capsule:', error);
      throw error;
    }
};

export { client };
