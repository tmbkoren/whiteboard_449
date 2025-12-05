import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router';
import { getWhiteboardData } from '../../../utils/backendCalls/getWhiteboardData';
import { useEffect, useState } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useDebouncedCallback } from 'use-debounce';

export const Route = createFileRoute(
  '/projects/$project_id/whiteboards/$whiteboard_id'
)({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/login' });
    }
  },
  loader: async ({ context, params }) => {
    console.log(
      'Loading whiteboard with ID:',
      params.whiteboard_id,
      'for project ID:',
      params.project_id
    );
    const whiteboardData = await getWhiteboardData(
      context.session,
      params.whiteboard_id
    );

    console.log('Fetched whiteboard data:', whiteboardData);
    return {
      session: context.session,
      project_id: params.project_id,
      whiteboard_id: params.whiteboard_id,
      whiteboardData: whiteboardData,
    };
  },
});

function RouteComponent() {
  const { session, project_id, whiteboard_id, whiteboardData } = useLoaderData({
    from: '/projects/$project_id/whiteboards/$whiteboard_id',
  });
  console.log('Whiteboard Data in Component:', whiteboardData.whiteboard.app_state);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [elements, setElements] = useState<any[]>(
    whiteboardData.whiteboard.elements || []
  );
  const [appState, setAppState] = useState<any>(whiteboardData.whiteboard.app_state || {});
  const [files, setFiles] = useState<any[]>(whiteboardData.whiteboard.files || []);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // useEffect(() => {
  //   if (excalidrawAPI) {
  //     excalidrawAPI.updateScene({
  //       elements,
  //       appState,
  //       files,
  //     });
  //   }
  // }, [excalidrawAPI, elements, appState, files]);

  useEffect(() => {
    if (session) {
      const socket = new WebSocket(
        `ws://localhost:8000/ws/whiteboard/${whiteboard_id}/${session.user.id}`
      );

      socket.onopen = () => {
        setConnectionStatus('Connected');
      };

      socket.onmessage = (event) => {
        console.log('Received WebSocket message:', event.data);
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket data:', data);
        if (data.type === 'WHITEBOARD_UPDATE') {
          const { elements: newElements, appState: newAppState } = data;
          setElements(newElements);
          setAppState(newAppState);
          if (excalidrawAPI) {
            excalidrawAPI.updateScene({
              elements: newElements,
              appState: newAppState,
            });
          }
        }
      }

      socket.onerror = () => {
        setConnectionStatus('Error');
      };

      socket.onclose = () => {
        setConnectionStatus('Disconnected');
      };

      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [session, whiteboard_id]);

  const handleChange = useDebouncedCallback(({ elements, appState }) => {
    console.log('Whiteboard changed, elements:', elements);
    console.log('Whiteboard changed, appState:', appState);
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'UPDATE_WHITEBOARD',
        text: 'Attempting to send whiteboard update',
        elements,
        appState,
      };
      ws.send(JSON.stringify(message));
    }
  }, 300);

  return (
    <Excalidraw
      initialData={{ elements, appState: {
        ...appState,
        collaborators: []
      } }}
      excalidrawAPI={(api) => setExcalidrawAPI(api)}
      onChange={(elements, appState) => handleChange({ elements, appState })}
    />
  );
}
