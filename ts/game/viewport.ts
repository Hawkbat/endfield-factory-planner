/**
 * Viewport utilities for coordinate transformations and zoom/pan calculations
 */

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3.5

/**
 * Clamp zoom value to valid range
 */
export function clampZoom(value: number): number {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

/**
 * Convert client coordinates to world coordinates
 */
export function clientToWorld(
    clientX: number,
    clientY: number,
    svgRect: DOMRect,
    pan: { x: number; y: number },
    zoom: number
): [number, number] {
    const cursorX = clientX - svgRect.left
    const cursorY = clientY - svgRect.top
    return [
        (cursorX - pan.x) / zoom,
        (cursorY - pan.y) / zoom,
    ]
}

/**
 * Convert world coordinates to grid coordinates
 */
export function worldToGrid(
    worldX: number,
    worldY: number,
    cellSize: number,
    snapToGrid: boolean = true
): [number, number] {
    const gridX = worldX / cellSize
    const gridY = worldY / cellSize
    if (snapToGrid) {
        return [Math.floor(gridX), Math.floor(gridY)]
    }
    return [gridX, gridY]
}

/**
 * Convert client coordinates directly to grid coordinates
 */
export function clientToGrid(
    clientX: number,
    clientY: number,
    svgRect: DOMRect,
    pan: { x: number; y: number },
    zoom: number,
    cellSize: number,
    snapToGrid: boolean = true
): [number, number] {
    const [worldX, worldY] = clientToWorld(clientX, clientY, svgRect, pan, zoom)
    return worldToGrid(worldX, worldY, cellSize, snapToGrid)
}

/**
 * Calculate new pan and zoom for zoom-to-cursor behavior
 */
export function calculateZoomToPoint(
    cursorX: number,
    cursorY: number,
    currentPan: { x: number; y: number },
    currentZoom: number,
    newZoom: number
): { x: number; y: number } {
    const worldX = (cursorX - currentPan.x) / currentZoom
    const worldY = (cursorY - currentPan.y) / currentZoom
    
    return {
        x: cursorX - worldX * newZoom,
        y: cursorY - worldY * newZoom,
    }
}
