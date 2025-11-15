import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context }) => {
    console.log('Dashboard loader context:', context.session?.access_token);
    const res = await fetch('http://localhost:8000/protected-route', {
      headers: {
        Authorization: `Bearer ${context.session?.access_token}`,
      },
    });
    const data = await res.json();
    console.log('Protected route data:', data);
    return {
      protectedData: data,
    };
  },
});

function RouteComponent() {
  const data = Route.useLoaderData().protectedData;
  console.log('Loader data in component:', data);
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Server response: {data.message}</p>
      <p>User email: {data.user.user.email}</p>
    </div>
  );
}
