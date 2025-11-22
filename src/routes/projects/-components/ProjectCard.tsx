import { Link } from '@tanstack/react-router';

interface ProjectCardProps {
  project_id: string;
  project_name: string;
  role: 'owner' | 'editor' | 'viewer';
  owner_username?: string | null;
}

export default function ProjectCard({
  project_id,
  project_name,
  role,
  owner_username,
}: ProjectCardProps) {
  return (
    <Link
      key={project_id}
      className='project-card'
      role='listitem'
      tabIndex={0}
      to={`/projects/${project_id}`}
    >
      <div className='project-card__content'>
        <div className='project-card__fields'>
          <div className='project-card__field project-card__title'>
            <h3 style={{ margin: 0 }}>{project_name}</h3>
          </div>
          <div className='project-card__field'>
            <span className='role-label'>Role:</span>{' '}
            <span className={`project-card__role role-${role}`}>{role}</span>
          </div>
          {owner_username && role !== 'owner' && (
            <div className='project-card__field'>
              <span className='owner-label'>Owner:</span>{' '}
              <span className='project-card__owner'>{owner_username}</span>
            </div>
          )}
        </div>
      </div>

      <div
        className='project-card__actions'
        style={{ marginTop: 12 }}
      ></div>
    </Link>
  );
}
