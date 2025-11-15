import { type Session } from '@supabase/supabase-js';

export const getProjects = async (session: Session | null) => {
  console.log('Fetching projects with session:', session);
  if (!session) {
    throw new Error('User is not authenticated');
  }
  const res = await fetch('/api/get-projects', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch projects');
  }
  return await res.json();
};
