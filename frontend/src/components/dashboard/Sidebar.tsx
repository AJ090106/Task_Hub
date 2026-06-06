'use client';

import Link from 'next/link';
import { API_BASE_URL } from '@/utils/api';
import {
  LayoutDashboard,
  ClipboardCheck,
  Images,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {

  onLogout: () => void;

  mobileOpen: boolean;

  setMobileOpen: (
    value: boolean
  ) => void;
}

const items = [

  {
    label: 'Workspace',
    href: '/dashboard/admin',
    icon: LayoutDashboard,
  },

  {
    label: 'Review Queue',
    href: '/dashboard/review',
    icon: ClipboardCheck,
  },

  {
    label: 'Completed Tasks',
    href: '/dashboard/completed',
    icon: Images,
  },

  {
    label: 'Users',
    href: '/dashboard/users',
    icon: Users,
  },

  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },

  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export default function Sidebar({

  onLogout,

  mobileOpen,

  setMobileOpen,

}: SidebarProps) {

  return (
    <>

      {/* Overlay */}
      {mobileOpen && (

        <div
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
        />

      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[290px] flex-col border-r border-white/5 bg-[#070B16] px-5 py-8 transition-transform duration-300 md:sticky md:translate-x-0 ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >

        {/* Top */}
        <div>

          {/* Mobile Close */}
          <div className="mb-6 flex justify-end md:hidden">

            <button
              onClick={() =>
                setMobileOpen(false)
              }
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"
            >

              <X className="h-5 w-5 text-white" />

            </button>

          </div>

          {/* Logo */}
          <div className="flex items-center gap-4 px-2">

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/10">

              <Sparkles className="h-6 w-6 text-white" />

            </div>

            <div>

              <h1 className="bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 bg-clip-text text-2xl font-bold text-transparent">
                Lumora
              </h1>

              <p className="mt-1 text-xs tracking-wide text-neutral-500">
                AI Workspace
              </p>

            </div>

          </div>

          {/* Navigation */}
          <nav className="mt-12 space-y-3">

            {items.map((item) => (

              <Link
                key={item.label}
                href={item.href}
                onClick={() =>
                  setMobileOpen(false)
                }
                className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-neutral-400 transition-all duration-300 hover:border-cyan-500/10 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/5 hover:text-white"
              >

                <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />

                {item.label}

              </Link>

            ))}

          </nav>

        </div>

        {/* Bottom */}
        <div className="mt-auto space-y-4 px-2">

          <button
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-neutral-300 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
          >

            <LogOut className="h-4 w-4" />

            Logout

          </button>

        </div>

      </aside>

    </>
  );
}