/**
 * Get normalized bounds from a selection box
 */
export function getBoxBounds(box) {
    const minX = Math.min(box.start[0], box.end[0]);
    const minY = Math.min(box.start[1], box.end[1]);
    const maxX = Math.max(box.start[0], box.end[0]);
    const maxY = Math.max(box.start[1], box.end[1]);
    return { minX, minY, maxX, maxY };
}
/**
 * Check if two boxes overlap
 */
export function boxesOverlap(a, b) {
    return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}
/**
 * Get all entities within a selection box
 */
export function getSelectionFromBox(box, fieldState) {
    const bounds = getBoxBounds(box);
    const selection = new Set();
    // Check facilities
    for (const facility of fieldState.facilities) {
        const facilityBox = {
            minX: facility.x,
            minY: facility.y,
            maxX: facility.x + facility.width,
            maxY: facility.y + facility.height,
        };
        if (boxesOverlap(bounds, facilityBox)) {
            selection.add(facility.id);
        }
    }
    // Check fixtures
    for (const fixture of fieldState.pathFixtures) {
        const fixtureBox = {
            minX: fixture.x,
            minY: fixture.y,
            maxX: fixture.x + 1,
            maxY: fixture.y + 1,
        };
        if (boxesOverlap(bounds, fixtureBox)) {
            selection.add(fixture.id);
        }
    }
    // Check paths
    for (const path of fieldState.paths) {
        if (path.points.length < 2) {
            continue;
        }
        let pathIntersects = false;
        for (let i = 0; i < path.points.length - 1; i++) {
            const [x1, y1] = path.points[i];
            const [x2, y2] = path.points[i + 1];
            const segmentBox = {
                minX: Math.min(x1, x2),
                minY: Math.min(y1, y2),
                maxX: Math.max(x1, x2) + 1,
                maxY: Math.max(y1, y2) + 1,
            };
            if (boxesOverlap(bounds, segmentBox)) {
                pathIntersects = true;
                break;
            }
        }
        if (pathIntersects) {
            selection.add(path.id);
        }
    }
    return selection;
}
