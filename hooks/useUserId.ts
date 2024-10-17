/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { account } from '../lib/appwrite.config';

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUserId(session.$id);
      } catch (error) {
        setUserId(null);
      }
    };

    checkSession();
  }, []);

  return userId;
}
