import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router';
import App from '../App';

export const Route = createFileRoute('/temp')({
  beforeLoad: async ({context}) => {
    if (!context.session) {
      throw redirect({to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { session } = useRouteContext({ from: '__root__' });
  console.log(session);

  if (!session) {
    navigate({ to: '/login' });
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.email}!</h1>
      <App />
    </div>
  );
}
