'use client';

import React, {
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  Menu,
} from 'lucide-react';

import { toast } from 'sonner';

import { useSession } from '@/context/SessionContext';

import Sidebar from '@/components/dashboard/Sidebar';

import { supabase } from '@/utils/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();

  const sessionContext =
    useSession();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  if (!sessionContext) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070B16]">

        <p className="text-sm text-neutral-500">
          Loading workspace...
        </p>

      </div>
    );
  }

  const {
    setSession,
  } = sessionContext;

  const handleLogout =
    async () => {

      try {

        await supabase.auth.signOut();

        setSession(null);

        toast.success(
          'Logged out successfully'
        );

        router.push('/auth');

      } catch (error) {

        toast.error(
          'Logout failed'
        );

        console.error(error);
      }
    };

  return (
    <div className="flex min-h-screen bg-[#070B16] text-white">

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main */}
      <main className="flex-1 overflow-y-auto">

        {/* Mobile Topbar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#070B16]/90 px-4 py-4 backdrop-blur-xl md:hidden">

          <button
            onClick={() =>
              setMobileOpen(true)
            }
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"
          >

            <Menu className="h-5 w-5 text-white" />

          </button>

          <h1 className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 bg-clip-text text-lg font-semibold text-transparent">

            Lumora

          </h1>

          <div className="w-11" />

        </div>

        {/* Content */}
        <div className="px-4 py-5 sm:px-6 lg:px-8">

          {children}

        </div>

      </main>

    </div>
  );
}