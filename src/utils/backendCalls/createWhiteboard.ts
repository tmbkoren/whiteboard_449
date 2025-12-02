import { type Session } from '@supabase/supabase-js';

export const createWhiteboard = async (
  session: Session | null,
  projectId: string,
  whiteboardName: string
) => {
  console.log(`Creating whiteboard ${whiteboardName} for project ${projectId}`);
  if (!session) {
    throw new Error('User is not authenticated');
  }
  const res = await fetch('/api/create-whiteboard', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      whiteboard_name: whiteboardName,
    }),
  });
};
