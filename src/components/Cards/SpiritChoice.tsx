import type { BaseCard } from '../../game/cards';
import { CompactCard } from './CompactCard';

interface SpiritChoiceProps {
    spirits: BaseCard[];
    onOpen:  (spirit: BaseCard) => void; // opens the spirit in large, where it can be taken
    onNone:  () => void;
}

// Before turn 1, shown in place of the hand: the offered spirits and a "none" slot
export function SpiritChoice({ spirits, onOpen, onNone }: SpiritChoiceProps) {
    return (
        <div className="card-row">
            {spirits.map(spirit => (
                <CompactCard key={spirit.id} card={spirit} onClick={() => onOpen(spirit)} />
            ))}
            <button type="button" className="compact-card empty spirit-none" onClick={onNone}>
                Aucun
            </button>
        </div>
    );
}
