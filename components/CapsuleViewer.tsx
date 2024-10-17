/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCapsule, storage } from '@/lib/appwrite.config';

interface CapsuleViewerProps {
  capsuleId: string;
  userId: string;
}

export default function CapsuleViewer({ capsuleId }: CapsuleViewerProps) {
  const [capsule, setCapsule] = useState<any>(null);

  useEffect(() => {
    const fetchCapsule = async () => {
      const data = await getCapsule(capsuleId);
      setCapsule(data);
    };
    fetchCapsule();
  }, [capsuleId]);

  if (!capsule) return <div>Loading...</div>;

  const handleFileDownload = async () => {
    if (capsule.fileId) {
      const fileUrl = storage.getFileDownload(process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!, capsule.fileId);
      window.open(fileUrl, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
    >
      <h2 className="text-2xl font-bold mb-4">{capsule.title}</h2>
      <p className="mb-4">{capsule.description}</p>
      <p className="mb-4">Open Date: {new Date(capsule.openDate).toLocaleDateString()}</p>
      {capsule.fileId && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFileDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download File
        </motion.button>
      )}
    </motion.div>
  );
}
