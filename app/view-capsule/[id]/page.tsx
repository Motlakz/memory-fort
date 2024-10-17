'use client';

import { useParams } from 'next/navigation';
import CapsuleViewer from '@/components/CapsuleViewer';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ViewCapsule() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, router, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">View Time Capsule</h1>
      <CapsuleViewer capsuleId={id as string} userId={user.$id} />
    </div>
  );
}
