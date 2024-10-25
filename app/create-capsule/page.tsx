'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { createCapsule } from '@/lib/appwrite.config';
import type { CapsuleInput } from '@/types';

export default function CreateCapsule() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<CapsuleInput>({
    title: '',
    description: '',
    openDate: '',
    isPublic: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isPublic: e.target.checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a capsule.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const capsuleInput: CapsuleInput = {
        ...formData,
        openDate: new Date(formData.openDate).toISOString(),
        file: file || undefined,
      };

      const result = await createCapsule(capsuleInput, user.$id, user.name || 'Anonymous');
      
      if (!result) {
        throw new Error('Failed to create capsule');
      }    

      // Redirect with the new capsule ID if needed
      router.push(`/capsule/${result.$id}`);
      
      router.push('/dashboard?success=capsule-created');
      router.refresh();
    } catch (err) {
      console.error('Error creating capsule:', err);
      setError(err instanceof Error ? err.message : 'Failed to create capsule. Please try again.');
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="openDate" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Open Date
          </label>
          <input
            type="date"
            id="openDate"
            name="openDate"
            value={formData.openDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            required
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            Upload File
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div className="flex items-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleCheckboxChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Make capsule public
            </span>
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? 'Creating...' : 'Create Capsule'}
        </motion.button>
      </form>
    </motion.div>
  );
}
