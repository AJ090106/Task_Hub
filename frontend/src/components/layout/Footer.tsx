'use client';

import React from 'react';

import {
  Sparkles,
} from 'lucide-react';

export default function Footer() {

  return (
    <section className="mt-16 border-t border-white/5 py-12">

      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">

        {/* Brand */}
        <div className="space-y-4 md:col-span-1">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/10">

              <Sparkles className="h-5 w-5 text-white" />

            </div>

            <div>

              <h3 className="text-lg font-semibold text-white">
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

        {/* Product */}
        <div>

          <h4 className="mb-5 text-sm font-semibold text-white">
            Product
          </h4>

          <div className="space-y-3 text-sm text-neutral-500">

            <p className="cursor-pointer transition-colors hover:text-white">
              Features
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              AI Workflow
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Integrations
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Pricing
            </p>

          </div>

        </div>

        {/* Company */}
        <div>

          <h4 className="mb-5 text-sm font-semibold text-white">
            Company
          </h4>

          <div className="space-y-3 text-sm text-neutral-500">

            <p className="cursor-pointer transition-colors hover:text-white">
              About
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Careers
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Contact
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Press
            </p>

          </div>

        </div>

        {/* Resources */}
        <div>

          <h4 className="mb-5 text-sm font-semibold text-white">
            Resources
          </h4>

          <div className="space-y-3 text-sm text-neutral-500">

            <p className="cursor-pointer transition-colors hover:text-white">
              Documentation
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Support
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Privacy Policy
            </p>

            <p className="cursor-pointer transition-colors hover:text-white">
              Terms of Service
            </p>

          </div>

        </div>

      </div>

      {/* Bottom */}
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-white/5 px-6 pt-6 text-sm text-neutral-600 md:flex-row">

        <p>
          © 2026 Lumora Studio. All rights reserved.
        </p>

        <div className="flex items-center gap-6">

          <p className="cursor-pointer transition-colors hover:text-white">
            Instagram
          </p>

          <p className="cursor-pointer transition-colors hover:text-white">
            LinkedIn
          </p>

          <p className="cursor-pointer transition-colors hover:text-white">
            Twitter
          </p>

        </div>

      </div>

    </section>
  );
}