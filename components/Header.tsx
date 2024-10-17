'use client'

import React from 'react'
import DarkModeToggle from './DarkModeToggle'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite.config';

const Header = () => {
    const { user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
          await account.deleteSession('current');
          router.push('/'); // Redirect to home page after logout
        } catch (error) {
          console.error('Error logging out:', error);
          // Optionally, show an error message to the user
        }
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/">
                <span className="text-2xl font-bold">Time Capsule</span>
            </Link>
            <div className="flex items-center space-x-4">
                {user ? (
                <>
                    <Link href="/dashboard">Dashboard</Link>
                    <button 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition duration-300"
                    >
                    Logout
                    </button>
                </>
                ) : (
                <Link href="/auth">
                    <span className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300">
                    Login / Register
                    </span>
                </Link>
                )}
                <DarkModeToggle />
            </div>
            </nav>
        </header>
    )
}

export default Header
