export function formatCardName(id: string): string {
    return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
