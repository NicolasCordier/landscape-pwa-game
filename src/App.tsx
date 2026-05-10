import { useMemo, useState } from 'react';
import PWABadge from './PWABadge.tsx';
import { HexBoard } from './components/HexBoard/HexBoard.tsx';
import { SelectableCards } from './components/Cards/SelectableCards.tsx';
import { PlayerHand } from './components/Cards/PlayerHand.tsx';
import { generateBoardType } from './game/board.ts';
import { ALL_ANIMAL_CARDS } from './game/cards.ts';
import type { BaseCard } from './game/cards.ts';
import type { Cell } from './game/cell.ts';

function App() {
    const grid = useMemo(() => {
        const g = generateBoardType('A');
        // Seed a few cells with tokens for visual testing
        g[2][2].stack.push('BROWN', 'GREEN');
        g[2][1].stack.push('GRAY', 'GRAY');
        g[1][1].stack.push('YELLOW');
        g[3][2].stack.push('BLUE');
        g[0][0].stack.push('BROWN', 'RED');
        g[4][3].stack.push('GRAY', 'GRAY', 'GRAY');
        g[2][2].hasCube = true;
        g[3][2].hasCube = true;
        g[4][3].hasCube = true;
        return g;
    }, []);

    const selectableCards = useMemo(() => ALL_ANIMAL_CARDS.slice(0, 3), []);
    const handCards       = useMemo(() => ALL_ANIMAL_CARDS.slice(3, 7), []);

    const [highlightedCells, setHighlightedCells] = useState<ReadonlySet<string>>(new Set());
    const [selectedCardId,   setSelectedCardId]   = useState<string | undefined>();

    function handleCellClick(cell: Cell) {
        setHighlightedCells(prev => {
            const next = new Set(prev);
            if (next.has(cell.id)) next.delete(cell.id);
            else next.add(cell.id);
            return next;
        });
    }

    function handleCardSelect(card: BaseCard) {
        setSelectedCardId(prev => prev === card.id ? undefined : card.id);
    }

    return (
        <div style={{
            maxWidth:      700,
            margin:        '0 auto',
            height:        '100dvh',
            display:       'flex',
            flexDirection: 'column',
        }}>
            <SelectableCards
                cards={selectableCards}
                selectedId={selectedCardId}
                onSelect={handleCardSelect}
            />
            <PlayerHand
                cards={handCards}
                selectedId={selectedCardId}
                onSelect={handleCardSelect}
            />
            {/* padding absorbs the drop-shadow so it's not clipped at screen edges */}
            <div style={{ padding: '0 4px 6px' }}>
                <HexBoard
                    grid={grid}
                    onCellClick={handleCellClick}
                    highlightedCells={highlightedCells}
                />
            </div>
            <PWABadge />
        </div>
    );
}

export default App;
