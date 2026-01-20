/**
 * Canvas drawing operations and utilities
 * Implements efficient path rendering and canvas manipulation
 */

/**
 * Draw a smooth stroke on the canvas
 * Uses quadratic curves for smooth interpolation between points
 */
export function drawStroke(ctx, points, color, width, tool = 'brush') {
    if (!points || points.length === 0) return;

    ctx.save();

    if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
    }

    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (points.length === 1) {
        // Single point - draw a dot
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, width / 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (points.length === 2) {
        // Two points - draw a line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
    } else {
        // Multiple points - draw smooth curve using quadratic curves
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }

        // Draw last segment
        const lastPoint = points[points.length - 1];
        const secondLastPoint = points[points.length - 2];
        ctx.quadraticCurveTo(
            secondLastPoint.x,
            secondLastPoint.y,
            lastPoint.x,
            lastPoint.y
        );

        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Redraw the entire canvas from operation history
 * Optimized for performance with requestAnimationFrame
 */
export function redrawCanvas(ctx, operations, canvasWidth, canvasHeight) {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Redraw all operations in order
    operations.forEach(operation => {
        if (operation.type === 'draw') {
            drawStroke(
                ctx,
                operation.points,
                operation.color,
                operation.width,
                operation.tool
            );
        }
    });
}

/**
 * Optimize path by reducing number of points using Douglas-Peucker algorithm
 * This reduces data transfer size and improves performance
 */
export function optimizePath(points, tolerance = 2) {
    if (points.length <= 2) return points;

    // Find point with maximum distance from line segment
    let maxDistance = 0;
    let maxIndex = 0;
    const end = points.length - 1;

    for (let i = 1; i < end; i++) {
        const distance = perpendicularDistance(
            points[i],
            points[0],
            points[end]
        );
        if (distance > maxDistance) {
            maxDistance = distance;
            maxIndex = i;
        }
    }

    // If max distance is greater than tolerance, recursively simplify
    if (maxDistance > tolerance) {
        const left = optimizePath(points.slice(0, maxIndex + 1), tolerance);
        const right = optimizePath(points.slice(maxIndex), tolerance);

        // Combine results (remove duplicate point at junction)
        return [...left.slice(0, -1), ...right];
    } else {
        // Return just the endpoints
        return [points[0], points[end]];
    }
}

/**
 * Calculate perpendicular distance from point to line segment
 */
function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    if (dx === 0 && dy === 0) {
        // Line segment is a point
        return Math.sqrt(
            Math.pow(point.x - lineStart.x, 2) +
            Math.pow(point.y - lineStart.y, 2)
        );
    }

    const t = Math.max(
        0,
        Math.min(
            1,
            ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
            (dx * dx + dy * dy)
        )
    );

    const projectionX = lineStart.x + t * dx;
    const projectionY = lineStart.y + t * dy;

    return Math.sqrt(
        Math.pow(point.x - projectionX, 2) +
        Math.pow(point.y - projectionY, 2)
    );
}

/**
 * Get mouse/touch position relative to canvas
 */
export function getCanvasCoordinates(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;

    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
    };
}

/**
 * Throttle function to limit execution rate
 * Used for mouse move events to reduce network traffic
 */
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
