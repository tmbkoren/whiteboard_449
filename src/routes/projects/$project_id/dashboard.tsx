import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { useState } from 'react';
import { addCollaborator } from '../../../utils/backendCalls/addCollaborator';
import { getProjectData } from '../../../utils/backendCalls/getProjectData';

export const Route = createFileRoute('/projects/$project_id/dashboard')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    console.log('Loading project with ID:', params.project_id);
    const projectData = await getProjectData(
      context.session,
      params.project_id
    );
    console.log('Fetched project data:', projectData);
    return {
      session: context.session,
      project_id: params.project_id,
      projectData: projectData.project,
    };
  },
});

function RouteComponent() {
  const { session, project_id, projectData } = useLoaderData({
    from: '/projects/$project_id/dashboard',
  });
  const [collaborator, setCollaborator] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addCollaborator(session, project_id, collaborator, role);
      alert('Collaborator added successfully');
    } catch (error) {
      console.log('Error adding collaborator:', error);
      alert('Failed to add collaborator');
    }
  };
  return (
    <div>
      <h2>Project name: {projectData.project_name}</h2>
      <br />
      <h5>Add a collaborator:</h5>
      <form onSubmit={handleSubmit}>
        <label htmlFor='username'>Collaborator username:</label>
        <input
          type='text'
          id='username'
          name='username'
          value={collaborator}
          onChange={(e) => setCollaborator(e.target.value)}
        />
        <br />
        <input
          type='radio'
          id='viewer'
          name='role'
          value='viewer'
        />
        <label htmlFor='viewer'>Viewer</label>
        <input
          type='radio'
          id='editor'
          name='role'
          value='editor'
          checked={role === 'editor'}
          onChange={() => setRole('editor')}
        />
        <label htmlFor='editor'>Editor</label>
        <br />
        <button type='submit'>Add Collaborator</button>
      </form>
    </div>
  );
}
