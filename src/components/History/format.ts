// 1 → "1er", 2 → "2e"
export function ordinal(rank: number): string {
    return rank === 1 ? '1er' : `${rank}e`;
}

// "14/11/2026 21:05": the time tells apart two games of the same day
export function formatDate(iso: string): string {
    const date = new Date(iso);
    const day = date.toLocaleDateString('fr-FR');
    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${time}`;
}

export function turnsLabel(turns: number): string {
    return turns > 1 ? `${turns} tours` : `${turns} tour`;
}
