import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router';
import { getWhiteboardData } from '../../../utils/backendCalls/getWhiteboardData';
import { useEffect, useState, useRef } from 'react';
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
  const excalidrawAPIRef = useRef<any>(null);
  const isUpdatingFromRemote = useRef(false);

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
        try {
          const data = JSON.parse(event.data);
          console.log('Parsed WebSocket data:', data);
          if (data.type === 'UPDATE_WHITEBOARD' && data.elements) {
            console.log('Applying remote update with', data.elements.length, 'elements');
            isUpdatingFromRemote.current = true;
            const api = excalidrawAPIRef.current;
            if (api) {
              api.updateScene({
                elements: data.elements,
              });
              console.log('Successfully applied remote update');
            } else {
              console.warn('Excalidraw API not ready, cannot apply update');
            }
            setTimeout(() => {
              isUpdatingFromRemote.current = false;
            }, 100);
          }
        } catch (e) {
          console.log('Non-JSON message or error:', e);
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
  }, [session, whiteboard_id, excalidrawAPI]);

  const handleChange = useDebouncedCallback((elements: any[], appState: any) => {
    if (isUpdatingFromRemote.current) {
      console.log('Skipping send - currently applying remote update');
      return;
    }
    console.log('Whiteboard changed, sending', elements.length, 'elements');
    if (ws && ws.readyState === WebSocket.OPEN) {
      const message = {
        type: 'UPDATE_WHITEBOARD',
        elements,
      };
      ws.send(JSON.stringify(message));
      console.log('Sent update to WebSocket');
    } else {
      console.warn('WebSocket not open, cannot send update');
    }
  }, 300);

  return (
    <Excalidraw
      initialData={{ elements, appState: {
        ...appState,
        collaborators: []
      } }}
      excalidrawAPI={(api) => {
        setExcalidrawAPI(api);
        excalidrawAPIRef.current = api;
      }}
      onChange={handleChange}
    />
  );
}
