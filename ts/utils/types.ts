
export type Immutable<T> = {
    readonly [P in keyof T]: Immutable<T[P]>
}

export type Mutable<T> = {
    -readonly [P in keyof T]: Mutable<T[P]>
}

/**
 * Helper to convert Immutable<T> back to T by creating a shallow copy.
 * TypeScript will treat this as mutable.
 */
export function makeMutable<T>(obj: Immutable<T>): T {
    if (Array.isArray(obj)) {
        return obj.map(item => makeMutable(item)) as unknown as T
    }
    if (obj && typeof obj === 'object') {
        return { ...obj } as T
    }
    return obj as T
}

export function objectEntries<K extends string | number | symbol, V>(obj: Partial<Record<K, V>>): [K, V][] {
    return Object.entries(obj) as [K, V][]
}

export function objectFromEntries<K extends string | number | symbol, V>(entries: [K, V][]): { [key in K]: V } {
    return Object.fromEntries(entries) as { [key in K]: V }
}

export function objectKeys<K extends string | number | symbol>(obj: Partial<Record<K, unknown>>): K[] {
    return Object.keys(obj) as K[]
}

export function objectValues<V>(obj: Partial<Record<string | number | symbol, V>>): V[] {
    return Object.values(obj) as V[]
}

export function tuple<T extends unknown[]>(...args: T): T {
    return args
}
