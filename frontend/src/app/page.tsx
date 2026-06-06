'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  ImagePlus,
  Layers3,
  ShieldCheck,
  Wand2,
  Clock3,
} from 'lucide-react';

const showcaseImages = [
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=1200&auto=format&fit=crop',
];

const features = [
  {
    icon: Wand2,
    title: 'AI Scene Generation',
    description:
      'Generate premium product photography setups using AI-assisted background generation.',
  },
  {
    icon: Layers3,
    title: 'Consistent Product Quality',
    description:
      'The original product remains untouched while the environment changes dynamically.',
  },
  {
    icon: Clock3,
    title: 'Async Processing Pipeline',
    description:
      'Celery workers process image generations in the background with real-time updates.',
  },
  {
    icon: ShieldCheck,
    title: 'Recovery & Failover System',
    description:
      'Tasks automatically recover after backend downtime using Supabase synchronization.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070B14] text-white">

      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/20">
              <Sparkles className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-base font-semibold tracking-wide">
                Lumora Studio
              </h1>

              <p className="text-xs text-neutral-400">
                AI Product Visual Generation Platform
              </p>
            </div>
          </div>

          <Link
            href="/auth"
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition-all hover:bg-neutral-200"
          >
            Start Creating
          </Link>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pb-20 pt-16 lg:pb-28 lg:pt-20">

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-2">

          {/* Left Content */}
          <div className="space-y-8">

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-200">
              <Sparkles className="h-4 w-4" />
              AI-powered product photography workflow
            </div>

            <div className="space-y-5">

              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl xl:text-6xl">
                Create premium product visuals without expensive studio shoots.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-neutral-400 md:text-lg">
                Upload your product once and generate multiple luxury campaign visuals using AI-assisted scene generation and automated review workflows.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-5">

              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-medium text-black transition-all hover:bg-neutral-200"
              >
                Start Creating
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

            </div>

            {/* Stats */}
            <div className="grid max-w-2xl grid-cols-3 gap-5 pt-4">

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm">
                <div className="text-2xl font-semibold">8+</div>
                <p className="mt-2 text-sm text-neutral-400">
                  AI variations
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm">
                <div className="text-2xl font-semibold">Realtime</div>
                <p className="mt-2 text-sm text-neutral-400">
                  sync updates
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-5 backdrop-blur-sm">
                <div className="text-2xl font-semibold">Async</div>
                <p className="mt-2 text-sm text-neutral-400">
                  rendering pipeline
                </p>
              </div>

            </div>

          </div>

          {/* Right Side Preview */}
          <div className="relative flex items-center justify-center">

            <div className="grid grid-cols-2 gap-5 rotate-3">

              {showcaseImages.map((image, index) => (
                <div
                  key={index}
                  className={`overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl backdrop-blur-sm ${
                    index % 2 === 0 ? 'translate-y-10' : '-translate-y-10'
                  }`}
                >
                  <img
                    src={image}
                    alt="Generated Visual"
                    className="h-[240px] w-[210px] object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}

            </div>

            {/* Floating Card */}
            <div className="absolute -bottom-8 left-1/2 w-[300px] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#0d1224]/90 p-5 shadow-2xl backdrop-blur-xl">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <p className="text-[11px] uppercase tracking-widest text-cyan-300">
                    Active Workflow
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    Jewelry Campaign
                  </h3>
                </div>

                <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

              </div>

              <div className="space-y-3">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">
                    Generation Progress
                  </span>

                  <span className="text-emerald-300">
                    72%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500" />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-16" id="features">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <p className="mb-4 text-sm font-medium text-cyan-300">
              Platform Features
            </p>

            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Designed for scalable AI-powered product content generation.
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-2">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/5 bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
                >

                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-400/10 via-blue-500/10 to-violet-500/10">
                    <Icon className="h-6 w-6 text-cyan-200" />
                  </div>

                  <h3 className="mb-4 text-xl font-semibold">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-neutral-400">
                    {feature.description}
                  </p>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* Workflow */}
      <section className="border-t border-white/5 py-16">

        <div className="mx-auto max-w-7xl px-6">

          <div className="mx-auto mb-12 max-w-3xl text-center">

            <p className="mb-4 text-sm font-medium text-cyan-300">
              Workflow
            </p>

            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              From upload to approved product assets.
            </h2>

          </div>

          <div className="grid gap-5 md:grid-cols-4">

            {[
              {
                title: 'Upload Product',
                icon: ImagePlus,
              },
              {
                title: 'AI Processing',
                icon: Sparkles,
              },
              {
                title: 'Generate Variations',
                icon: Layers3,
              },
              {
                title: 'Review & Approve',
                icon: ShieldCheck,
              },
            ].map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-3xl border border-white/5 bg-white/[0.03] p-7"
                >

                  <div className="mb-8 flex items-center justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="h-6 w-6 text-cyan-200" />
                    </div>

                    <span className="text-5xl font-bold text-white/5">
                      0{index + 1}
                    </span>

                  </div>

                  <h3 className="text-xl font-semibold leading-snug">
                    {step.title}
                  </h3>

                </div>
              );
            })}

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="border-t border-white/5 py-16">

        <div className="mx-auto max-w-5xl px-6">

          <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-10 text-center md:p-14">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_55%)]" />

            <div className="relative mx-auto max-w-3xl space-y-6">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-neutral-300">
                Ready to build your next campaign?
              </div>

              <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                Start generating premium product visuals today.
              </h2>

              <p className="text-base leading-relaxed text-neutral-400 md:text-lg">
                AI-assisted workflows, background generation and collaborative review systems — all inside one workspace.
              </p>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-medium text-black transition-all hover:bg-neutral-200"
              >
                Start Creating
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* Footer Navigation */}
      <section className="border-t border-white/5 py-10">

        <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">

          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500">
                <Sparkles className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-base font-semibold">
                  Lumora Studio
                </h3>

                <p className="text-xs text-neutral-500">
                  AI Product Visual Platform
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-neutral-500">
              Generate premium AI-powered product visuals with collaborative review workflows and resilient rendering pipelines.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Product
            </h4>

            <div className="space-y-3 text-sm text-neutral-500">
              <p className="cursor-pointer transition-colors hover:text-white">Features</p>
              <p className="cursor-pointer transition-colors hover:text-white">Pricing</p>
              <p className="cursor-pointer transition-colors hover:text-white">AI Workflow</p>
              <p className="cursor-pointer transition-colors hover:text-white">Integrations</p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Company
            </h4>

            <div className="space-y-3 text-sm text-neutral-500">
              <p className="cursor-pointer transition-colors hover:text-white">About</p>
              <p className="cursor-pointer transition-colors hover:text-white">Careers</p>
              <p className="cursor-pointer transition-colors hover:text-white">Contact</p>
              <p className="cursor-pointer transition-colors hover:text-white">Press</p>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-white">
              Resources
            </h4>

            <div className="space-y-3 text-sm text-neutral-500">
              <p className="cursor-pointer transition-colors hover:text-white">Documentation</p>
              <p className="cursor-pointer transition-colors hover:text-white">Support</p>
              <p className="cursor-pointer transition-colors hover:text-white">Privacy Policy</p>
              <p className="cursor-pointer transition-colors hover:text-white">Terms of Service</p>
            </div>
          </div>

        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/5 px-6 pt-6 text-sm text-neutral-600 md:flex-row">
          <p>© 2026 Lumora Studio. All rights reserved.</p>

          <div className="flex items-center gap-5">
            <p className="cursor-pointer transition-colors hover:text-white">Instagram</p>
            <p className="cursor-pointer transition-colors hover:text-white">LinkedIn</p>
            <p className="cursor-pointer transition-colors hover:text-white">Twitter</p>
          </div>
        </div>

      </section>

    </main>
  );
}
