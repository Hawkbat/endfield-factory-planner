export function getEnumKey(enumObj, value) {
    const match = Object.entries(enumObj).find(([, enumValue]) => enumValue === value);
    return match ? match[0] : value;
}
export function toTitleCase(value) {
    return value
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
}
