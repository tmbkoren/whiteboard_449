import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as needed
import { useState } from 'react';
import type { FormEvent } from 'react';

export const Route = createFileRoute('/login')({
  component: Login,
})



function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirect to home after successful login
      navigate({ to: '/' });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
      console.error('Login error:', err);
    }
  };

  return (
    <div className="account-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="account-form">
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
      {/*<form>
        <button type='button' onClick={() => signOut(auth)}>
          Logout
        </button>
      </form> */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p className="account-note">New user? <Link to="/signup">Sign up here</Link></p>
    </div>
  );
}

export default Login;
