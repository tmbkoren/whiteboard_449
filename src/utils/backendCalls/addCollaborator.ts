import { type Session } from '@supabase/supabase-js';

export const addCollaborator = async (
  session: Session | null,
  projectId: string,
  collaboratorUsername: string,
  role: 'viewer' | 'editor'
) => {
  console.log(
    `Adding collaborator ${collaboratorUsername} with role ${role} to project ${projectId}`
  );
  if (!session) {
    throw new Error('User is not authenticated');
  }
  const res = await fetch('/api/add-collaborator', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      collaborator_username: collaboratorUsername,
      role: role,
    }),
  });
  if (!res.ok) {
    throw new Error('Failed to add collaborator');
  }
  return await res.json();
};
