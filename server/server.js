/**
 * WebSocket server for collaborative drawing canvas
 * Handles real-time communication between clients
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import {
    addUserToRoom,
    removeUserFromRoom,
    getRoomUsers,
    updateCursor,
    getRoomStats,
} from './rooms.js';
import {
    addOperation,
    undoOperation,
    getOperations,
} from './drawing-state.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS
app.use(cors());

// Socket.io server
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

// Health check endpoint
app.get('/health', (req, res) => {
    const stats = getRoomStats();
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        stats,
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    let currentRoom = null;

    // Join room
    socket.on('join_room', ({ roomId, username }) => {
        currentRoom = roomId;

        // Join Socket.io room
        socket.join(roomId);

        // Add user to room
        const user = addUserToRoom(roomId, socket.id, username);

        // Send full sync to new user
        const operations = getOperations(roomId);
        const users = getRoomUsers(roomId);

        socket.emit('full_sync', {
            operations,
            users,
        });

        // Notify all users in room
        io.to(roomId).emit('user_joined', {
            userId: socket.id,
            user,
            users,
        });
    });

    // Drawing events
    socket.on('draw_start', (data) => {
        if (!currentRoom) return;

        // Broadcast to other users in room
        socket.to(currentRoom).emit('draw_start', {
            userId: socket.id,
            ...data,
        });
    });

    socket.on('draw_move', (data) => {
        if (!currentRoom) return;

        // Broadcast to other users in room
        socket.to(currentRoom).emit('draw_move', {
            userId: socket.id,
            ...data,
        });
    });

    socket.on('draw_end', (data) => {
        if (!currentRoom) return;

        // Add operation to history
        const operation = addOperation(currentRoom, socket.id, {
            points: data.points,
            color: data.color,
            width: data.width,
            tool: data.tool,
        });

        // Broadcast to all users in room (including sender)
        io.to(currentRoom).emit('operation_added', {
            operation,
        });
    });

    // Undo operation
    socket.on('undo', () => {
        if (!currentRoom) return;

        const removedOperation = undoOperation(currentRoom);

        if (removedOperation) {
            // Broadcast to all users in room
            io.to(currentRoom).emit('operation_removed', {
                operationId: removedOperation.id,
            });
        }
    });

    // Cursor movement
    socket.on('cursor_move', (data) => {
        if (!currentRoom) return;

        updateCursor(currentRoom, socket.id, data.x, data.y);

        // Broadcast to other users in room
        socket.to(currentRoom).emit('cursor_update', {
            userId: socket.id,
            x: data.x,
            y: data.y,
        });
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        if (currentRoom) {
            const user = removeUserFromRoom(currentRoom, socket.id);
            const users = getRoomUsers(currentRoom);

            // Notify remaining users
            io.to(currentRoom).emit('user_left', {
                userId: socket.id,
                user,
                users,
            });
        }
    });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
});
