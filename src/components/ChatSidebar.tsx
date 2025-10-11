import React, { useState } from 'react';
import './ChatSidebar.css';

interface Message {
  id: number;
  text: string;
  sender: 'user'; 
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
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
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
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
