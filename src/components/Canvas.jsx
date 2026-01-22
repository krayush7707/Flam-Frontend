/**
 * Main Canvas component for collaborative drawing
 * Handles drawing operations, real-time sync, and user interactions
 */

import React, { useEffect, useRef, useState } from 'react';
import { drawStroke, redrawCanvas, getCanvasCoordinates, throttle } from '../utils/canvasOperations';

export default function Canvas({
    socket,
    operations,
    currentTool,
    currentColor,
    currentWidth,
    onlineUsers,
    cursors
}) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPath, setCurrentPath] = useState([]);
    const lastPointRef = useRef(null);

    // Canvas dimensions
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        // Set canvas size
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Enable better rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Initial draw
        redrawCanvas(ctx, operations, canvasWidth, canvasHeight);
    }, []);

    // Redraw canvas when operations change
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        redrawCanvas(ctx, operations, canvasWidth, canvasHeight);

        // Redraw current path if drawing
        if (isDrawing && currentPath.length > 0) {
            drawStroke(ctx, currentPath, currentColor, currentWidth, currentTool);
        }
    }, [operations, isDrawing, currentPath, currentColor, currentWidth, currentTool]);

    // Handle drawing start
    const handleDrawStart = (e) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getCanvasCoordinates(e, canvas);
        setIsDrawing(true);
        setCurrentPath([point]);
        lastPointRef.current = point;

        // Emit draw start event
        socket?.emit('draw_start', {
            x: point.x,
            y: point.y,
            color: currentColor,
            width: currentWidth,
            tool: currentTool,
        });
    };

    // Handle drawing move (throttled for performance)
    const handleDrawMove = throttle((e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getCanvasCoordinates(e, canvas);

        // Skip if point hasn't moved much (reduce redundant points)
        if (lastPointRef.current) {
            const dx = point.x - lastPointRef.current.x;
            const dy = point.y - lastPointRef.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 2) return; // Skip very small movements
        }

        setCurrentPath(prev => [...prev, point]);
        lastPointRef.current = point;

        // Draw immediately for smooth local feedback
        const ctx = canvas.getContext('2d');
        redrawCanvas(ctx, operations, canvasWidth, canvasHeight);
        drawStroke(ctx, [...currentPath, point], currentColor, currentWidth, currentTool);

        // Emit draw move event
        socket?.emit('draw_move', {
            x: point.x,
            y: point.y,
        });
    }, 16); // ~60fps

    // Handle drawing end
    const handleDrawEnd = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        setIsDrawing(false);

        if (currentPath.length > 0) {
            // Emit complete path to server
            socket?.emit('draw_end', {
                points: currentPath,
                color: currentColor,
                width: currentWidth,
                tool: currentTool,
            });
        }

        setCurrentPath([]);
        lastPointRef.current = null;
    };

    // Handle cursor move for remote cursor tracking
    const handleCursorMove = throttle((e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const point = getCanvasCoordinates(e, canvas);
        socket?.emit('cursor_move', {
            x: point.x,
            y: point.y,
        });
    }, 50); // Update cursor position every 50ms

    // Prevent scrolling on touch devices
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        document.body.addEventListener('touchmove', preventDefault, { passive: false });
        return () => {
            document.body.removeEventListener('touchmove', preventDefault);
        };
    }, []);

    return (
        <div className="relative w-full h-full">
            <canvas
                ref={canvasRef}
                className={`absolute inset-0 ${currentTool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'}`}
                onMouseDown={handleDrawStart}
                onMouseMove={(e) => {
                    handleDrawMove(e);
                    handleCursorMove(e);
                }}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
                onTouchStart={handleDrawStart}
                onTouchMove={(e) => {
                    handleDrawMove(e);
                    handleCursorMove(e);
                }}
                onTouchEnd={handleDrawEnd}
            />

            {/* Remote user cursors */}
            {Object.entries(cursors).map(([userId, cursor]) => {
                const user = onlineUsers.find(u => u.userId === userId);
                if (!user || !cursor.x || !cursor.y) return null;

                return (
                    <div
                        key={userId}
                        className="absolute pointer-events-none transition-all duration-100 ease-out"
                        style={{
                            left: `${cursor.x}px`,
                            top: `${cursor.y}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                            style={{ backgroundColor: user.color }}
                        />
                        <div className="absolute top-5 left-5 px-2 py-1 bg-black-75 text-white text-xs rounded whitespace-nowrap">
                            {user.username}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
