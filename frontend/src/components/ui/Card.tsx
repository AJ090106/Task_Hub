// src/components/ui/Card.tsx
import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-neutral-900/20 border border-neutral-800 rounded-xl overflow-hidden shadow-xl ${className}`}>
      {children}
    </div>
  );
}
