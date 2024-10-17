'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-4xl font-bold mb-4">Welcome to Social Time Capsule</h1>
      <p className="mb-4">Capture and preserve your memories for the future.</p>
      <Link href="/create-capsule">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create a Time Capsule
        </motion.button>
      </Link>
    </motion.div>
  );
}
