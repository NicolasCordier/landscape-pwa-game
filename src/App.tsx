import { useMemo, useReducer, useState } from 'react';
import './App.css';
import PWABadge from './PWABadge.tsx';
import { CardZoom } from './components/Cards/CardZoom.tsx';
import { PlayerHand } from './components/Cards/PlayerHand.tsx';
import { SelectableCards } from './components/Cards/SelectableCards.tsx';
import { ScoreScreen } from './components/Game/ScoreScreen.tsx';
import { HexBoard } from './components/HexBoard/HexBoard.tsx';
import { TokenPicker } from './components/Tokens/TokenPicker.tsx';
import { TokensToPlace } from './components/Tokens/TokensToPlace.tsx';
import type { BaseCard } from './game/cards.ts';
import type { Cell } from './game/cell.ts';
import { SOLO_CONFIG } from './game/config.ts';
import {
    buildCard, buildGrid, canEndTurn, canTakeCard, cardTemplate, gameReducer, hasTakenGroup,
    newGame, scoreOf, validCubeCells, validTokenCells,
} from './game/state.ts';

type Selection =
    | { kind: 'token'; index: number }
    | { kind: 'card'; cardId: string }
    | null;

// Card shown in large: from the offer (can be taken) or from the hand
type Zoom = { card: BaseCard; from: 'offer' | 'hand' } | null;

function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 32);
}

function App() {
    const [state, dispatch] = useReducer(gameReducer, undefined, () => newGame(randomSeed()));
    const [selection, setSelection] = useState<Selection>(null);
    const [zoom, setZoom] = useState<Zoom>(null);

    const grid       = useMemo(() => buildGrid(state.face, state.board), [state.face, state.board]);
    const offerCards = useMemo(() => state.cardOffer.map(cardTemplate), [state.cardOffer]);
    const handCards  = useMemo(() => state.hand.map(buildCard), [state.hand]);

    // Drop a selection that no longer points to anything (token placed, card finished, turn restarted)
    const activeSelection: Selection =
        selection?.kind === 'token' && selection.index < state.tokensToPlace.length ? selection
        : selection?.kind === 'card' && state.hand.some(c => c.cardId === selection.cardId) ? selection
        : null;

    const highlighted = useMemo<ReadonlySet<string>>(() => {
        if (activeSelection?.kind === 'token') {
            return validTokenCells(state, state.tokensToPlace[activeSelection.index]);
        }
        if (activeSelection?.kind === 'card') {
            return validCubeCells(state, activeSelection.cardId);
        }
        return new Set();
    }, [state, activeSelection]);

    const act = dispatch;

    function handleTakeGroup(index: number) {
        act({ type: 'TAKE_GROUP', index });
        setSelection({ kind: 'token', index: 0 });
    }

    function handleCellClick(cell: Cell) {
        if (activeSelection?.kind === 'token' && highlighted.has(cell.id)) {
            act({ type: 'PLACE_TOKEN', tokenIndex: activeSelection.index, cellId: cell.id });
            // Keep placing: select the first remaining token
            setSelection(state.tokensToPlace.length > 1 ? { kind: 'token', index: 0 } : null);
        } else if (activeSelection?.kind === 'card' && highlighted.has(cell.id)) {
            act({ type: 'PLACE_CUBE', cardId: activeSelection.cardId, cellId: cell.id });
        }
    }

    function handleSelectHandCard(card: BaseCard) {
        setSelection(activeSelection?.kind === 'card' && activeSelection.cardId === card.id
            ? null
            : { kind: 'card', cardId: card.id });
    }

    function handleTakeCard(card: BaseCard) {
        act({ type: 'TAKE_CARD', cardId: card.id });
        setZoom(null);
    }

    function handleRestart() {
        act({ type: 'RESTART_TURN' });
        setSelection(null);
    }

    function handleEndTurn() {
        act({ type: 'END_TURN' });
        setSelection(null);
    }

    if (state.status === 'over') {
        return (
            <>
                <ScoreScreen
                    grid={grid}
                    score={scoreOf(state)}
                    turns={state.turn}
                    onReplay={() => act({ type: 'NEW_GAME', seed: randomSeed() })}
                />
                <PWABadge />
            </>
        );
    }

    const takenGroup = hasTakenGroup(state);
    const remaining  = state.tokensToPlace.length;

    let instruction: string;
    if (!takenGroup) {
        instruction = 'Choisis un groupe de jetons';
    } else if (remaining > 0) {
        instruction = `Pose tes jetons : ${remaining} restant${remaining > 1 ? 's' : ''}`;
    } else {
        instruction = 'Prends une carte, pose des cubes ou termine ton tour';
    }
    if (activeSelection && highlighted.size === 0) {
        instruction = activeSelection.kind === 'token'
            ? 'Ce jeton ne peut être posé nulle part'
            : 'Aucune case ne permet de poser un cube pour cette carte';
    }

    const takeCardNote = !canTakeCard(state)
        ? (state.cardTakenThisTurn ? 'Tu as déjà pris une carte ce tour.' : `Ta main est pleine (${SOLO_CONFIG.maxHand} cartes).`)
        : undefined;

    return (
        <>
            <div className="game">
                <section className="area-offer">
                    <TokenPicker groups={state.tokenOffer} disabled={takenGroup} onTake={handleTakeGroup} />
                    <SelectableCards cards={offerCards} onOpen={card => setZoom({ card, from: 'offer' })} />
                </section>

                <section className="area-board">
                    <HexBoard grid={grid} onCellClick={handleCellClick} highlightedCells={highlighted} />
                </section>

                <section className="area-hand">
                    <div className="turn-status">
                        <span className="turn-number">Tour {state.turn}</span>
                        <span className="turn-instruction" role="status">{instruction}</span>
                    </div>
                    {remaining > 0 && (
                        <TokensToPlace
                            tokens={state.tokensToPlace}
                            selectedIndex={activeSelection?.kind === 'token' ? activeSelection.index : null}
                            onSelect={index => setSelection({ kind: 'token', index })}
                        />
                    )}
                    <PlayerHand
                        cards={handCards}
                        maxCards={SOLO_CONFIG.maxHand}
                        selectedId={activeSelection?.kind === 'card' ? activeSelection.cardId : undefined}
                        onSelect={handleSelectHandCard}
                        onZoom={card => setZoom({ card, from: 'hand' })}
                    />
                    <div className="turn-actions">
                        <button type="button" onClick={handleRestart}>Recommencer le tour</button>
                        <button type="button" className="primary" disabled={!canEndTurn(state)} onClick={handleEndTurn}>
                            Terminer le tour
                        </button>
                    </div>
                </section>
            </div>

            {zoom && (
                <CardZoom
                    card={zoom.card}
                    onClose={() => setZoom(null)}
                    actionLabel={zoom.from === 'offer' ? 'Prendre cette carte' : undefined}
                    onAction={zoom.from === 'offer' && canTakeCard(state) ? () => handleTakeCard(zoom.card) : undefined}
                    note={zoom.from === 'offer' ? takeCardNote : undefined}
                />
            )}
            <PWABadge />
        </>
    );
}

export default App;
