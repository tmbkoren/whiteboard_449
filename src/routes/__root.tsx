import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useState } from 'react';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const [user, setUser] = useState(auth.currentUser);
  console.log('Current user in RootComponent:', user);
  onAuthStateChanged(auth, async (user) => {
    setUser(user);
    console.log('Auth state changed. Current user:', user);
    if (user) {
      const idToken = await user.getIdToken();
      console.log('Firebase ID Token:', idToken);

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/protected-route',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();
        console.log('Response from protected backend route:', data);
      } catch (error) {
        console.error('Error calling protected backend route:', error);
      }
    } else {
      console.log('No user is logged in.');
    }
  });
  return (
    <div>
      {user && <span>Welcome, {user.email}!</span>}
      <Link to='/'>Home</Link> | <Link to='/login'>Login Page</Link> | <Link to='/signup'>Signup Page</Link>
      <Outlet />
    </div>
  );
}
