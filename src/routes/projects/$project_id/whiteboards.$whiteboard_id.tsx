import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/projects/$project_id/whiteboards/$whiteboard_id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/projects/$project_id/whiteboards/$whiteboardId"!</div>
}
