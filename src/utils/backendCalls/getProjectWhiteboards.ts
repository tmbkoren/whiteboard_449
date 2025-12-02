import {type Session} from '@supabase/supabase-js';

export const getProjectWhiteboards = async (
    session: Session | null,
    projectId: string
) => {
    console.log(
        'Fetching whiteboards for project with session:',
        session,
        'and projectId:',
        projectId
    );
    if (!session) {
        throw new Error('User is not authenticated');
    }
    const res = await fetch(`/api/get-whiteboards/${projectId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
        },
    });
    if (!res.ok) {
        throw new Error('Failed to fetch project whiteboards');
    }

    const whiteboardsData = await res.json();

    return whiteboardsData;
}