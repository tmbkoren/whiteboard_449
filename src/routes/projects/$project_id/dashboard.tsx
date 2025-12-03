import { createFileRoute, useLoaderData } from '@tanstack/react-router';
import { useState } from 'react';
import { addCollaborator } from '../../../utils/backendCalls/addCollaborator';
import { getProjectData } from '../../../utils/backendCalls/getProjectData';
import { getProjectWhiteboards } from '../../../utils/backendCalls/getProjectWhiteboards';
import { createWhiteboard } from '../../../utils/backendCalls/createWhiteboard';
import WhiteboardCard from '../-components/WhiteboardCard';

export const Route = createFileRoute('/projects/$project_id/dashboard')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    console.log('Loading project with ID:', params.project_id);
    const projectData = await getProjectData(
      context.session,
      params.project_id
    );
    const whiteboardData = await getProjectWhiteboards(
      context.session,
      params.project_id
    );

    console.log('Fetched project data:', projectData);
    console.log('Fetched whiteboard data:', whiteboardData);
    return {
      session: context.session,
      project_id: params.project_id,
      projectData: projectData.project,
      whiteboardData: whiteboardData.whiteboards,
    };
  },
});

function RouteComponent() {
  const { session, project_id, projectData, whiteboardData } = useLoaderData({
    from: '/projects/$project_id/dashboard',
  });
  const [filter, setFilter] = useState('');
  const [collaborator, setCollaborator] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [newWhiteboardName, setNewWhiteboardName] = useState('');
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

  const handleNewWhiteboard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWhiteboard(session, project_id, newWhiteboardName);
      alert('Whiteboard created successfully');
    } catch (error) {
      console.log('Error creating whiteboard:', error);
      alert('Failed to create whiteboard');
    }
    
  };

  return (
    <div>
      <h2>Project name: {projectData.project_name}</h2>
      {whiteboardData && whiteboardData.length > 0 ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ margin: 0 }}>Whiteboards:</h3>
            <input
              type="text"
              placeholder="Filter whiteboards..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', fontSize: '1rem' }}
            />
          </div>
          {whiteboardData.filter((wb: any) =>
            wb.whiteboard_name.toLowerCase().includes(filter.toLowerCase())
          ).length > 0 ? (
            <ul>
              {whiteboardData
                .filter((wb: any) =>
                  wb.whiteboard_name
                    .toLowerCase()
                    .includes(filter.toLowerCase())
                )
                .map((wb: any) => (
                  <WhiteboardCard
                    key={wb.whiteboard_id}
                    project_id={project_id}
                    whiteboard_id={wb.whiteboard_id}
                    whiteboard_name={wb.whiteboard_name}
                  />
                ))}
            </ul>
          ) : (
            <p>No whiteboards found.</p>
          )}
        </div>
      ) : (
        <p>No whiteboards found.</p>
      )}
      <h5>Create a new whiteboard: </h5>
      <form onSubmit={handleNewWhiteboard}>
        <label htmlFor='whiteboardName'>Whiteboard Name:</label>
        <input
          type='text'
          id='whiteboardName'
          name='whiteboardName'
          value={newWhiteboardName}
          onChange={(e) => setNewWhiteboardName(e.target.value)}
        />
        <button type='submit'>Create Whiteboard</button>
      </form>
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
