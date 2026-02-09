import { objectEntries } from "./types.js";
export function cn(...classes) {
    return classes.map(c => {
        if (!c)
            return '';
        if (typeof c === 'string')
            return c;
        return objectEntries(c).filter(([_, v]) => v).map(([k, _]) => k).join(' ');
    }).filter(c => c).join(' ');
}
