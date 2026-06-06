'use client';

import {
  AlertTriangle,
  RefreshCcw,
} from 'lucide-react';

export default function Error({

  error,
  reset,

}: {

  error: Error & {
    digest?: string;
  };

  reset: () => void;
}) {

  console.error(error);

  return (

    <div className="flex min-h-screen items-center justify-center bg-[#070B16] px-6 text-white">

      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10">

          <AlertTriangle className="h-10 w-10 text-rose-300" />

        </div>

        <h1 className="mt-8 text-3xl font-semibold">
          Something went wrong
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-neutral-400">

          An unexpected error occurred while loading the workspace.

        </p>

        <button
          onClick={() => reset()}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-500/10 px-6 py-4 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20"
        >

          <RefreshCcw className="h-4 w-4" />

          Try Again

        </button>

      </div>

    </div>

  );
}