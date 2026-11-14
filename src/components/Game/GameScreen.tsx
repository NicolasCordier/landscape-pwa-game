import { useMemo, useState } from 'react';
import type { Dispatch } from 'react';
import type { BaseCard } from '../../game/cards';
import type { Cell } from '../../game/cell';
import { SOLO_CONFIG } from '../../game/config';
import {
    buildCard, buildGrid, canDiscardCard, canEndTurn, canTakeCard, cardTemplate, hasTakenGroup,
    scoreOf, validCubeCells, validTokenCells,
} from '../../game/state';
import type { Placement } from '../../game/history';
import type { GameAction, GameState } from '../../game/state';
import { formatCardName } from '../Cards/cardName';
import { CardZoom } from '../Cards/CardZoom';
import type { CardZoomAction } from '../Cards/CardZoom';
import { PlayerHand } from '../Cards/PlayerHand';
import { SelectableCards } from '../Cards/SelectableCards';
import { SpiritChoice } from '../Cards/SpiritChoice';
import { HexBoard } from '../HexBoard/HexBoard';
import { TokenPicker } from '../Tokens/TokenPicker';
import { TokensToPlace } from '../Tokens/TokensToPlace';
import { ScoreScreen } from './ScoreScreen';

type Selection =
    | { kind: 'token'; index: number }
    | { kind: 'card'; cardId: string }
    | null;

// Card shown in large: from the offer, from the hand, or a spirit offered before turn 1
type Zoom = { card: BaseCard; from: 'offer' | 'hand' | 'spirit' } | null;

interface GameScreenProps {
    state:     GameState;
    dispatch:  Dispatch<GameAction>;
    placement: Placement | null; // where the finished game stands in the leaderboard
    onReplay:  () => void;
    onHome:    () => void;
}

export function GameScreen({ state, dispatch: act, placement, onReplay, onHome }: GameScreenProps) {
    const [selection, setSelection] = useState<Selection>(null);
    const [zoom, setZoom] = useState<Zoom>(null);

    const grid         = useMemo(() => buildGrid(state.face, state.board), [state.face, state.board]);
    const offerCards   = useMemo(() => state.cardOffer.map(id => id === null ? null : cardTemplate(id)), [state.cardOffer]);
    const handCards    = useMemo(() => state.hand.map(buildCard), [state.hand]);
    const spiritCards  = useMemo(() => state.spiritOffer.map(cardTemplate), [state.spiritOffer]);
    const choosing     = state.status === 'choosing-spirit';

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

    function handleCardAction(action: GameAction) {
        act(action);
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
            <ScoreScreen
                grid={grid}
                score={scoreOf(state)}
                turns={state.turn}
                face={state.face}
                placement={placement}
                spiritName={state.spirit ? formatCardName(state.spirit) : undefined}
                onReplay={onReplay}
                onHome={onHome}
            />
        );
    }

    const takenGroup = hasTakenGroup(state);
    const remaining  = state.tokensToPlace.length;

    let instruction: string;
    if (choosing) {
        instruction = 'Choisis ton esprit, ou aucun';
    } else if (!takenGroup) {
        instruction = 'Choisis un groupe de jetons';
    } else if (remaining > 0) {
        instruction = `Pose tes jetons : ${remaining} restant${remaining > 1 ? 's' : ''}`;
    } else if (canDiscardCard(state)) {
        instruction = 'Prends ou défausse une carte, pose des cubes ou termine ton tour';
    } else {
        instruction = 'Pose des cubes ou termine ton tour';
    }
    if (activeSelection && highlighted.size === 0) {
        instruction = activeSelection.kind === 'token'
            ? 'Ce jeton ne peut être posé nulle part'
            : 'Aucune case ne permet de poser un cube pour cette carte';
    }

    let offerNote: string | undefined;
    if (choosing) {
        offerNote = 'Choisis d\'abord ton esprit.';
    } else if (state.cardActionThisTurn) {
        offerNote = 'Tu as déjà pris ou défaussé une carte ce tour.';
    } else if (!canTakeCard(state)) {
        offerNote = `Ta main est pleine (${SOLO_CONFIG.maxHand} cartes) : tu peux seulement défausser.`;
    }

    const zoomActions: CardZoomAction[] = [];
    if (zoom?.from === 'offer') {
        const cardId = zoom.card.id;
        if (canTakeCard(state)) {
            zoomActions.push({ label: 'Prendre cette carte', primary: true, onClick: () => handleCardAction({ type: 'TAKE_CARD', cardId }) });
        }
        if (canDiscardCard(state)) {
            zoomActions.push({ label: 'Défausser cette carte', onClick: () => handleCardAction({ type: 'DISCARD_CARD', cardId }) });
        }
    } else if (zoom?.from === 'spirit' && choosing) {
        const cardId = zoom.card.id;
        zoomActions.push({ label: 'Prendre cet esprit', primary: true, onClick: () => handleCardAction({ type: 'CHOOSE_SPIRIT', cardId }) });
    }

    return (
        <>
            <div className="game">
                <section className="area-offer">
                    <TokenPicker groups={state.tokenOffer} disabled={choosing || takenGroup} onTake={handleTakeGroup} />
                    <SelectableCards cards={offerCards} onOpen={card => setZoom({ card, from: 'offer' })} />
                </section>

                <section className="area-board">
                    <HexBoard grid={grid} onCellClick={handleCellClick} highlightedCells={highlighted} />
                </section>

                <section className="area-hand">
                    <div className="turn-status">
                        <span className="turn-number">Tour {state.turn}</span>
                        <span className="turn-instruction" role="status">{instruction}</span>
                        <button type="button" className="turn-home" onClick={onHome}>Accueil</button>
                    </div>
                    {choosing ? (
                        <SpiritChoice
                            spirits={spiritCards}
                            onOpen={spirit => setZoom({ card: spirit, from: 'spirit' })}
                            onNone={() => act({ type: 'CHOOSE_SPIRIT', cardId: null })}
                        />
                    ) : (
                        <>
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
                        </>
                    )}
                </section>
            </div>

            {zoom && (
                <CardZoom
                    card={zoom.card}
                    onClose={() => setZoom(null)}
                    actions={zoomActions}
                    note={zoom.from === 'offer' ? offerNote : undefined}
                />
            )}
        </>
    );
}
