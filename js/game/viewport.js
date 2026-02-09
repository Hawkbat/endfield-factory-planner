/**
 * Viewport utilities for coordinate transformations and zoom/pan calculations
 */
export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 3.5;
/**
 * Clamp zoom value to valid range
 */
export function clampZoom(value) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}
/**
 * Convert client coordinates to world coordinates
 */
export function clientToWorld(clientX, clientY, svgRect, pan, zoom) {
    const cursorX = clientX - svgRect.left;
    const cursorY = clientY - svgRect.top;
    return [
        (cursorX - pan.x) / zoom,
        (cursorY - pan.y) / zoom,
    ];
}
/**
 * Convert world coordinates to grid coordinates
 */
export function worldToGrid(worldX, worldY, cellSize, snapToGrid = true) {
    const gridX = worldX / cellSize;
    const gridY = worldY / cellSize;
    if (snapToGrid) {
        return [Math.floor(gridX), Math.floor(gridY)];
    }
    return [gridX, gridY];
}
/**
 * Convert client coordinates directly to grid coordinates
 */
export function clientToGrid(clientX, clientY, svgRect, pan, zoom, cellSize, snapToGrid = true) {
    const [worldX, worldY] = clientToWorld(clientX, clientY, svgRect, pan, zoom);
    return worldToGrid(worldX, worldY, cellSize, snapToGrid);
}
/**
 * Calculate new pan and zoom for zoom-to-cursor behavior
 */
export function calculateZoomToPoint(cursorX, cursorY, currentPan, currentZoom, newZoom) {
    const worldX = (cursorX - currentPan.x) / currentZoom;
    const worldY = (cursorY - currentPan.y) / currentZoom;
    return {
        x: cursorX - worldX * newZoom,
        y: cursorY - worldY * newZoom,
    };
}
