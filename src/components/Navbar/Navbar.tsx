import { Link } from '@tanstack/react-router';
import supabase from '../../utils/supabase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    }
    fetchUser();
  }, []);

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
              to='/login'
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
