import { createFileRoute } from '@tanstack/react-router';
import supabase from '../utils/supabase';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  async function loginWithGoogle(e: React.FormEvent) {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:5173/auth/callback`,
      },
    });

    if (error) {
      console.error('Error logging in:', error);
      // TODO: Show an error message to the user
      return;
    }

    if (data.url) {
      window.location.href = data.url;
    }
  }
  return (
    <div className='account-page'>
      <h2>Login</h2>
      <form
        onSubmit={loginWithGoogle}
        className='account-form'
      >
        <button type='submit'>Login with Google</button>
      </form>
    </div>
  );
}

