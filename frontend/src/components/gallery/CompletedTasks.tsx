'use client';
import { API_BASE_URL } from '@/utils/api';
import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  Download,
  Sparkles,
  X,
} from 'lucide-react';

import Footer from '@/components/layout/Footer';

export default function CompletedTasks() {

  const [tasks, setTasks] =
    useState<any[]>([]);

  const [previewImage, setPreviewImage] =
    useState<string | null>(null);

  useEffect(() => {

    fetchCompletedTasks();

  }, []);

  const fetchCompletedTasks =
    async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/api/tasks`
        );

        const data =
          await response.json();

        const acceptedTasks =
          data.filter(
            (task: any) =>
              task.status ===
              'accepted'
          );

        const resolvedTasks =
          await Promise.all(

            acceptedTasks.map(
              async (task: any) => {

                const detail =
                  await fetch(
                    `${API_BASE_URL}/api/tasks/${task.id}`
                  );

                const detailData =
                  await detail.json();

                return {
                  ...task,
                  variations:
                    detailData.variations || [],
                };
              }
            )
          );

        setTasks(resolvedTasks);

      } catch (error) {

        console.error(error);

      }
    };

  return (
    <div className="space-y-8 pb-20">

      <div>

        <h1 className="text-3xl font-semibold text-white">
          Completed Campaigns
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          Approved AI-generated product campaigns.
        </p>

      </div>

      <div className="grid gap-6">

        {tasks.map((task) => (

          <div
            key={task.id}
            className="rounded-[30px] border border-white/5 bg-white/[0.03] p-6"
          >

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold text-white">
                  {task.title}
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  {task.description}
                </p>

              </div>

              <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">

                Accepted

              </div>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {task.variations?.map(
                (variation: any) => (

                  <div
                    key={variation.id}
                    className="overflow-hidden rounded-[28px] border border-white/5 bg-black/20"
                  >

                    <img
                      src={variation.image_url}
                      alt={variation.image_type}
                      className="aspect-video w-full object-cover"
                    />

                    <div className="space-y-4 p-4">

                      <div className="flex items-center justify-between">

                        <h3 className="text-sm font-medium text-white">
                          {variation.image_type.replace(
                            '_',
                            ' '
                          )}
                        </h3>

                        <Sparkles className="h-4 w-4 text-cyan-300" />

                      </div>

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            setPreviewImage(
                              variation.image_url
                            )
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-neutral-300 transition-all hover:bg-white/10"
                        >

                          <Eye className="h-3.5 w-3.5" />

                          Preview

                        </button>

                        <a
                          href={variation.image_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-neutral-300 transition-all hover:bg-white/10"
                        >

                          <Download className="h-4 w-4" />

                        </a>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        ))}

      </div>

      <Footer />

      {previewImage && (

        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md">

          <div className="flex h-full items-center justify-center p-5">

            <div className="relative max-w-6xl">

              <button
                onClick={() =>
                  setPreviewImage(null)
                }
                className="absolute -right-3 -top-3 z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10"
              >

                <X className="h-5 w-5 text-white" />

              </button>

              <img
                src={previewImage}
                alt="Preview"
                className="max-h-[90vh] rounded-[30px]"
              />

            </div>

          </div>

        </div>

      )}

    </div>
  );
}