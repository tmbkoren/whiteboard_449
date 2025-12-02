import { Excalidraw } from '@excalidraw/excalidraw';
import './App.css';
import ChatSidebar from './components/ChatSidebar/ChatSidebar';
import { useEffect, useState } from 'react';

function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const printContents = () => {
    if (excalidrawAPI) {
      const elements = excalidrawAPI.getSceneElements();
      console.log('Current Excalidraw elements:', elements);
    }
  };

  useEffect(() => {
    console.log('Excalidraw API initialized:', excalidrawAPI);
  }, [excalidrawAPI]);

  return (
    <div
      className={`app-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}
    >
      <div className='whiteboard-container'>
        <Excalidraw
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={printContents}
        />
      </div>
      <ChatSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />
    </div>
  );
}

export default App;
