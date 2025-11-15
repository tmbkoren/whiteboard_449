import { type Session } from '@supabase/supabase-js';

const isOnboarded = async (session: Session | null) => {
    console.log('Checking if user is onboarded with session:', session);
    if (!session) {
        return false;
    }
    const res = await fetch('/api/check-onboarded', {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
        },
    });
    console.log('Response from /api/check-onboarded:', res);
    const data = await res.json();
    console.log('Onboarded check result:', data);
    return data.isOnboarded;
};

export default isOnboarded;