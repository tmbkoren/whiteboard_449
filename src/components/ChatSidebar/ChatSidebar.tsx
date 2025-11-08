import React, { useState, useRef } from 'react';
import './ChatSidebar.css';

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

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([]);
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
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      senderName: auth.currentUser?.email ?? 'You',
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`chat-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isCollapsed ? '<' : '>'}
      </button>
      <div className="sidebar-content">
        <div className="chat-header">
          <h3>Project Chat</h3>
        </div>
        <div className="chat-messages">
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
              <div key={msg.id} className={`message ${msg.sender}`}>
                <div className="message-meta-top">
                  <span className="meta-time">{formatted}</span>
                </div>
                <div className="message-body"><p>{msg.text}</p></div>
              </div>
            );
          })}
        </div>
        <div className="emoji-bar">
          <button className="emoji-btn" aria-label="thumbs up" onClick={() => insertEmoji('👍')}>👍</button>
          <button className="emoji-btn" aria-label="thumbs down" onClick={() => insertEmoji('👎')}>👎</button>
        </div>

        <div className="chat-input">
          <input
            type="text"
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
