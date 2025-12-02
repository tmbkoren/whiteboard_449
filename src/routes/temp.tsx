import {
  createFileRoute,
  redirect,
  useNavigate,
  useRouteContext,
} from '@tanstack/react-router';
import App from '../App';
import React, { useState, useEffect } from 'react';

export const Route = createFileRoute('/temp')({
  beforeLoad: async ({context}) => {
    if (!context.session) {
      throw redirect({to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { session } = useRouteContext({ from: '__root__' });
  console.log(session);

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');

  useEffect(() => {
    if (session) {
      const clientId = session.user.id;
      console.log('Attempting WebSocket connection for client:', clientId);
      // Connect directly to backend on port 8000
      const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('Connected');
      };
      
      socket.onmessage = (event) => {
        console.log('Received message:', event.data);
        const data = event.data;
        // Log online count to console if system message
        if (data.startsWith('ONLINE_COUNT:')) {
          const count = parseInt(data.split(':')[1]);
          console.log('Online users:', count);
        } else {
          setMessages((prevMessages) => [...prevMessages, data]);
        }
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('Disconnected');
      };
      
      setWs(socket);

      return () => {
        socket.close();
      };
    }
  }, [session]);

  if (!session) {
    navigate({ to: '/login' });
    return null;
  }

  const sendMessage = () => {
    if (ws && input) {
      console.log('Sending message:', input, 'WebSocket state:', ws.readyState);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(input);
        setInput('');
      } else {
        console.error('WebSocket is not open. State:', ws.readyState);
        setConnectionStatus('Error - Not Connected');
      }
    }
  };

  return (
    <div>
      <App />
      <div style={{ padding: '20px' }}>
        <h2>Chat <span style={{ fontSize: '14px', color: connectionStatus === 'Connected' ? 'green' : 'red' }}>({connectionStatus})</span></h2>
        <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll', marginBottom: '10px' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {messages.map((msg, index) => (
              <li key={index} style={{ marginBottom: '8px' }}>{msg}</li>
            ))}
          </ul>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: '8px' }}
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} style={{ padding: '8px 16px' }}>Send</button>
        </div>
      </div>
    </div>
  );
}
