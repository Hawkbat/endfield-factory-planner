/**
 * Helper to convert Immutable<T> back to T by creating a shallow copy.
 * TypeScript will treat this as mutable.
 */
export function makeMutable(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => makeMutable(item));
    }
    if (obj && typeof obj === 'object') {
        return { ...obj };
    }
    return obj;
}
export function objectEntries(obj) {
    return Object.entries(obj);
}
export function objectFromEntries(entries) {
    return Object.fromEntries(entries);
}
export function objectKeys(obj) {
    return Object.keys(obj);
}
export function objectValues(obj) {
    return Object.values(obj);
}
export function tuple(...args) {
    return args;
}
