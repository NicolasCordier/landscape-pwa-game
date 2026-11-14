import { useMemo } from 'react';
import type { GameRecord } from '../../game/history';
import { buildGrid } from '../../game/state';
import { formatCardName } from '../Cards/cardName';
import { ScoreTable } from '../Game/ScoreTable';
import { HexBoard } from '../HexBoard/HexBoard';
import { formatDate, turnsLabel } from './format';

interface GameDetailProps {
    record: GameRecord;
    onBack: () => void;
}

// A past game: final board, score, cards and spirit. Same layout as the end of game screen.
export function GameDetail({ record, onBack }: GameDetailProps) {
    const grid = useMemo(() => buildGrid(record.face, record.board), [record]);
    const spiritName = record.spirit ? formatCardName(record.spirit.cardId) : undefined;

    return (
        <div className="game score-screen game-detail">
            <div className="area-board">
                <HexBoard grid={grid} />
            </div>
            <div className="area-side score-panel">
                <div className="detail-header">
                    <button type="button" onClick={onBack}>Retour</button>
                    <h2>Face {record.face}</h2>
                </div>
                <p className="score-turns">{formatDate(record.endedAt)} · {turnsLabel(record.turns)}</p>
                <ScoreTable score={record.score} spiritName={spiritName} />

                <section className="detail-cards" aria-label="Cartes de la partie">
                    <h3>Cartes</h3>
                    {record.cards.length === 0 ? (
                        <p className="history-empty">Aucune carte prise</p>
                    ) : (
                        <ul>
                            {record.cards.map(card => (
                                <li key={card.cardId}>
                                    <span>{formatCardName(card.cardId)}</span>
                                    <span className="detail-cubes">{card.cubesPlaced}/{card.cubesTotal}</span>
                                    <span className="detail-points">{card.points} pts</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    <h3>Esprit</h3>
                    {record.spirit ? (
                        <ul>
                            <li>
                                <span>{spiritName}</span>
                                <span className="detail-cubes">{record.spirit.cubePlaced ? 'posé' : 'non posé'}</span>
                                <span className="detail-points">{record.spirit.points} pts</span>
                            </li>
                        </ul>
                    ) : (
                        <p className="history-empty">Aucun esprit</p>
                    )}
                </section>
            </div>
        </div>
    );
}
