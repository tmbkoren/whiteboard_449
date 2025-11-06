import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useState, useEffect } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      console.log('Auth state changed. Current user:', user);
      if (user) {
        const idToken = await user.getIdToken();
        console.log('Firebase ID Token:', idToken);
        try {
          const response = await fetch('http://127.0.0.1:8000/protected-route', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          });
          const data = await response.json();
          console.log('Response from protected backend route:', data);
        } catch (error) {
          console.error('Error calling protected backend route:', error);
        }
      } else {
        console.log('No user is logged in.');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <nav className="nav-bar">
        <div className="nav-left">
          <Link to="/">HOME</Link>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="user-block">
              <span>Welcome, {user.email}!</span>
              {/* Logout with confirmation */}
              <button
                className="nav-button logout-btn"
                onClick={async () => {
                  const ok = window.confirm('Are you sure you want to log out?');
                  if (ok) {
                    try {
                      await signOut(auth);
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
            <div className="auth-links">
              <Link to="/login" className="nav-button">Login</Link>
              <Link to="/signup" className="nav-button">Signup</Link>
            </div>
          )}
        </div>
      </nav>

      <Outlet />
    </div>
  );
}
