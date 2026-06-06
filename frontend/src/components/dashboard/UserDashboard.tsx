'use client';
import { API_BASE_URL } from '@/utils/api';
import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  Sparkles,
  ImageIcon,
  X,
  Wand2,
  RefreshCcw,
  CheckCircle2,
  Download,
  Trash2,
  Eye,
  Loader2,
  Star,
} from 'lucide-react';

import {
  UserProfile,
} from '@/types';

import { supabase } from '@/utils/supabase';

interface UserDashboardProps {
  user: UserProfile;
}

interface GeneratedImage {

  id: string;

  image_url: string;

  image_type: string;

  prompt_used?: string;

  is_final?: boolean;
}

interface Task {

  id: string;

  title: string;

  description: string;

  product_image_url: string;

  status: string;

  assigned_to: string;

  variations?: GeneratedImage[];
}

const REQUIRED_VARIATIONS = [

  {
    key: 'white_bg',
    label: 'White Background',
  },

  {
    key: 'luxury_marble',
    label: 'Luxury Marble',
  },

  {
    key: 'luxury_velvet',
    label: 'Luxury Velvet',
  },

  {
    key: 'artistic_neon',
    label: 'Creative Neon',
  },

  {
    key: 'artistic_pastel',
    label: 'Creative Pastel',
  },

  {
    key: 'model_front',
    label: 'Model Front',
  },

  {
    key: 'model_side',
    label: 'Model Side',
  },

  {
    key: 'model_closeup',
    label: 'Model Closeup',
  },
];

export default function UserDashboard({
  user,
}: UserDashboardProps) {

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [backendOffline, setBackendOffline] =
    useState(false);

  const [modalLoading, setModalLoading] =
    useState(false);

  const [generationLoading, setGenerationLoading] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);


  const fetchTasks = useCallback(
    async (showLoader = false) => {

      if (showLoader) {
        setLoading(true);
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks`
        );

        let rows: Task[] = [];

        if (response.ok) {

          rows = await response.json();

          setBackendOffline(false);

        } else {

          setBackendOffline(true);

          const { data } =
            await supabase
              .from('tasks')
              .select('*')
              .order('created_at', {
                ascending: false,
              });

          rows = (data || []) as Task[];
        }

        const normalizedRows =
          rows.map((task: Task) => ({
            ...task,
            status:
              task.status ||
              'assigned',
          }));

        const assignedTasks =
          normalizedRows.filter(
            (task: Task) =>
              task.assigned_to ===
              user.id
          );

        setTasks(assignedTasks);

      } catch (error) {

        console.error(error);

        setBackendOffline(true);

      } finally {

        if (showLoader) {
          setLoading(false);
        }

      }
    },
    [user.id]
  );


  const refreshTask =
    useCallback(async () => {

      if (!selectedTask?.id) {
        return;
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks/${selectedTask.id}`
        );

        if (response.ok) {

          const taskData =
            await response.json();

          setSelectedTask({
            ...selectedTask,
            variations:
              taskData.variations || [],
            status:
              taskData.status ||
              selectedTask.status,
          });
        }

      } catch (error) {

        console.error(error);

      }
    }, [selectedTask]);

  useEffect(() => {

    fetchTasks(true);

  }, [fetchTasks]);


  useEffect(() => {

    const interval = setInterval(() => {

      fetchTasks(false);

      if (selectedTask?.id) {
        refreshTask();
      }

    }, 4000);

    return () =>
      clearInterval(interval);

  }, [
    fetchTasks,
    refreshTask,
    selectedTask?.id,
  ]);

  const openStudio = async (
    task: Task
  ) => {

    setSelectedTask(task);

    setModalLoading(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${task.id}`
      );

      if (response.ok) {

        const taskData =
          await response.json();

        setSelectedTask({
          ...task,
          variations:
            taskData.variations || [],
        });
      }

    } catch (error) {

      console.error(error);

    } finally {

      setModalLoading(false);

    }
  };


  const generateImages = async (
    taskId: string
  ) => {

    try {

      setGenerationLoading(true);

      await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/generate`,
        {
          method: 'POST',
        }
      );

      await fetchTasks();

      await refreshTask();

    } catch (error) {

      console.error(error);

    } finally {

      setGenerationLoading(false);

    }
  };

  const submitTask = async (
    taskId: string
  ) => {

    try {

      setSubmitLoading(true);

      await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/submit`,
        {
          method: 'POST',
        }
      );

      await fetchTasks();

      await refreshTask();

    } catch (error) {

      console.error(error);

    } finally {

      setSubmitLoading(false);

    }
  };


  const deleteImage = async (
    imageId: string
  ) => {

    try {

      await fetch(
        `${API_BASE_URL}/api/generations/${imageId}`,
        {
          method: 'DELETE',
        }
      );

      await refreshTask();

    } catch (error) {

      console.error(error);

    }
  };


  const regenerateImage =
    async (
      generationId: string
    ) => {

      try {

        await fetch(
          `${API_BASE_URL}/api/generations/${generationId}/regenerate`,
          {
            method: 'POST',
          }
        );

        await refreshTask();

      } catch (error) {

        console.error(error);

      }
    };


  const markAsFinal =
    async (
      generationId: string
    ) => {

      if (!selectedTask?.variations) {
        return;
      }

      const updated =
        selectedTask.variations.map(
          (image) => ({
            ...image,
            is_final:
              image.id ===
              generationId,
          })
        );

      setSelectedTask({
        ...selectedTask,
        variations: updated,
      });
    };



  if (loading) {

    return (
      <div className="flex h-[500px] items-center justify-center">

        <div className="space-y-4 text-center">

          <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-violet-500/20">

            <Sparkles className="h-6 w-6 text-cyan-300" />

          </div>

          <p className="text-sm text-neutral-500">
            Loading AI Studio...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>

          <h1 className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-4xl font-bold text-transparent">
            AI Product Studio
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Generate consistent premium AI product campaigns and creative visual variations.
          </p>

        </div>

        <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-300">

          {tasks.length} Assigned Tasks

        </div>

      </div>

      {/* Offline */}
      {backendOffline && (

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">

          Backend unavailable. Recovery sync mode active.

        </div>

      )}

      {/* Empty */}
      {tasks.length === 0 ? (

        <div className="rounded-[32px] border border-dashed border-white/10 py-28 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.03]">

            <Sparkles className="h-7 w-7 text-cyan-300" />

          </div>

          <h3 className="mt-6 text-lg font-medium text-white">
            No assigned tasks
          </h3>

          <p className="mt-2 text-sm text-neutral-500">
            Tasks assigned by administrators will appear here.
          </p>

        </div>

      ) : (

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {tasks.map((task) => {

            const generatedCount =
              task.variations?.length || 0;

            return (

              <div
                key={task.id}
                className="overflow-hidden rounded-[30px] border border-white/5 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20 hover:bg-white/[0.05]"
              >

                {/* Image */}
                <div className="aspect-video overflow-hidden bg-black">

                  {task.product_image_url ? (

                    <img
                      src={task.product_image_url}
                      alt={task.title}
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />

                  ) : (

                    <div className="flex h-full items-center justify-center">

                      <ImageIcon className="h-10 w-10 text-neutral-700" />

                    </div>

                  )}

                </div>

                {/* Content */}
                <div className="space-y-5 p-5">

                  <div className="flex items-center justify-between">

                    <div
                      className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                        task.status ===
                        'accepted'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : task.status ===
                            'submitted'
                          ? 'bg-indigo-500/10 text-indigo-300'
                          : task.status ===
                            'processing'
                          ? 'animate-pulse bg-amber-500/10 text-amber-300'
                          : task.status ===
                            'revision_requested'
                          ? 'bg-rose-500/10 text-rose-300'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {task.status.replace(
                        '_',
                        ' '
                      )}
                    </div>

                    <span className="text-xs text-neutral-500">
                      {generatedCount}/8
                    </span>

                  </div>

                  <div>

                    <h3 className="text-base font-semibold text-white">
                      {task.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-400">
                      {task.description}
                    </p>

                  </div>

                  <div>

                    <div className="flex items-center justify-between text-xs">

                      <span className="text-neutral-500">
                        Generation Progress
                      </span>

                      <span className="text-cyan-300">
                        {generatedCount}/8
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">

                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                        style={{
                          width: `${
                            (generatedCount /
                              8) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        openStudio(task)
                      }
                      className="flex-1 rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-neutral-200 transition-all hover:bg-white/10"
                    >
                      Open Studio
                    </button>

                    <button
                      onClick={() =>
                        generateImages(
                          task.id
                        )
                      }
                      disabled={
                        generationLoading
                      }
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300 transition-all hover:bg-cyan-500/20 disabled:opacity-50"
                    >

                      {generationLoading ? (

                        <Loader2 className="h-4 w-4 animate-spin" />

                      ) : (

                        <Wand2 className="h-4 w-4" />

                      )}

                    </button>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}
    </div>
  );
}