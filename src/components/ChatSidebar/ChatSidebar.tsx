import React, { useState, useRef } from 'react';
import './ChatSidebar.css';
import type { Message } from '../../utils/types/global.types';
import { useRouteContext } from '@tanstack/react-router';

interface ChatSidebarProps {
  isCollapsed: boolean;
  connectionStatus: string;
  toggleSidebar: () => void;
  messages: Message[];
  sendMessage: (message: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isCollapsed,
  connectionStatus,
  toggleSidebar,
  messages,
  sendMessage,
}) => {
  const { session } = useRouteContext({ from: '__root__' });
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

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
    sendMessage(inputValue);
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
            <span
              style={{
                fontSize: '14px',
                color: connectionStatus === 'Connected' ? 'green' : 'red',
                marginLeft: 8,
              }}
            >
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
                className={`message ${msg.sender_id === session.user.id ? 'user' : 'system'}`}
              >
                <div
                  className='message-meta-top'
                  style={{
                    flexWrap: 'wrap',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}
                >
                  <span
                    className='meta-username'
                    style={{
                      whiteSpace: 'normal',
                      wordBreak: 'break-all',
                      maxWidth: '100%',
                    }}
                  >
                    {msg.sender_username ?? 'User'}
                  </span>
                  <span style={{ margin: '0 8px' }}>|</span>
                  <span className='meta-time'>{formatted}</span>
                </div>
                <div className='message-body'>
                  <p>{msg.content}</p>
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
