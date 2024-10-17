'use client';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="container mx-auto px-4 py-4 text-center">
          © 2023 Time Capsule App. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
