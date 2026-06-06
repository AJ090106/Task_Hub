'use client';

import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  Users as UsersIcon,
  Mail,
  Shield,
  CheckCircle2,
  ClipboardList,
  Sparkles,
} from 'lucide-react';

import { toast } from 'sonner';

import Footer from '@/components/layout/Footer';

import { API_BASE_URL } from '@/utils/api';

interface UserProfile {

  id: string;

  email: string;

  full_name?: string;

  role: 'admin' | 'user';

  created_at?: string;
}

interface Task {

  id: string;

  assigned_to: string;

  status: string;
}

export default function UsersPage() {

  const [users, setUsers] =
    useState<UserProfile[]>([]);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);



  const fetchData =
    useCallback(async () => {

      try {

        const [

          usersResponse,

          tasksResponse,

        ] = await Promise.all([

          fetch(
            `${API_BASE_URL}/api/users`
          ),

          fetch(
            `${API_BASE_URL}/api/tasks`
          ),
        ]);

        if (
          !usersResponse.ok ||
          !tasksResponse.ok
        ) {

          throw new Error(
            'Failed to fetch data'
          );
        }

        const usersData =
          await usersResponse.json();

        const tasksData =
          await tasksResponse.json();

        setUsers(usersData || []);

        setTasks(tasksData || []);

      } catch (error) {

        toast.error(
          'Failed to load users'
        );

        console.error(error);

      } finally {

        setLoading(false);

      }

    }, []);


  useEffect(() => {

    fetchData();

  }, [fetchData]);


  const getAssignedTasks =
    (userId: string) => {

      return tasks.filter(

        (task) =>

          task.assigned_to ===
          userId

      ).length;
    };

  const getCompletedTasks =
    (userId: string) => {

      return tasks.filter(

        (task) =>

          task.assigned_to ===
            userId &&

          task.status ===
            'accepted'

      ).length;
    };

  const getActiveTasks =
    (userId: string) => {

      return tasks.filter(

        (task) =>

          task.assigned_to ===
            userId &&

          task.status !==
            'accepted'

      ).length;
    };


  if (loading) {

    return (

      <div className="flex h-[500px] items-center justify-center">

        <div className="space-y-4 text-center">

          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20">

            <Sparkles className="h-6 w-6 text-cyan-300" />

          </div>

          <p className="text-sm text-neutral-500">
            Loading users...
          </p>

        </div>

      </div>

    );
  }

  return (

    <div className="space-y-8 pb-20">

      {/* Header */}
      <div>

        <h1 className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-3xl sm:text-4xl font-bold text-transparent">

          Team Members

        </h1>

        <p className="mt-3 text-sm text-neutral-400">

          Manage users, task distribution and workspace collaboration.

        </p>

      </div>

      {/* Empty */}
      {users.length === 0 ? (

        <div className="rounded-[32px] border border-dashed border-white/10 py-24 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.03]">

            <UsersIcon className="h-7 w-7 text-cyan-300" />

          </div>

          <h3 className="mt-6 text-lg font-medium text-white">

            No users found

          </h3>

          <p className="mt-2 text-sm text-neutral-500">

            Registered users will appear here.

          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 sm:grid-cols-3">

          {users.map((user) => (

            <div
              key={user.id}
              className="rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 transition-all hover:border-cyan-400/10"
            >

              {/* Top */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div className="flex items-center gap-4">

                  {/* Avatar */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 text-xl font-semibold text-cyan-200">

                    {(
                      user.full_name ||
                      user.email
                    )
                      ?.charAt(0)
                      ?.toUpperCase()}

                  </div>

                  {/* User Info */}
                  <div>

                    <h2 className="text-lg font-semibold text-white">

                      {user.full_name ||
                        'Workspace User'}

                    </h2>

                    <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400">

                      <Mail className="h-4 w-4" />

                      <span className="truncate">

                        {user.email}

                      </span>

                    </div>

                  </div>

                </div>

                {/* Role */}
                <div
  className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium ${
                    user.role === 'admin'

                      ? 'bg-rose-500/10 text-rose-300'

                      : 'bg-cyan-500/10 text-cyan-300'
                  }`}
                >

                  <div className="flex items-center gap-1">

                    <Shield className="h-3 w-3" />

                    {user.role}

                  </div>

                </div>

              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-3 gap-4">

                {/* Assigned */}
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center">

                  <ClipboardList className="mx-auto h-5 w-5 text-cyan-300" />

                  <h3 className="mt-3 text-xl font-semibold text-white">

                    {getAssignedTasks(
                      user.id
                    )}

                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">

                    Assigned

                  </p>

                </div>

                {/* Completed */}
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center">

                  <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-300" />

                  <h3 className="mt-3 text-xl font-semibold text-white">

                    {getCompletedTasks(
                      user.id
                    )}

                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">

                    Completed

                  </p>

                </div>

                {/* Active */}
                <div className="rounded-2xl border border-white/5 bg-black/20 p-4 text-center">

                  <Sparkles className="mx-auto h-5 w-5 text-violet-300" />

                  <h3 className="mt-3 text-xl font-semibold text-white">

                    {getActiveTasks(
                      user.id
                    )}

                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">

                    Active

                  </p>

                </div>

              </div>

              {/* Footer */}
              <div className="mt-6 border-t border-white/5 pt-5">

                <p className="text-xs text-neutral-500">

                  Joined{' '}

                  {user.created_at
                    ? new Date(
                        user.created_at
                      ).toLocaleDateString()
                    : 'Recently'}

                </p>

              </div>

            </div>

          ))}

        </div>

      )}

      <Footer />

    </div>
  );
}