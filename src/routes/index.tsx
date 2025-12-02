import { createFileRoute, Link, useRouteContext } from '@tanstack/react-router';
import { Route as dashboardRoute } from './dashboard';

export const Route = createFileRoute('/')({
  component: RouteComponent,
});

function RouteComponent() {

  const { session } = useRouteContext({ from: '/' });
  console.log('Home route auth context:', session);

  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <Link to={dashboardRoute.to}>Go to Dashboard</Link>
    </div>
  );
}
