import type { BaseCard } from '../../game/cards';
import { SpiritCard } from '../../game/cards';

// End-of-game bonus of each spirit, written from its scoreBonus in cards.ts.
// A "group" is a set of adjacent cells of the same terrain.
export const SPIRIT_BONUS_TEXT: Record<string, string> = {
    lion:      'Chaque groupe de champs rapporte 2 pts s\'il compte 1 ou 2 cases, 10 pts s\'il en compte 3 ou plus.',
    butterfly: '5 pts par groupe de champs.',
    deer:      '4 pts par arbre de 2 ou 3 étages.',
    owl:       '3 pts par arbre de 1 ou 2 étages, 1 pt par arbre de 3 étages.',
    night_cat: '4 pts par groupe de bâtiments.',
    phoenix:   '6 pts par groupe d\'au moins 2 bâtiments.',
    ram:       '4 pts par montagne de 2 ou 3 étages.',
    marmot:    '3 pts par montagne de 1 ou 2 étages, 1 pt par arbre de 3 étages.',
    dragonfly: '7 pts par rivière d\'au moins 2 cases.',
    turtle:    '2 pts par case de rivière.',
};

export function isSpirit(card: BaseCard): card is SpiritCard {
    return card instanceof SpiritCard;
}
