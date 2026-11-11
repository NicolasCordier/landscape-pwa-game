import type { Token } from './cell';

// Solo rules, gathered here so they can be tuned without touching the engine.
export const SOLO_CONFIG = {
    // Provisional bag composition (120 tokens), to rebalance for Landscape's own cards
    bag: {
        BLUE:   23,
        GRAY:   23,
        BROWN:  21,
        GREEN:  19,
        YELLOW: 19,
        RED:    15,
    } satisfies Record<Token, number>,
    tokenGroups:   3, // groups in the central offer
    groupSize:     3, // tokens per group
    cardOffer:     3, // face-up animal cards
    spiritOffer:   2, // spirits offered before turn 1
    maxHand:       4, // unfinished cards in hand, spirit included
    endEmptyCells: 2, // game ends when the board has this many empty cells or fewer
};

export type Rng = () => number;

// Small seeded PRNG (mulberry32): same seed, same sequence
export function seededRng(seed: number): Rng {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Fisher-Yates shuffle, returns a new array
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
