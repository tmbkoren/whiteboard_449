import { type Session } from '@supabase/supabase-js';
export const getProjectData = async (
    session: Session | null,
    projectId: string
) => {
    console.log(`Fetching data for project ${projectId}`);
    if (!session) {
        throw new Error('User is not authenticated');
    }
    const res = await fetch(`/api/get-project/${projectId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch project data');
    }
    return res.json();
};