import { describe, expect, it } from 'vitest';
import { ALL_SPIRIT_CARDS } from '../../game/cards';
import { SPIRIT_BONUS_TEXT } from './spiritText';

describe('spirit bonus texts', () => {
    it('describes every spirit card', () => {
        for (const spirit of ALL_SPIRIT_CARDS) {
            expect(SPIRIT_BONUS_TEXT[spirit.id], spirit.id).toBeTruthy();
        }
        expect(Object.keys(SPIRIT_BONUS_TEXT)).toHaveLength(ALL_SPIRIT_CARDS.length);
    });
});
