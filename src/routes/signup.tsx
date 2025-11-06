import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Adjust path as needed

export const Route = createFileRoute('/signup')({
  component: Signup,
})


function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Successfully registered!');
      // Redirect or update UI
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="account-page">
      <h2>Sign Up</h2>
      <form onSubmit={handleSignup} className="account-form">
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
        <button type='submit'>Sign Up</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <p className="account-note">Not a new user? <Link to="/login">Login here</Link></p>
    </div>
  );
}

export default Signup;
