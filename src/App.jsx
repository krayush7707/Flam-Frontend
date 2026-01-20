/**
 * Main App component
 * Manages WebSocket connection, global state, and component orchestration
 */

import { useEffect, useState } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import UserList from './components/UserList';
import websocketService from './services/websocket';

function App() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [operations, setOperations] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  // Drawing tool state
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(4);

  // Undo/Redo state
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Connect to WebSocket server
  useEffect(() => {
    const ws = websocketService.connect(import.meta.env.VITE_WS_URL || 'http://localhost:3001');
    setSocket(ws);

    // Connection status
    websocketService.on('connection_status', ({ connected }) => {
      setConnected(connected);
    });

    // User joined
    websocketService.on('user_joined', (data) => {
      console.log('User joined:', data);
      setOnlineUsers(data.users);
      if (data.userId === websocketService.getSocketId()) {
        setCurrentUserId(data.userId);
      }
    });

    // User left
    websocketService.on('user_left', (data) => {
      console.log('User left:', data);
      setOnlineUsers(data.users);
      // Remove cursor
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[data.userId];
        return newCursors;
      });
    });

    // Full sync (initial state)
    websocketService.on('full_sync', (data) => {
      console.log('Full sync received:', data.operations.length, 'operations');
      setOperations(data.operations);
      setOnlineUsers(data.users);
    });

    // Operation added
    websocketService.on('operation_added', (data) => {
      console.log('Operation added:', data);
      setOperations(prev => [...prev, data.operation]);
      setUndoStack(prev => [...prev, data.operation]);
      setRedoStack([]); // Clear redo stack on new operation
    });

    // Operation removed (undo)
    websocketService.on('operation_removed', (data) => {
      console.log('Operation removed:', data);
      setOperations(prev => prev.filter(op => op.id !== data.operationId));
    });

    // Cursor update
    websocketService.on('cursor_update', (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y },
      }));
    });

    // Cleanup
    return () => {
      websocketService.disconnect();
    };
  }, []);

  // Join room
  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    websocketService.emit('join_room', {
      roomId: 'default',
      username: username.trim(),
    });

    setHasJoined(true);
  };

  // Undo
  const handleUndo = () => {
    if (operations.length === 0) return;
    websocketService.emit('undo');
  };

  // Redo
  const handleRedo = () => {
    // Note: Redo is complex with global undo/redo
    // For now, we'll keep it simple
    console.log('Redo not implemented in global mode');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Ctrl+Z or Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }

      // Tool shortcuts
      if (e.key === 'b' || e.key === 'B') {
        setCurrentTool('brush');
      }
      if (e.key === 'e' || e.key === 'E') {
        setCurrentTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [operations]);

  // Show join screen if not joined
  if (!hasJoined) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <div className="glass-panel p-8 max-w-md w-full animate-fade-in">
          <h1 className="text-4xl font-bold text-white mb-2 text-center">
            Collaborative Canvas
          </h1>
          <p className="text-white/70 text-center mb-6">
            Draw together in real-time
          </p>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="btn-primary w-full py-3 text-lg"
            >
              Join Canvas
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-white/50 text-xs text-center">
              {connected ? '🟢 Connected to server' : '🔴 Connecting...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        onToolChange={setCurrentTool}
        onColorChange={setCurrentColor}
        onWidthChange={setCurrentWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={operations.length > 0}
        canRedo={false}
      />

      {/* User List */}
      <UserList users={onlineUsers} currentUserId={currentUserId} />

      {/* Canvas */}
      <Canvas
        socket={socket}
        operations={operations}
        currentTool={currentTool}
        currentColor={currentColor}
        currentWidth={currentWidth}
        onlineUsers={onlineUsers}
        cursors={cursors}
      />

      {/* Connection Status */}
      {!connected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 animate-fade-in">
          <p className="text-white text-sm">🔄 Reconnecting...</p>
        </div>
      )}
    </div>
  );
}

export default App;
