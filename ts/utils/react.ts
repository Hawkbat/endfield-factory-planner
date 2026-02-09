import { objectEntries } from "./types.ts"

export function cn(...classes: (string | false | null | undefined | Record<string, boolean | undefined>)[]) {
    return classes.map(c => {
        if (!c) return ''
        if (typeof c === 'string') return c
        return objectEntries(c).filter(([_, v]) => v).map(([k, _]) => k).join(' ')
    }).filter(c => c).join(' ')
}
