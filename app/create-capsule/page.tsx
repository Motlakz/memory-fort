/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { createCapsule } from '@/lib/appwrite.config';

export default function CreateCapsule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [openDate, setOpenDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, router, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a capsule.');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const capsuleData = {
        title,
        description,
        openDate: new Date(openDate).toISOString(),
        file,
      };
  
      await createCapsule(capsuleData, user.$id);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Error creating capsule:', error);
      if (error.response && error.response.message) {
        setError(`Failed to create capsule: ${error.response.message}`);
      } else {
        setError('Failed to create capsule. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-6">Create a Time Capsule</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            rows={4}
          />
        </div>
        <div>
          <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Open Date</label>
          <input
            type="date"
            id="openDate"
            value={openDate}
            onChange={(e) => setOpenDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Upload File</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? 'Creating...' : 'Create Capsule'}
        </motion.button>
      </form>
    </motion.div>
  );
}