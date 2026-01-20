/**
 * Room management system
 * Handles user sessions, room state, and user color assignment
 */

const rooms = new Map();

// Predefined colors for users
const USER_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#FF8FA3', '#6C5CE7', '#00B894', '#FDCB6E', '#E17055',
];

let colorIndex = 0;

/**
 * Get or create a room
 */
export function getRoom(roomId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, {
            users: new Map(),
            operations: [],
            cursors: new Map(),
        });
    }
    return rooms.get(roomId);
}

/**
 * Add user to room
 */
export function addUserToRoom(roomId, socketId, username) {
    const room = getRoom(roomId);

    // Assign color
    const color = USER_COLORS[colorIndex % USER_COLORS.length];
    colorIndex++;

    const user = {
        userId: socketId,
        username: username || `User${room.users.size + 1}`,
        color,
        joinedAt: Date.now(),
    };

    room.users.set(socketId, user);

    console.log(`✅ User ${user.username} joined room ${roomId}`);

    return user;
}

/**
 * Remove user from room
 */
export function removeUserFromRoom(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return null;

    const user = room.users.get(socketId);
    room.users.delete(socketId);
    room.cursors.delete(socketId);

    // Clean up empty rooms
    if (room.users.size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️  Room ${roomId} deleted (empty)`);
    }

    if (user) {
        console.log(`❌ User ${user.username} left room ${roomId}`);
    }

    return user;
}

/**
 * Get all users in a room
 */
export function getRoomUsers(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.values());
}

/**
 * Get user by socket ID
 */
export function getUser(roomId, socketId) {
    const room = rooms.get(roomId);
    if (!room) return null;
    return room.users.get(socketId);
}

/**
 * Update cursor position
 */
export function updateCursor(roomId, socketId, x, y) {
    const room = rooms.get(roomId);
    if (!room) return;

    room.cursors.set(socketId, { x, y, lastUpdate: Date.now() });
}

/**
 * Get all cursors in a room
 */
export function getRoomCursors(roomId) {
    const room = rooms.get(roomId);
    if (!room) return {};

    const cursors = {};
    room.cursors.forEach((cursor, userId) => {
        cursors[userId] = cursor;
    });
    return cursors;
}

/**
 * Get room statistics
 */
export function getRoomStats() {
    const stats = {
        totalRooms: rooms.size,
        rooms: [],
    };

    rooms.forEach((room, roomId) => {
        stats.rooms.push({
            roomId,
            userCount: room.users.size,
            operationCount: room.operations.length,
        });
    });

    return stats;
}
