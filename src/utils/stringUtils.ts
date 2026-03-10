export const getInitials = (name: string) => {
    const splitName = name.split(" ");
    return `${splitName[0].charAt(0)}${splitName[1].charAt(0)}`;
}

export function toSlug(name: string, id: string): string {
    return `${name.toLowerCase().replace(/\s+/g, "-")}-${id}`
}