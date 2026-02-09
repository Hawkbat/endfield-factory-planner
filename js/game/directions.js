export const ROTATE_RIGHT_MAP = {
    'up': 'right',
    'right': 'down',
    'down': 'left',
    'left': 'up',
};
const OPPOSITE_DIRECTION_MAP = {
    'up': 'down',
    'down': 'up',
    'left': 'right',
    'right': 'left',
};
/**
 * Rotate a direction by a number of 90-degree steps clockwise.
 * @param dir The initial direction
 * @param steps Number of 90-degree clockwise rotations (can be negative for counter-clockwise)
 * @returns The rotated direction
 */
export function rotateDirection(dir, steps) {
    const normalizedSteps = ((steps % 4) + 4) % 4;
    let result = dir;
    for (let i = 0; i < normalizedSteps; i++) {
        result = ROTATE_RIGHT_MAP[result];
    }
    return result;
}
/**
 * Get the opposite direction.
 * @param dir The direction
 * @returns The opposite direction
 */
export function getOppositeDirection(dir) {
    return OPPOSITE_DIRECTION_MAP[dir];
}
/**
 * Calculate the cardinal direction from one point to another.
 * @param from Starting point [x, y]
 * @param to Ending point [x, y]
 * @returns Direction if points form a cardinal line, null otherwise
 */
export function getDirectionFromPoints(from, to) {
    const [fx, fy] = from;
    const [tx, ty] = to;
    if (fx === tx && fy === ty) {
        return null; // Same point
    }
    if (fx === tx) {
        // Vertical line
        return ty > fy ? 'down' : 'up';
    }
    if (fy === ty) {
        // Horizontal line
        return tx > fx ? 'right' : 'left';
    }
    return null; // Diagonal, not a valid cardinal direction
} /**
 * Calculate the direction at a path endpoint.
 * @param path The path
 * @param endpoint Which endpoint to check
 * @returns Direction at endpoint, or null if invalid
 */
export function calculatePathEndpointDirection(path, endpoint) {
    if (path.points.length < 2) {
        return null;
    }
    if (endpoint === 'start') {
        // Direction from second point toward first point (toward the endpoint)
        return getDirectionFromPoints(path.points[1], path.points[0]);
    }
    else {
        // Direction from second-to-last point to last point (toward the endpoint)
        return getDirectionFromPoints(path.points[path.points.length - 2], path.points[path.points.length - 1]);
    }
}
