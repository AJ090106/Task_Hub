'use client';

import React, {
  useEffect,
} from 'react';

import { useRouter } from 'next/navigation';

import AdminDashboard from '@/components/dashboard/AdminDashboard';
import UserDashboard from '@/components/dashboard/UserDashboard';

import { useSession } from '@/context/SessionContext';

export default function DashboardRoot() {

  const router = useRouter();

  const {
    session,
    loading,
  } = useSession();

  // -----------------------------------------
  // Redirect unauthenticated users
  // -----------------------------------------
  useEffect(() => {

    if (!loading && !session) {
      router.push('/auth');
    }

  }, [loading, session, router]);

  // -----------------------------------------
  // Global loading screen
  // -----------------------------------------
  if (loading) {

    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="space-y-4 text-center">

          <div className="mx-auto h-14 w-14 animate-pulse rounded-2xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20" />

          <p className="text-sm text-neutral-500">
            Preparing your workspace...
          </p>

        </div>

      </div>
    );
  }

  // -----------------------------------------
  // Safety fallback
  // -----------------------------------------
  if (!session) {
    return null;
  }

  // -----------------------------------------
  // Role-based dashboard rendering
  // -----------------------------------------
  return session.role === 'admin' ? (
    <AdminDashboard />
  ) : (
    <UserDashboard user={session} />
  );
}