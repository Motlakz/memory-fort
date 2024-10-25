import Image from 'next/image';
import { storage } from '@/lib/appwrite.config';

interface CapsuleMediaProps {
    fileId?: string;
    title: string;
}

export function CapsuleMedia({ fileId, title }: CapsuleMediaProps) {
    if (!fileId) {
        return (
            <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                <span className="text-gray-500">No media</span>
            </div>
        );
    }

    const fileUrl = storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        fileId
    );

    return (
        <div className="relative w-full h-48">
            <Image
                src={fileUrl.toString()}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized={true}
            />
        </div>
    );
}
