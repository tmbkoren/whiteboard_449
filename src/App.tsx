import { Excalidraw } from '@excalidraw/excalidraw';
import './App.css';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import { useState } from 'react';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="whiteboard-container">
        <Excalidraw />
      </div>
      <ChatSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
    </div>
  );
}

export default App;
