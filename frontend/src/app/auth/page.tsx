'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { Sparkles } from 'lucide-react';

import { toast } from 'sonner';

import { supabase } from '@/utils/supabase';

export default function AuthPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [isLoginMode, setIsLoginMode] =
    useState(true);

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [fullName, setFullName] =
    useState('');

  // -----------------------------------------
  // Check Existing Session
  // -----------------------------------------

  useEffect(() => {

    checkSession();

  }, []);

  const checkSession =
    async () => {

      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      if (session) {

        router.push('/dashboard');
      }
    };

  // -----------------------------------------
  // Create Profile
  // -----------------------------------------

  const createProfile =
    async (
      userId: string,
      userEmail: string,
      name: string
    ) => {

      try {

        const { error } =
          await supabase
            .from('profiles')
            .upsert({

              id: userId,

              email: userEmail,

              full_name:
                name ||

                userEmail
                  .split('@')[0],

              role: 'user',
            });

        if (error) {

          console.error(error);

          toast.error(
            'Profile creation failed'
          );
        }

      } catch (error) {

        console.error(error);
      }
    };

  // -----------------------------------------
  // Google Login
  // -----------------------------------------

  const handleGoogleLogin =
    async () => {

      try {

        setLoading(true);

        await supabase.auth.signInWithOAuth({

          provider: 'google',

          options: {

            redirectTo:
              'http://localhost:3000/dashboard',
          },
        });

      } catch (error) {

        console.error(
          'Google Login Error:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // -----------------------------------------
  // GitHub Login
  // -----------------------------------------

  const handleGithubLogin =
    async () => {

      try {

        setLoading(true);

        await supabase.auth.signInWithOAuth({

          provider: 'github',

          options: {

            redirectTo:
              'http://localhost:3000/dashboard',
          },
        });

      } catch (error) {

        console.error(
          'GitHub Login Error:',
          error
        );

      } finally {

        setLoading(false);
      }
    };

  // -----------------------------------------
  // Email Auth
  // -----------------------------------------

  const handleEmailAuth =
    async () => {

      try {

        setLoading(true);

        if (
          !email ||
          !password
        ) {

          toast.error(
            'Please enter email and password'
          );

          return;
        }

        // LOGIN
        if (isLoginMode) {

          const {
            error,
          } =
            await supabase.auth.signInWithPassword({

              email,

              password,
            });

          if (error) {

            toast.error(
              error.message
            );

            return;
          }

          toast.success(
            'Login successful'
          );

        }

        // SIGNUP
        else {

          const {

            data: authData,

            error,

          } =
            await supabase.auth.signUp({

              email,

              password,
            });

          if (error) {

            toast.error(
              error.message
            );

            return;
          }

          // CREATE PROFILE
          if (
            authData.user
          ) {

            await createProfile(

              authData.user.id,

              authData.user.email ||

                email,

              fullName
            );
          }

          toast.success(
            'Account created successfully'
          );
        }

        router.push('/dashboard');

      } catch (error) {

        console.error(
          'Email Auth Error:',
          error
        );

        toast.error(
          'Authentication failed'
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <main className="flex min-h-screen items-center justify-center bg-[#070B14] px-6 text-white">

      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-3xl" />

      </div>

      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">

        {/* Logo */}
        <div className="mb-8 flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-violet-500 shadow-lg shadow-cyan-500/20">

            <Sparkles className="h-5 w-5" />

          </div>

          <div>

            <h1 className="text-lg font-semibold">

              Lumora Studio

            </h1>

            <p className="text-sm text-neutral-400">

              AI Product Visual Platform

            </p>

          </div>

        </div>

        {/* Heading */}
        <div className="mb-8 space-y-3">

          <h2 className="text-3xl font-bold leading-tight">

            {isLoginMode

              ? 'Welcome back'

              : 'Create your account'}

          </h2>

          <p className="text-sm leading-relaxed text-neutral-400">

            Access your AI-powered jewellery generation workspace.

          </p>

        </div>

        {/* Inputs */}
        <div className="space-y-4">

          {!isLoginMode && (

            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-cyan-400/40"
            />

          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-cyan-400/40"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-500 focus:border-cyan-400/40"
          />

        </div>

        {/* Main Button */}
        <button
          onClick={handleEmailAuth}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200 disabled:opacity-60"
        >

          {loading

            ? 'Please wait...'

            : isLoginMode

            ? 'Sign In'

            : 'Create Account'}

        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">

          <div className="h-px flex-1 bg-white/10" />

          <span className="text-xs text-neutral-500">

            OR

          </span>

          <div className="h-px flex-1 bg-white/10" />

        </div>

        {/* OAuth */}
        <div className="space-y-3">

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-60"
          >

            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5 w-5"
            />

            Continue with Google

          </button>

          {/* GitHub */}
          <button
            onClick={handleGithubLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-60"
          >

            <img
              src="https://www.svgrepo.com/show/512317/github-142.svg"
              alt="GitHub"
              className="h-5 w-5 invert"
            />

            Continue with GitHub

          </button>

        </div>

        {/* Toggle */}
        <button
          onClick={() =>
            setIsLoginMode(
              !isLoginMode
            )
          }
          className="mt-6 w-full text-sm text-neutral-400 transition-colors hover:text-white"
        >

          {isLoginMode

            ? "Don't have an account? Create one"

            : 'Already have an account? Sign in'}

        </button>

      </div>

    </main>
  );
}