import {
  Outlet,
  createRootRouteWithContext,
  redirect,
  useRouter,
} from '@tanstack/react-router';
import Navbar from '../components/Navbar/Navbar';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { type RouterContext } from '../utils/types/global.types';
import { useEffect } from 'react';
import supabase from '../utils/supabase';
import isOnboarded from '../utils/backendCalls/isOnboarded';

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const isAuthenticated = !!session;

    const isAuthPage =
      location.pathname === '/login' || location.pathname === '/auth/callback';
    const isProfileSetupPage = location.pathname === '/profile-setup';

    // 1. If user is not logged in and not on an auth page, redirect to login
    if (!isAuthenticated && !isAuthPage) {
      throw redirect({
        to: '/login',
      });
    }

    // 2. If user IS logged in, check if they have a username
    if (isAuthenticated) {
      const onboarded = await isOnboarded(session); // This is our new check

      // 2a. If they are NOT onboarded and not on the setup page, force them there
      if (!onboarded && !isProfileSetupPage) {
        throw redirect({
          to: '/profile-setup',
        });
      }

      // 2b. If they ARE onboarded and are trying to access login or setup, send them to the dashboard
      if (onboarded && (isProfileSetupPage || isAuthPage)) {
        throw redirect({
          to: '/dashboard',
        });
      }
    }
  },
  loader: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return { session };
  },
  component: RootComponent,
});

function RootComponent() {
  const router = useRouter();
  const { session } = Route.useLoaderData();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('User signed in or token refreshed');
        if (
          session?.access_token !== router.options.context.session?.access_token
        ) {
          router.invalidate();
        }
      }
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to login');
        router.invalidate().then(() => {
          router.navigate({ to: '/login' });
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Redirect logic is now handled here based on loader data
  const isAuthenticated = !!session;
  const currentPath = router.state.location.pathname;
  const isAuthPage =
    currentPath === '/login' || currentPath === '/auth/callback';

  useEffect(() => {
    if (!isAuthenticated && !isAuthPage) {
      router.navigate({ to: '/login' });
    }
    if (isAuthenticated && isAuthPage) {
      router.navigate({ to: '/' });
    }
  }, [isAuthenticated, isAuthPage, router]);

  return (
    <>
      <Navbar />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
