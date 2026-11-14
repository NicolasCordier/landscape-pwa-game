import type { BoardGrid } from '../../game/cell';
import type { Placement } from '../../game/history';
import type { ScoreBreakdown } from '../../game/scoring';
import type { Face } from '../../game/state';
import { HexBoard } from '../HexBoard/HexBoard';
import { ordinal, turnsLabel } from '../History/format';
import { ScoreTable } from './ScoreTable';

interface ScoreScreenProps {
    grid:        BoardGrid;
    score:       ScoreBreakdown;
    turns:       number;
    face:        Face;
    spiritName?: string; // spirit taken this game, if any
    placement:   Placement | null; // null outside the leaderboard of the face
    onReplay:    () => void;
    onHome:      () => void;
}

export function ScoreScreen({ grid, score, turns, face, spiritName, placement, onReplay, onHome }: ScoreScreenProps) {
    return (
        <div className="game score-screen">
            <div className="area-board">
                <HexBoard grid={grid} />
            </div>
            <div className="area-side score-panel">
                <h2>Partie terminée</h2>
                {placement && (
                    <p className={`score-placement${placement.isRecord ? ' record' : ''}`}>
                        {placement.isRecord
                            ? `Nouveau record en face ${face} !`
                            : `${ordinal(placement.rank)} du classement de la face ${face}`}
                    </p>
                )}
                <p className="score-turns">{turnsLabel(turns)}</p>
                <ScoreTable score={score} spiritName={spiritName} />
                <div className="score-actions">
                    <button type="button" onClick={onHome}>Accueil</button>
                    <button type="button" className="primary" onClick={onReplay}>Rejouer</button>
                </div>
            </div>
        </div>
    );
}
