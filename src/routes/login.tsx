import { createFileRoute, redirect } from '@tanstack/react-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as needed
import { useState } from 'react';

export const Route = createFileRoute('/login')({
  component: Login,
})



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return redirect({
        to: '/',
      })
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type='submit'>Login</button>
      </form>
      <form>
        <button type='button' onClick={() => signOut(auth)}>
          Logout
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
