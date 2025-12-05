import { type Session } from "@supabase/supabase-js";

export async function getWhiteboardData(session: Session | null, whiteboardId: string) {
  if (!session) {
    throw new Error("No active session");
  }

  const response = await fetch(`/api/get-whiteboard/${whiteboardId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch whiteboard data");
  }

  return response.json();
}
