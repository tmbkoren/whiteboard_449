import './project.css';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { getProjects } from '../../utils/backendCalls/getProjects';
import ProjectCard from './-components/ProjectCard';
import type { UserProject } from '../../utils/types/global.types';

export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
  loader: async ({ context }) => {
    const projects = (await getProjects(context.session)).projects;
    return { projects };
  },
});

function RouteComponent() {
  const projects = useLoaderData({ from: '/projects/' }).projects as UserProject[];
  console.log('Loaded projects:', projects);

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div className='projects-title-card'>
          <h2>Projects</h2>
        </div>
      </div>

      <div
        className='project-grid'
        role='list'
      >
        {projects.map((item) => (
          <ProjectCard
            key={item.project_id}
            project_id={item.project_id}
            project_name={item.project_name}
            role={item.role}
            owner_username={item.owner_username}
          />
        ))}
      </div>
    </div>
  );
}

export default RouteComponent;
