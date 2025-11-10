import { Link, useRouter } from '@tanstack/react-router';
import { Route } from '../../routes/__root';
import { Route as loginRoute } from '../../routes/login';
import { useEffect, useState } from 'react';
import supabase from '../../utils/supabase';

export default function Navbar() {
  const { session } = Route.useLoaderData();
  const router = useRouter();
  const [user, setUser] = useState(session?.user || null);

  useEffect(() => {
    setUser(session?.user || null);
  }, [session]);

  return (
    <nav className='nav-bar'>
      <div className='nav-left'>
        <Link to='/'>HOME</Link>
      </div>

      <div className='nav-right'>
        {user ? (
          <div className='user-block'>
            <span>Welcome, {user.email}!</span>
            {/* Logout with confirmation */}
            <button
              className='nav-button logout-btn'
              onClick={async () => {
                const ok = window.confirm('Are you sure you want to log out?');
                if (ok) {
                  try {
                    await supabase.auth.signOut();
                    router.invalidate();
                  } catch (e) {
                    console.error('Logout failed', e);
                  }
                }
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className='auth-links'>
            <Link
              to={loginRoute.to}
              className='nav-button'
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
