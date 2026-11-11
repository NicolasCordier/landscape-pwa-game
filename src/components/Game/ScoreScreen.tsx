import type { BoardGrid } from '../../game/cell';
import type { ScoreBreakdown } from '../../game/scoring';
import { HexBoard } from '../HexBoard/HexBoard';

interface ScoreScreenProps {
    grid:      BoardGrid;
    score:     ScoreBreakdown;
    turns:     number;
    spiritName?: string; // spirit taken this game, if any
    onReplay:  () => void;
    onHome:    () => void;
}

const CATEGORIES: { key: keyof Omit<ScoreBreakdown, 'total'>; label: string }[] = [
    { key: 'trees',     label: 'Arbres' },
    { key: 'mountains', label: 'Montagnes' },
    { key: 'fields',    label: 'Champs' },
    { key: 'buildings', label: 'Bâtiments' },
    { key: 'river',     label: 'Rivière' },
    { key: 'animals',   label: 'Animaux' },
    { key: 'spirit',    label: 'Esprit' },
];

export function ScoreScreen({ grid, score, turns, spiritName, onReplay, onHome }: ScoreScreenProps) {
    return (
        <div className="game score-screen">
            <div className="area-board">
                <HexBoard grid={grid} />
            </div>
            <div className="area-side score-panel">
                <h2>Partie terminée</h2>
                <p className="score-turns">{turns} tours</p>
                <table className="score-table">
                    <tbody>
                        {CATEGORIES.map(({ key, label }) => (
                            <tr key={key}>
                                <td>{key === 'spirit' && spiritName ? `${label} (${spiritName})` : label}</td>
                                <td>{score[key]}</td>
                            </tr>
                        ))}
                        <tr className="score-total">
                            <td>Total</td>
                            <td>{score.total}</td>
                        </tr>
                    </tbody>
                </table>
                <div className="score-actions">
                    <button type="button" onClick={onHome}>Accueil</button>
                    <button type="button" className="primary" onClick={onReplay}>Rejouer</button>
                </div>
            </div>
        </div>
    );
}
