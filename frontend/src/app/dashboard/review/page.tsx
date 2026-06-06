'use client';

import React, {
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  Eye,
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  Loader2,
  X,
} from 'lucide-react';

import { toast } from 'sonner';

import {
  Task,
  GeneratedVariation,
} from '@/types';

import Footer from '@/components/layout/Footer';

import { API_BASE_URL } from '@/utils/api';

export default function ReviewPage() {

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [modalLoading, setModalLoading] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<(Task & {
      variations?: GeneratedVariation[];
    }) | null>(null);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  const fetchTasks =
    useCallback(async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks`
        );

        if (!response.ok) {

          throw new Error(
            'Failed to fetch tasks'
          );
        }

        const data: Task[] =
          await response.json();

        const submitted =
          data.filter(
            (task) =>
              task.status ===
              'submitted'
          );

        setTasks(submitted);

      } catch (error) {

        toast.error(
          'Failed to load review queue'
        );

        console.error(error);

      } finally {

        setLoading(false);

      }

    }, []);

  useEffect(() => {

    fetchTasks();

  }, [fetchTasks]);


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
          ...data,
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


  const acceptTask = async (
    taskId: string
  ) => {

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

      fetchTasks();

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

        fetchTasks();

      } catch (error) {

        toast.error(
          'Failed to request revision'
        );

        console.error(error);

      }
    };


  if (loading) {

    return (
      <div className="flex h-[500px] items-center justify-center">

        <div className="space-y-4 text-center">

          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20">

            <Sparkles className="h-6 w-6 text-cyan-300" />

          </div>

          <p className="text-sm text-neutral-500">
            Loading review queue...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>

        <h1 className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-3xl sm:text-4xl font-bold text-transparent">
          Review Queue
        </h1>

        <p className="mt-3 text-sm text-neutral-400">
          Review submitted AI campaigns and approve or request revisions.
        </p>

      </div>

      {/* Empty */}
      {tasks.length === 0 ? (

        <div className="rounded-[32px] border border-dashed border-white/10 py-24 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.03]">

            <Sparkles className="h-7 w-7 text-cyan-300" />

          </div>

          <h3 className="mt-6 text-lg font-medium text-white">
            No submissions awaiting review
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Submitted campaigns will appear here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 xl:grid-cols-2">

          {tasks.map((task) => (

            <div
              key={task.id}
              className="overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-br from-white/[0.04] to-white/[0.02] transition-all hover:border-cyan-400/10"
            >

              {/* Image */}
              <div className="aspect-video overflow-hidden bg-black">

                <img
                  src={
                    task.product_image_url
                  }
                  alt={task.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />

              </div>

              {/* Content */}
              <div className="space-y-5 p-6">

                <div className="flex items-center justify-between">

                  <div className="rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-300">

                    Submitted

                  </div>

                </div>

                <div>

                  <h2 className="text-xl font-semibold text-white">
                    {task.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-400">
                    {task.description}
                  </p>

                </div>

                <button
                  onClick={() =>
                    openReviewModal(task)
                  }
                  className="flex items-center gap-2 rounded-2xl bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20"
                >

                  <Eye className="h-4 w-4" />

                  Open Review

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

      {/* Modal */}
      {selectedTask && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-[36px] border border-white/10 bg-[#0B1020] p-6 sm:p-8">

            {/* Close */}
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

                {/* Top */}
                <div>

                  <h2 className="text-3xl font-semibold text-white">
                    {selectedTask.title}
                  </h2>

                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-neutral-400">
                    {selectedTask.description}
                  </p>

                </div>

                {/* Variations */}
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                  {selectedTask.variations?.map(
                    (variation) => (

                      <div
                        key={variation.id}
                        className="overflow-hidden rounded-[28px] border border-white/5 bg-white/[0.03]"
                      >

                        <div className="aspect-square overflow-hidden">

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
                            className="h-full w-full cursor-pointer object-cover transition-transform duration-500 hover:scale-105"
                          />

                        </div>

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

                {/* Actions */}
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

      {/* Image Preview */}
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