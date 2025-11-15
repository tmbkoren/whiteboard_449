import { type Session } from '@supabase/supabase-js';

const isOnboarded = async (session: Session | null) => {
    const res = await fetch('/api/check-onboarded', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await res.json();
    return data.isOnboarded;
};

export default isOnboarded;