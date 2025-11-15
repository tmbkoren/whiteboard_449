import { createFileRoute, redirect } from '@tanstack/react-router'
import isOnboarded from '../utils/backendCalls/isOnboarded';

export const Route = createFileRoute('/profile-setup')({
  component: RouteComponent,
  beforeLoad: async ({context}) => {
    if (!context.session) {
      throw redirect({to: '/login' });
    }
    const onboarded = await isOnboarded(context.session);
    if (onboarded) {
      throw redirect({ to: '/' });
    }
  }
})

function RouteComponent() {
  return <div>Hello "/profile-setup"!</div>
}
