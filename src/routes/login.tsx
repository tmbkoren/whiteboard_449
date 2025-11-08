import { createFileRoute, redirect } from '@tanstack/react-router'
import supabase from '../utils/supabase';

export const Route = createFileRoute('/login')({
  component: Login,
})



async function Login() {
  async function loginWithGoogle(e) {
    e.preventDefault()
    //const origin = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `http://localhost:5173/auth/callback`,
      },
    });

    console.log('OAuth response:', { data, error });

    if (error) {
      console.error(error);
      //throw redirect({ to: '/login' });
    }

    if (data.url) {
      console.log('Redirecting to:', data.url);
      //throw redirect({ to: data.url });
    }
  }
  return (
    <div className="account-page">
      <h2>Login</h2>
      <form onSubmit={loginWithGoogle} className="account-form">
      
        <button type='submit'>Login with Google</button>
      </form>
    </div>
  );
}

export default Login;
