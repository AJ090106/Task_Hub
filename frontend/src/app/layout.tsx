// src/app/layout.tsx
import React from 'react';
import ClientProviders from '@/components/providers/ClientProviders';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'TaskHub Platform Console',
  description: 'AI Distributed Media Production Pipeline Workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-neutral-950 text-neutral-100 antialiased">
      <body className="h-full min-h-screen font-sans">
        <Toaster richColors position="top-right"/>
        {/* Instantiates the client-side session context layer cleanly across all routes */}
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}