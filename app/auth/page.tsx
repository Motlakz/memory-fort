/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { account } from '@/lib/appwrite.config';
import { useRouter } from 'next/navigation';

export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);
  
      try {
        if (isLogin) {
          await account.createEmailPasswordSession(email, password);
        } else {
          await account.create('unique()', email, password);
          await account.createEmailPasswordSession(email, password);
        }
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Authentication error:', error);
        setError(error.message || 'An error occurred during authentication');
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-4">{isLogin ? 'Login' : 'Register'}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isLoading}
        >
          {isLogin ? 'Login' : 'Register'}
        </motion.button>
      </form>
      <p className="mt-4">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 underline"
        >
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </motion.div>
  );
}
