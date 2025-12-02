import { Link } from '@tanstack/react-router';

interface WhiteboardCardProps {
  project_id: string;
  whiteboard_id: string;
  whiteboard_name: string;
}

export default function WhiteboardCard({
  project_id,
  whiteboard_id,
  whiteboard_name,
}: WhiteboardCardProps) {
  return (
    <Link
      key={whiteboard_id}
      className='whiteboard-card'
      role='listitem'
      tabIndex={0}
      to={`/projects/$project_id/whiteboards/$whiteboard_id`}
      params={{ project_id, whiteboard_id }}
    >
      <div className='whiteboard-card__content'>
        <div className='whiteboard-card__fields'>
          <div className='whiteboard-card__field whiteboard-card__title'>
            <h3 style={{ margin: 0 }}>{whiteboard_name}</h3>
          </div>
        </div>
      </div>

      <div
        className='whiteboard-card__actions'
        style={{ marginTop: 12 }}
      ></div>
    </Link>
  );
}
