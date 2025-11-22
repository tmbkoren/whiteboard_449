import React, { useState, useRef, useEffect } from 'react';
import './ChatSidebar.css';
import { useRouteContext } from '@tanstack/react-router';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  senderName?: string;
  timestamp?: string;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isCollapsed,
  toggleSidebar,
}) => {
  const { session } = useRouteContext({ from: '__root__' });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (session) {
      const clientId = session.user.email;
      const socket = new WebSocket(`ws://localhost:8000/ws/${clientId}`);

      socket.onopen = () => {
        setConnectionStatus('Connected');
      };

      socket.onmessage = (event) => {
        const data = event.data;
        // Parse online count
        if (data.startsWith('ONLINE_COUNT:')) {
          const count = parseInt(data.split(':')[1]);
          if (!isNaN(count)) setOnlineCount(count);
          return;
        }
        // Hide join/leave system messages
        if (/^User [^ ]+ (joined|left) the chat$/.test(data)) {
          return;
        }
        let senderName = '';
        let text = data;
        let sender: 'user' | 'system' = 'system';
        const match = data.match(/^User ([^:]+):\s*(.*)$/);
        if (match) {
          senderName = match[1];
          text = match[2];
          if (session && senderName === session.user.email) {
            sender = 'user';
          }
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            text,
            sender,
            senderName: senderName || 'System',
            timestamp: new Date().toISOString(),
          },
        ]);
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
  }, [session]);

  const insertEmoji = (emoji: string) => {
    // append emoji at the end of current input and focus
    setInputValue((prev) => {
      const next = prev + emoji;
      // focus and move cursor to end after state updates
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const len = next.length;
          inputRef.current.setSelectionRange(len, len);
        }
      }, 0);
      return next;
    });
  };

  const handleSendMessage = () => {
    if (inputValue.trim() === '' || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button
        className='toggle-btn'
        onClick={toggleSidebar}
      >
        {isCollapsed ? '<' : '>'}
      </button>
      <div className='sidebar-content'>
        <div className='chat-header'>
          <h3>
            Project Chat
            <span style={{ fontSize: '14px', color: connectionStatus === 'Connected' ? 'green' : 'red', marginLeft: 8 }}>
              ({connectionStatus})
            </span>
          </h3>
        </div>
        <div className='chat-messages'>
          {messages.map((msg) => {
            const formatted = msg.timestamp
              ? (() => {
                  const d = new Date(msg.timestamp!);
                  // numeric month/day (no year) and 24-hour time HH:MM, no seconds
                  const m = String(d.getMonth() + 1); // 1-12
                  const day = String(d.getDate());
                  const hh = String(d.getHours()).padStart(2, '0');
                  const mm = String(d.getMinutes()).padStart(2, '0');
                  return `${m}/${day} ${hh}:${mm}`;
                })()
              : '';

            return (
              <div
                key={msg.id}
                className={`message user`}
              >
                <div className='message-meta-top' style={{flexWrap: 'wrap', wordBreak: 'break-all', maxWidth: '100%'}}>
                  <span className='meta-username' style={{whiteSpace: 'normal', wordBreak: 'break-all', maxWidth: '100%'}}>{msg.senderName ?? 'User'}</span>
                  <span style={{margin: '0 8px'}}>|</span>
                  <span className='meta-time'>{formatted}</span>
                </div>
                <div className='message-body'>
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className='emoji-bar'>
          <button
            className='emoji-btn'
            aria-label='thumbs up'
            onClick={() => insertEmoji('👍')}
          >
            👍
          </button>
          <button
            className='emoji-btn'
            aria-label='thumbs down'
            onClick={() => insertEmoji('👎')}
          >
            👎
          </button>
        </div>

        <div className='chat-input'>
          <input
            type='text'
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder='Type a message...'
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
