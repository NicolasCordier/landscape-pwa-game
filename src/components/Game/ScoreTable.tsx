import type { ScoreBreakdown } from '../../game/scoring';

interface ScoreTableProps {
    score:       ScoreBreakdown;
    spiritName?: string; // spirit taken, if any
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

// Score by category, shared by the end of game screen and the history
export function ScoreTable({ score, spiritName }: ScoreTableProps) {
    return (
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
    );
}
