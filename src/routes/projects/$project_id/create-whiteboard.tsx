import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/projects/$project_id/create-whiteboard')(
  {
    component: RouteComponent,
  },
)

function RouteComponent() {
  return <div>Hello "/projects/$project_id/create-whiteboard"!</div>
}
