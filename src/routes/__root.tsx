import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
} from '@tanstack/react-router';
import Navbar from '../components/Navbar/Navbar';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { type RouterContext } from '../utils/types/global.types';
import { useEffect } from 'react';
import supabase from '../utils/supabase';

export const Route = createRootRouteWithContext<RouterContext>()({
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
