import {
  createFileRoute,
  redirect,
  useLoaderData,
  useRouteContext,
  useRouter,
} from '@tanstack/react-router';
import isOnboarded from '../utils/backendCalls/isOnboarded';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/profile-setup')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/login' });
    }
    const onboarded = await isOnboarded(context.session);
    if (onboarded) {
      throw redirect({ to: '/' });
    }
  },
  loader: async ({ context }) => {
    return { session: context.session };
  },
});

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function RouteComponent() {
  const { session } = useLoaderData({ from: '/profile-setup' });
  console.log('ProfileSetup RouteComponent session:', session);
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debouncedUsername = useDebounce(username, 500);
  const [availability, setAvailability] = useState<{
    status: 'idle' | 'checking' | 'available' | 'unavailable';
    message: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    if (debouncedUsername.length < 3) {
      setAvailability({ status: 'idle', message: '' });
      return;
    }

    const checkUsername = async () => {
      setAvailability({ status: 'checking', message: 'Checking...' });
      try {
        const res = await fetch(
          `/api/users/check-username-availability?username=${debouncedUsername}`
        );
        const data = await res.json();
        console.log('Username availability response:', data);
        if (data.isAvailable) {
          setAvailability({
            status: 'available',
            message: 'Username is available!',
          });
        } else {
          setAvailability({
            status: 'unavailable',
            message: 'Username is already taken.',
          });
        }
      } catch (err) {
        setAvailability({
          status: 'unavailable',
          message: 'Error checking username.' + err,
        });
      }
    };

    checkUsername();
  }, [debouncedUsername]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (availability.status !== 'available') {
      setError('Please choose an available username.');
      return;
    }

    setIsLoading(true);

    try {
      if (!session) throw new Error('Not authenticated');
      const res = await fetch('/api/users/me/set-username', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.log('Error response from set-username:', errorData);
        throw new Error(errorData.detail || 'Failed to set username.');
      }

      // SUCCESS! Invalidate the router to re-run the root loader
      // which will now find the user is onboarded and redirect them.
      await router.invalidate();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Profile Setup</h1>
      <p>Please complete your profile setup.</p>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            id='username'
            type='text'
            name='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            minLength={3}
            required
          />
        </label>
        <br />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <p>{availability.message}</p>
        <button
          type='submit'
          disabled={isLoading || availability.status !== 'available'}
        >
          {isLoading ? 'Saving...' : 'Complete Setup'}
        </button>
      </form>
    </>
  );
}
