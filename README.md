# Real-Time Collaborative Drawing Canvas

A multi-user drawing application where multiple people can draw simultaneously on the same canvas with real-time synchronization. Built with React, Node.js, and WebSockets.

![Collaborative Canvas](https://img.shields.io/badge/Status-Production%20Ready-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-black)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## ✨ Features

### Core Functionality
- ✏️ **Real-time Drawing**: Draw with brush and eraser tools
- 🎨 **Color Picker**: 10 preset colors + custom color picker
- 📏 **Stroke Width**: 6 different stroke widths (2px - 24px)
- 👥 **Multi-user Support**: See other users drawing in real-time
- 🔄 **Global Undo**: Undo works across all users (removes last operation)
- 👆 **Cursor Tracking**: See where other users are drawing
- 🎯 **User Indicators**: Colored avatars and usernames for each user
- 📱 **Touch Support**: Works on mobile and tablet devices

### Technical Features
- 🚀 **Optimized Performance**: Path smoothing with Douglas-Peucker algorithm
- ⚡ **Efficient Rendering**: Throttled events (~60fps) and canvas caching
- 🔌 **Auto-reconnection**: Automatic WebSocket reconnection with exponential backoff
- 🎭 **Smooth Drawing**: Quadratic curve interpolation for smooth paths
- 🏠 **Room System**: Multiple isolated drawing rooms (default room implemented)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd collaborative-canvas

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Running the Application

**Option 1: Using two terminals (recommended for development)**

```bash
# Terminal 1: Start the WebSocket server
cd server
npm start

# Terminal 2: Start the React frontend
npm run dev
```

**Option 2: Using a single command**

```bash
# Start both server and client (requires npm-run-all)
npm install -g npm-run-all
npm-run-all --parallel server client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Testing with Multiple Users

1. Open the application in your browser: http://localhost:5173
2. Enter your name and click "Join Canvas"
3. Open the same URL in another browser tab or incognito window
4. Enter a different name and join
5. Start drawing in one tab and watch it appear in real-time in the other!

**Testing Tips:**
- Use different browsers (Chrome, Firefox, Safari) for more realistic testing
- Test on mobile devices by accessing `http://<your-ip>:5173`
- Try the undo feature - it removes the last operation globally
- Move your cursor to see cursor tracking in action

## ⌨️ Keyboard Shortcuts

- `B` - Switch to Brush tool
- `E` - Switch to Eraser tool
- `Ctrl+Z` / `Cmd+Z` - Undo last operation (global)

## 🏗️ Project Structure

```
collaborative-canvas/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx          # Main canvas component
│   │   │   ├── Toolbar.jsx         # Drawing tools UI
│   │   │   └── UserList.jsx        # Online users panel
│   │   ├── services/
│   │   │   └── websocket.js        # WebSocket client
│   │   ├── utils/
│   │   │   └── canvasOperations.js # Canvas drawing utilities
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── server.js                   # Express + Socket.io server
│   ├── rooms.js                    # Room management
│   ├── drawing-state.js            # Canvas state management
│   └── package.json
├── README.md
├── ARCHITECTURE.md
└── .gitignore
```

## 🎨 Design Features

- **Glassmorphism UI**: Modern frosted glass effect with backdrop blur
- **Gradient Background**: Beautiful purple-to-slate gradient
- **Smooth Animations**: Fade-in and slide-in effects
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes for extended drawing sessions

## ⚠️ Known Limitations

1. **Redo Not Implemented**: Due to complexity of global undo/redo, redo is not currently supported
2. **Operation History Limit**: No hard limit on operation history (could impact performance with very long sessions)
3. **No Persistence**: Canvas state is lost when all users disconnect
4. **Single Room**: Currently only supports a default room (multi-room infrastructure is in place)
5. **No Authentication**: Users can join with any name
6. **Path Optimization**: Very rapid drawing may occasionally show slight lag on slower devices

## 🐛 Known Bugs

- None currently identified

## 📊 Performance Characteristics

- **Event Throttling**: Mouse events throttled to ~60fps (16ms)
- **Cursor Updates**: 50ms intervals (20 updates/second)
- **Path Optimization**: Douglas-Peucker algorithm with 2px tolerance
- **Canvas Redraw**: Full redraw on operation changes (optimized with requestAnimationFrame)

## 🔮 Future Enhancements

- [ ] Redo functionality
- [ ] Canvas persistence (save/load sessions)
- [ ] Multiple rooms with room selection UI
- [ ] Drawing shapes (rectangle, circle, line)
- [ ] Text tool
- [ ] Image upload
- [ ] Export canvas as PNG/SVG
- [ ] Operation history limit (e.g., last 100 operations)
- [ ] User authentication
- [ ] Private rooms with passwords
- [ ] Performance metrics display (FPS, latency)

## ⏱️ Time Spent

- **Planning & Architecture**: 1 hour
- **Frontend Implementation**: 3 hours
  - Canvas operations and utilities: 1 hour
  - Components (Canvas, Toolbar, UserList): 1.5 hours
  - WebSocket integration and state management: 0.5 hours
- **Backend Implementation**: 1.5 hours
  - Server setup and Socket.io: 0.5 hours
  - Room management: 0.5 hours
  - Drawing state and undo/redo: 0.5 hours
- **Testing & Debugging**: 1 hour
- **Documentation**: 0.5 hours

**Total**: ~7 hours

## 📝 License

MIT

## 🙏 Acknowledgments

Built as a technical assessment demonstrating:
- Raw Canvas API mastery
- Real-time WebSocket architecture
- Complex state synchronization
- Performance optimization techniques
- Clean code organization
