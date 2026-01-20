/**
 * WebSocket service for real-time communication
 * Handles connection lifecycle, event emission, and automatic reconnection
 */

import { io } from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.listeners = new Map();
    }

    /**
     * Connect to WebSocket server
     */
    connect(url = 'http://localhost:3001') {
        if (this.socket?.connected) {
            console.log('Already connected');
            return this.socket;
        }

        this.socket = io(url, {
            reconnection: true,
            reconnectionDelay: this.reconnectDelay,
            reconnectionAttempts: this.maxReconnectAttempts,
            transports: ['websocket', 'polling'],
        });

        this.setupEventHandlers();
        return this.socket;
    }

    /**
     * Setup default event handlers
     */
    setupEventHandlers() {
        this.socket.on('connect', () => {
            console.log('✅ Connected to server:', this.socket.id);
            this.reconnectAttempts = 0;
            this.emit('connection_status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected:', reason);
            this.emit('connection_status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                console.error('Max reconnection attempts reached');
                this.emit('connection_failed', { error });
            }
        });

        this.socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconnected after', attemptNumber, 'attempts');
            this.emit('reconnected', { attemptNumber });
        });
    }

    /**
     * Emit event to server
     */
    emit(event, data) {
        if (!this.socket) {
            console.warn('Socket not connected, cannot emit:', event);
            return;
        }
        this.socket.emit(event, data);
    }

    /**
     * Listen for events from server
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('Socket not connected, cannot listen to:', event);
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from stored listeners
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            // Remove all listeners
            this.listeners.forEach((callbacks, event) => {
                callbacks.forEach(callback => {
                    this.socket.off(event, callback);
                });
            });
            this.listeners.clear();

            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected() {
        return this.socket?.connected || false;
    }

    /**
     * Get socket ID
     */
    getSocketId() {
        return this.socket?.id || null;
    }
}

// Export singleton instance
export default new WebSocketService();
