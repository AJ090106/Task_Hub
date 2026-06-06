// src/components/providers/ClientProviders.tsx
'use client';

import React from 'react';
import { SessionProvider } from '@/context/SessionContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}