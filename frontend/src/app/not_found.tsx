import Link from 'next/link';

import {
  ArrowLeft,
} from 'lucide-react';

export default function NotFound() {

  return (

    <div className="flex min-h-screen items-center justify-center bg-[#070B16] px-6 text-white">

      <div className="w-full max-w-lg rounded-[32px] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">

        <h1 className="bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-7xl font-bold text-transparent">

          404

        </h1>

        <h2 className="mt-6 text-3xl font-semibold">
          Page not found
        </h2>

        <p className="mt-4 text-sm leading-relaxed text-neutral-400">

          The page you are looking for does not exist or has been moved.

        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-500/10 px-6 py-4 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-500/20"
        >

          <ArrowLeft className="h-4 w-4" />

          Back to Dashboard

        </Link>

      </div>

    </div>

  );
}