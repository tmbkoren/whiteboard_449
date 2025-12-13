import {
  createFileRoute,
  redirect,
  useLoaderData,
} from '@tanstack/react-router';
import { getWhiteboardData } from '../../../utils/backendCalls/getWhiteboardData';
import { useEffect, useState, useRef } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import { useDebouncedCallback } from 'use-debounce';
import ChatSidebar from '../../../components/ChatSidebar/ChatSidebar';
import './whiteboards.$whiteboard_id.css';
import type { Message } from '../../../utils/types/global.types';
import supabase from '../../../utils/supabase';

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
  const { session, project_id: _project_id, whiteboard_id, whiteboardData } = useLoaderData({
    from: '/projects/$project_id/whiteboards/$whiteboard_id',
  });
  console.log(
    'Whiteboard Data in Component:',
    whiteboardData.whiteboard.app_state
  );
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [elements, _setElements] = useState<any[]>(
    whiteboardData.whiteboard.elements || []
  );
  const [appState, _setAppState] = useState<any>(
    whiteboardData.whiteboard.app_state || {}
  );
  const [_excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const excalidrawAPIRef = useRef<any>(null);
  const isUpdatingFromRemote = useRef(false);
  const lastSentElements = useRef<string>('');

  const [messages, setMessages] = useState<Message[]>(
    (whiteboardData.chat_messages || []).map((m: any) => ({
      id: m.id ?? Math.random(),
      text: m.text ?? m.content ?? '',
      sender: m.sender ?? (m.sender_id === session?.user?.id ? 'user' : 'system'),
      senderName: m.senderName ?? m.sender_username ?? undefined,
      timestamp: m.timestamp ?? m.created_at ?? undefined,
    }))
  );
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const profilesCacheRef = useRef<Map<string, string>>(new Map());

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    if (session) {
      // fetch current user's username for proper chat rendering
      (async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', session.user.id)
            .single();
          const uname = (data as any)?.username as string | undefined;
          if (!error && uname) {
            setCurrentUsername(uname);
            // also backfill any messages missing senderName for the current user
            setMessages((prev) =>
              prev.map((msg) =>
                msg.sender === 'user' && !msg.senderName
                  ? { ...msg, senderName: uname }
                  : msg
              )
            );
          }
        } catch (e) {
          console.warn('Failed to fetch username', e);
        }
      })();
      const socket = new WebSocket(
        `ws://localhost:8000/ws/whiteboard/${whiteboard_id}/${session?.user?.id}`
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
            console.log(
              'Applying remote update with',
              data.elements.length,
              'elements'
            );
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
          } else if (data.type === 'NEW_MESSAGE') {
            const raw = data.message;
            const normalized: Message = {
              id: raw.id ?? Math.random(),
              text: raw.text ?? raw.content ?? '',
              sender:
                raw.sender ??
                (raw.sender_id === session?.user?.id ? 'user' : 'system'),
              senderName:
                raw.senderName ??
                raw.sender_username ??
                (raw.sender_id === session?.user?.id ? currentUsername ?? undefined : undefined),
              timestamp: raw.timestamp ?? raw.created_at ?? undefined,
            };
            if (!normalized.senderName && (raw as any).sender_id) {
              const sid = (raw as any).sender_id as string;
              const cached = profilesCacheRef.current.get(sid);
              if (cached) {
                normalized.senderName = cached;
              } else {
                (async () => {
                  try {
                    const { data, error } = await supabase
                      .from('profiles')
                      .select('username')
                      .eq('user_id', sid)
                      .single();
                    const uname = (data as any)?.username as string | undefined;
                    if (!error && uname) {
                      profilesCacheRef.current.set(sid, uname);
                      setMessages((prev) =>
                        prev.map((m) =>
                          (m as any).id === normalized.id && !m.senderName
                            ? { ...m, senderName: uname }
                            : m
                        )
                      );
                    }
                  } catch {}
                })();
              }
            }
            setMessages((prevMessages) => [normalized, ...prevMessages]);
          }
        } catch (e) {
          console.log('Non-JSON message or error:', e);
        }
      };

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

  // Backfill any missing usernames for historical messages
  useEffect(() => {
    (async () => {
      const missingIds = Array.from(
        new Set(
          (messages as any[])
            .map((m) => (!m.senderName && (m as any).sender_id ? (m as any).sender_id : null))
            .filter((id) => typeof id === 'string')
        )
      ).filter((id) => !profilesCacheRef.current.has(id as string));
      if (missingIds.length > 0) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', missingIds as string[]);
          if (!error && Array.isArray(data)) {
            data.forEach((row: any) => {
              if (row?.user_id && row?.username) {
                profilesCacheRef.current.set(row.user_id, row.username);
              }
            });
            setMessages((prev) =>
              prev.map((m: any) => {
                const sid = m.sender_id as string | undefined;
                if (!m.senderName && sid && profilesCacheRef.current.has(sid)) {
                  return { ...m, senderName: profilesCacheRef.current.get(sid) };
                }
                return m;
              })
            );
          }
        } catch (e) {
          console.warn('Failed to backfill usernames', e);
        }
      }
    })();
  }, [messages]);

  const handleChange = useDebouncedCallback(
    (elements: any[], _appState: any) => {
      if (isUpdatingFromRemote.current) {
        console.log('Skipping send - currently applying remote update');
        return;
      }

      // Only send if elements actually changed (not just appState/selection)
      const elementsStr = JSON.stringify(elements);
      if (elementsStr === lastSentElements.current) {
        return; // No actual element changes
      }

      lastSentElements.current = elementsStr;
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
    },
    300
  );

  const handleSendMessage = (message: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const messageData = {
        type: 'NEW_MESSAGE',
        message,
        sender_id: session?.user?.id,
        sender_username: currentUsername ?? undefined,
      };
      ws.send(JSON.stringify(messageData));
    } else {
      console.warn('WebSocket not open, cannot send message');
    }
  };

  return (
    <div
      className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      <div className='whiteboard-container'>
        <Excalidraw
          initialData={{
            elements,
            appState: {
              ...appState,
              collaborators: [],
            },
          }}
          excalidrawAPI={(api) => {
            setExcalidrawAPI(api);
            excalidrawAPIRef.current = api;
          }}
          onChange={(els, as) => handleChange(els as any, as as any)}
        />
      </div>
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        messages={messages}
        sendMessage={handleSendMessage}
        connectionStatus={connectionStatus}
      />
    </div>
  );
}
