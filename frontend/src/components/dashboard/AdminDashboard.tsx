'use client';

import { API_BASE_URL } from '@/utils/api';

import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import { toast } from 'sonner';

import {
  ClipboardList,
  CheckCircle2,
  RefreshCcw,
  Sparkles,
  Plus,
  X,
  Eye,
  Loader2,
  ImageIcon,
  Users,
} from 'lucide-react';

import {
  Task,
  UserProfile,
  GeneratedVariation,
  TaskFormData,
} from '@/types';

import { supabase } from '@/utils/supabase';

import Footer from '@/components/layout/Footer';

export default function AdminDashboard() {

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [users, setUsers] =
    useState<UserProfile[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTask, setSelectedTask] =
    useState<(Task & {
      variations?: GeneratedVariation[];
    }) | null>(null);

  const [modalLoading, setModalLoading] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [formData, setFormData] =
    useState<TaskFormData>({
      title: '',
      description: '',
      product_image_url: '',
      assigned_to: '',
    });



  const fetchDashboardData =
    useCallback(async () => {

      try {

        const [
          tasksResponse,
          usersResponse,
        ] = await Promise.all([

          fetch(
            `${API_BASE_URL}/api/tasks`
          ),

          fetch(
            `${API_BASE_URL}/api/users`
          ),
        ]);

        if (!tasksResponse.ok) {

          throw new Error(
            'Tasks fetch failed'
          );
        }

        if (!usersResponse.ok) {

          throw new Error(
            'Users fetch failed'
          );
        }

        const tasksData: Task[] =
          await tasksResponse.json();

        const usersData: UserProfile[] =
          await usersResponse.json();

        setTasks(tasksData);

        setUsers(

          usersData.filter(

            (user) =>
              user.role === 'user'
          )
        );

      } catch (error) {

        toast.error(
          'Failed to load dashboard'
        );

        console.error(error);

      } finally {

        setLoading(false);

      }

    }, []);



  useEffect(() => {

    fetchDashboardData();

  }, [fetchDashboardData]);



  useEffect(() => {

    const interval =
      setInterval(() => {

        fetchDashboardData();

      }, 5000);

    return () =>
      clearInterval(interval);

  }, [fetchDashboardData]);



  const handleImageUpload =
    async (
      event:
        React.ChangeEvent<HTMLInputElement>
    ) => {

      try {

        setUploading(true);

        const file =
          event.target.files?.[0];

        if (!file) return;

        const fileExt =
          file.name
            .split('.')
            .pop();

        const fileName =
          `${Date.now()}.${fileExt}`;

        const { error } =
          await supabase.storage
            .from(
              'product-images'
            )
            .upload(
              fileName,
              file
            );

        if (error) {

          throw error;
        }

        const { data } =
          supabase.storage
            .from(
              'product-images'
            )
            .getPublicUrl(
              fileName
            );

        setFormData({

          ...formData,

          product_image_url:
            data.publicUrl,
        });

        toast.success(
          'Image uploaded successfully'
        );

      } catch (error) {

        toast.error(
          'Image upload failed'
        );

        console.error(error);

      } finally {

        setUploading(false);

      }
    };


  const createTask =
    async () => {

      if (
        !formData.title ||
        !formData.description ||
        !formData.product_image_url ||
        !formData.assigned_to
      ) {

        toast.error(
          'Please complete all fields'
        );

        return;
      }

      try {

        setSubmitting(true);

        const response = await fetch(
          `${API_BASE_URL}/api/tasks`,
          {

            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({

              title:
                formData.title,

              description:
                formData.description,

              product_image_url:
                formData.product_image_url,

              assigned_to:
                formData.assigned_to,

              created_by:
                'admin',
            }),
          }
        );

        if (!response.ok) {

          throw new Error(
            'Task creation failed'
          );
        }

        toast.success(
          'Campaign created successfully'
        );

        setFormData({

          title: '',

          description: '',

          product_image_url: '',

          assigned_to: '',
        });

        fetchDashboardData();

      } catch (error) {

        toast.error(
          'Failed to create task'
        );

        console.error(error);

      } finally {

        setSubmitting(false);

      }
    };



  const openReviewModal =
    async (task: Task) => {

      setSelectedTask(task);

      setModalLoading(true);

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/${task.id}`
        );

        if (!response.ok) {

          throw new Error(
            'Failed to fetch task'
          );
        }

        const data =
          await response.json();

        setSelectedTask({

          ...task,

          variations:
            data.variations || [],
        });

      } catch (error) {

        toast.error(
          'Failed to open task'
        );

        console.error(error);

      } finally {

        setModalLoading(false);

      }
    };


  const acceptTask =
    async (taskId: string) => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/${taskId}/accept`,
          {
            method: 'PUT',
          }
        );

        if (!response.ok) {

          throw new Error(
            'Accept failed'
          );
        }

        toast.success(
          'Task accepted successfully'
        );

        setSelectedTask(null);

        fetchDashboardData();

      } catch (error) {

        toast.error(
          'Failed to accept task'
        );

        console.error(error);

      }
    };



  const requestRevision =
    async (taskId: string) => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/${taskId}/request-revision`,
          {
            method: 'PUT',
          }
        );

        if (!response.ok) {

          throw new Error(
            'Revision request failed'
          );
        }

        toast.success(
          'Revision requested'
        );

        setSelectedTask(null);

        fetchDashboardData();

      } catch (error) {

        toast.error(
          'Failed to request revision'
        );

        console.error(error);

      }
    };


  const totalTasks =
    tasks.length;

  const submittedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        'submitted'
    ).length;

  const acceptedTasks =
    tasks.filter(
      (task) =>
        task.status ===
        'accepted'
    ).length;

  const revisionsRequested =
    tasks.filter(
      (task) =>
        task.status ===
        'revision_requested'
    ).length;


  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-[#070B16]">

        <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />

      </div>

    );
  }

  return (

    <div className="space-y-8 pb-20">

      {/* Header */}
      <div>

        <h1 className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-3xl sm:text-4xl font-bold text-transparent">

          Lumora Workspace

        </h1>

        <p className="mt-3 text-sm text-neutral-400">

          Manage luxury jewellery campaigns and AI-powered creative workflows.

        </p>

      </div>

      {/* Analytics */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: 'Total Tasks',
            value: totalTasks,
            icon: ClipboardList,
          },

          {
            label: 'Submitted',
            value: submittedTasks,
            icon: Sparkles,
          },

          {
            label: 'Accepted',
            value: acceptedTasks,
            icon: CheckCircle2,
          },

          {
            label: 'Revisions',
            value: revisionsRequested,
            icon: RefreshCcw,
          },
        ].map((card) => (

          <div
            key={card.label}
            className="rounded-[30px] border border-white/5 bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 backdrop-blur-xl"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-neutral-500">
                  {card.label}
                </p>

                <h2 className="mt-3 text-4xl font-semibold text-white">
                  {card.value}
                </h2>

              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">

                <card.icon className="h-5 w-5 text-cyan-300" />

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* Main Grid */}
      <div className="grid gap-6 xl:grid-cols-[450px,1fr]">

        {/* Create Campaign */}
        <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10">

              <Plus className="h-6 w-6 text-cyan-300" />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                Create Campaign
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Assign premium jewellery campaigns to creators.
              </p>

            </div>

          </div>

          <div className="mt-8 space-y-5">

            {/* Title */}
            <div>

              <label className="text-sm text-neutral-400">
                Campaign Title
              </label>

              <input
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title:
                      e.target.value,
                  })
                }
                className="mt-2 h-12 w-full rounded-2xl border border-white/5 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-cyan-400/20"
              />

            </div>

            {/* Description */}
            <div>

              <label className="text-sm text-neutral-400">
                Description
              </label>

              <textarea
                rows={5}
                value={
                  formData.description
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description:
                      e.target.value,
                  })
                }
                className="mt-2 w-full rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white outline-none transition-all focus:border-cyan-400/20"
              />

            </div>

            {/* Upload */}
            <div>

              <label className="text-sm text-neutral-400">
                Product Reference
              </label>

              <div className="mt-2">

                {formData.product_image_url ? (

                  <div className="relative overflow-hidden rounded-3xl border border-white/5">

                    <img
                      src={
                        formData.product_image_url
                      }
                      alt="Preview"
                      className="h-60 w-full object-cover"
                    />

                    <button
                      onClick={() =>
                        setFormData({
                          ...formData,
                          product_image_url:
                            '',
                        })
                      }
                      className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-black/60"
                    >

                      <X className="h-4 w-4 text-white" />

                    </button>

                  </div>

                ) : (

                  <label className="flex h-60 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 transition-all hover:border-cyan-400/20 hover:bg-cyan-500/[0.03]">

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        handleImageUpload
                      }
                      className="hidden"
                    />

                    {uploading ? (

                      <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />

                    ) : (

                      <ImageIcon className="h-8 w-8 text-cyan-300" />

                    )}

                    <p className="mt-4 text-sm font-medium text-white">

                      {uploading
                        ? 'Uploading...'
                        : 'Upload Product Image'}

                    </p>

                  </label>

                )}

              </div>

            </div>

            {/* Assign User */}
            <div>

              <label className="text-sm text-neutral-400">
                Assign To
              </label>

              <select
                value={
                  formData.assigned_to
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    assigned_to:
                      e.target.value,
                  })
                }
                className="mt-2 h-12 w-full rounded-2xl border border-white/5 bg-black/20 px-4 text-sm text-white outline-none transition-all focus:border-cyan-400/20"
              >

                <option value="">
                  Select User
                </option>

                {users.map((user) => (

                  <option
                    key={user.id}
                    value={user.id}
                  >

                    {user.name ||
                      user.email}

                  </option>

                ))}

              </select>

            </div>

            {/* Create Button */}
            <button
              onClick={createTask}
              disabled={submitting}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-sm font-semibold text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {submitting ? (

                <Loader2 className="h-5 w-5 animate-spin" />

              ) : (

                <Plus className="h-5 w-5" />

              )}

              {submitting
                ? 'Creating Campaign...'
                : 'Create Campaign'}

            </button>

          </div>

        </div>

        {/* Recent Tasks */}
        <div className="rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10">

              <Users className="h-6 w-6 text-violet-300" />

            </div>

            <div>

              <h2 className="text-xl font-semibold text-white">
                Recent Tasks
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Latest assigned and reviewed campaigns.
              </p>

            </div>

          </div>

          <div className="mt-8 space-y-4">

            {tasks.slice(0, 5).map(
              (task) => (

                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 p-4"
                >

                  <div className="flex items-center gap-4">

                    <img
                      src={
                        task.product_image_url
                      }
                      alt={task.title}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />

                    <div>

                      <h3 className="text-sm font-medium text-white">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-xs text-neutral-500">
                        {task.status}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      openReviewModal(task)
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 transition-all hover:bg-white/10"
                  >

                    <Eye className="h-4 w-4 text-white" />

                  </button>

                </div>

              )
            )}

          </div>

        </div>

      </div>

      {/* Review Modal */}
      {selectedTask && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#0B1020] p-6 sm:p-8">

            <button
              onClick={() =>
                setSelectedTask(null)
              }
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5"
            >

              <X className="h-5 w-5 text-white" />

            </button>

            {modalLoading ? (

              <div className="flex h-[400px] items-center justify-center">

                <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />

              </div>

            ) : (

              <div className="space-y-8">

                <div>

                  <h2 className="text-3xl font-semibold text-white">
                    {selectedTask.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                    {selectedTask.description}
                  </p>

                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                  {selectedTask.variations?.map(
                    (variation) => (

                      <div
                        key={variation.id}
                        className="overflow-hidden rounded-[28px] border border-white/5 bg-white/[0.03]"
                      >

                        <img
                          src={
                            variation.image_url
                          }
                          alt={
                            variation.image_type
                          }
                          onClick={() =>
                            setPreviewImage(
                              variation.image_url
                            )
                          }
                          className="aspect-square w-full cursor-pointer object-cover transition-transform duration-500 hover:scale-105"
                        />

                        <div className="p-4">

                          <h3 className="text-sm font-medium capitalize text-white">
                            {variation.image_type.replaceAll(
                              '_',
                              ' '
                            )}
                          </h3>

                        </div>

                      </div>

                    )
                  )}

                </div>

                <div className="flex flex-col gap-4 sm:flex-row">

                  <button
                    onClick={() =>
                      acceptTask(
                        selectedTask.id
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 px-6 py-4 text-sm font-medium text-emerald-300 transition-all hover:bg-emerald-500/20"
                  >

                    <CheckCircle2 className="h-4 w-4" />

                    Accept Task

                  </button>

                  <button
                    onClick={() =>
                      requestRevision(
                        selectedTask.id
                      )
                    }
                    className="flex items-center justify-center gap-2 rounded-2xl bg-rose-500/10 px-6 py-4 text-sm font-medium text-rose-300 transition-all hover:bg-rose-500/20"
                  >

                    <RefreshCcw className="h-4 w-4" />

                    Request Revision

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      )}

      {/* Preview Modal */}
      {previewImage && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4 backdrop-blur-sm">

          <button
            onClick={() =>
              setPreviewImage(null)
            }
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"
          >

            <X className="h-5 w-5 text-white" />

          </button>

          <img
            src={previewImage}
            alt="Preview"
            className="max-h-[85vh] max-w-[95vw] rounded-3xl object-contain"
          />

        </div>

      )}

      <Footer />

    </div>
  );
}