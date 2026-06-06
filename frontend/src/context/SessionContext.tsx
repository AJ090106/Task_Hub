'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { Session } from '@/types';
import { supabase } from '@/utils/supabase';

interface SessionContextType {

  session: Session | null;

  setSession: React.Dispatch<
    React.SetStateAction<
      Session | null
    >
  >;

  loading: boolean;
}

const SessionContext =
  createContext<
    SessionContextType | undefined
  >(undefined);

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  // -----------------------------------------
  // Hydrate user session
  // -----------------------------------------
  useEffect(() => {

    const hydrateSession =
      async () => {

        try {

          const {
            data: { session: authSession },
          } =
            await supabase.auth.getSession();

          if (!authSession?.user) {

            setLoading(false);
            return;
          }

          const authUser =
            authSession.user;

          // Fetch profile role
          const { data: profile } =
            await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

          setSession({
            id: authUser.id,
            email:
              authUser.email || '',
            name:
              profile?.full_name ||
              authUser.user_metadata
                ?.full_name ||
              'Workspace User',
            role:
              profile?.role || 'user',
          });

        } catch (error) {

          console.error(
            'Session hydration failed:',
            error
          );

        } finally {

          setLoading(false);

        }
      };

    hydrateSession();

    // Auth listener
    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (_event, authSession) => {

          if (!authSession?.user) {

            setSession(null);
            return;
          }

          const authUser =
            authSession.user;

          const { data: profile } =
            await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .single();

          setSession({
            id: authUser.id,
            email:
              authUser.email || '',
            name:
              profile?.full_name ||
              authUser.user_metadata
                ?.full_name ||
              'Workspace User',
            role:
              profile?.role || 'user',
          });
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };

  }, []);

  return (
    <SessionContext.Provider
      value={{
        session,
        setSession,
        loading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => {

  const context =
    useContext(SessionContext);

  if (!context) {

    throw new Error(
      'useSession must be used within SessionProvider'
    );
  }

  return context;
};