/**
 * Drawing state management
 * Handles global operation history and undo/redo logic
 */

import { getRoom } from './rooms.js';

let operationIdCounter = 0;

/**
 * Add a drawing operation to the room history
 */
export function addOperation(roomId, userId, operationData) {
    const room = getRoom(roomId);

    const operation = {
        id: ++operationIdCounter,
        userId,
        timestamp: Date.now(),
        type: 'draw',
        ...operationData,
    };

    room.operations.push(operation);

    console.log(`➕ Operation ${operation.id} added to room ${roomId} (total: ${room.operations.length})`);

    return operation;
}

/**
 * Undo last operation (global undo)
 * Removes the most recent operation from history
 */
export function undoOperation(roomId) {
    const room = getRoom(roomId);

    if (room.operations.length === 0) {
        return null;
    }

    const lastOperation = room.operations.pop();

    console.log(`↩️  Operation ${lastOperation.id} undone in room ${roomId} (remaining: ${room.operations.length})`);

    return lastOperation;
}

/**
 * Get all operations for a room
 */
export function getOperations(roomId) {
    const room = getRoom(roomId);
    return room.operations;
}

/**
 * Clear all operations (optional feature)
 */
export function clearOperations(roomId) {
    const room = getRoom(roomId);
    const count = room.operations.length;
    room.operations = [];

    console.log(`🗑️  Cleared ${count} operations from room ${roomId}`);

    return count;
}

/**
 * Get operation count
 */
export function getOperationCount(roomId) {
    const room = getRoom(roomId);
    return room.operations.length;
}
