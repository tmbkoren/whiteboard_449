import { Link } from '@tanstack/react-router';

interface ProjectCardProps {
  project_id: string;
  project_name: string;
  role: 'owner' | 'editor' | 'viewer';
}

export default function ProjectCard({
  project_id,
  project_name,
  role,
}: ProjectCardProps) {
  return (
    <Link
      key={project_id}
      className='project-card'
      role='listitem'
      tabIndex={0}
      to={`/projects/$project_id/dashboard`}
      params={{ project_id }}
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
        </div>
      </div>

      <div
        className='project-card__actions'
        style={{ marginTop: 12 }}
      ></div>
    </Link>
  );
}
