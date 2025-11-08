import { Outlet, createRootRoute } from '@tanstack/react-router';
import Navbar from '../components/Navbar/Navbar';


export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}
