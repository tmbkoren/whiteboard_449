import { type Session } from '@supabase/supabase-js';

export const createProject = async (
  session: Session | null,
  projectName: string
) => {
  console.log(
    'Creating project with session:',
    session,
    'and projectName:',
    projectName
  );
  if (!session) {
    throw new Error('User is not authenticated');
  }
  const res = await fetch('/api/create-project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ project_name: projectName }),
  });
  if (!res.ok) {
    throw new Error('Failed to create project');
  }
  return await res.json();
};
