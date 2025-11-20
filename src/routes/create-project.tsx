import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { useState } from 'react';
import { createProject } from '../utils/backendCalls/createProject';

export const Route = createFileRoute('/create-project')({
  component: RouteComponent,
  loader: async ({ context }) => {
    return { session: context.session };
  },
});

function RouteComponent() {
  const [projectName, setProjectName] = useState('');
  const { session } = useLoaderData({ from: '/create-project' });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating project:', projectName);
    const res = await createProject(session, projectName);
    console.log('Project created:', res);
  };
  return (
    <div>
      <h1>Create Project</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor='projectName'>Project Name:</label>
        <input
          type='text'
          id='projectName'
          name='projectName'
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
        <br />
        <button type='submit'>Create</button>
      </form>
    </div>
  );
}
