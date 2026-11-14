import { useState } from 'react';
import { byDate, leaderboard } from '../../game/history';
import type { GameRecord, History } from '../../game/history';
import type { Face } from '../../game/state';
import { formatCardName } from '../Cards/cardName';
import { GameDetail } from './GameDetail';
import { formatDate } from './format';

interface HistoryScreenProps {
    history:     History;
    initialFace: Face; // face preselected on the home screen
    onBack:      () => void;
}

type Tab = 'leaderboard' | 'history';

const TABS: { tab: Tab; label: string }[] = [
    { tab: 'leaderboard', label: 'Classement' },
    { tab: 'history',     label: 'Historique' },
];

// Leaderboard by face and list of every finished game; tap a game for its detail
export function HistoryScreen({ history, initialFace, onBack }: HistoryScreenProps) {
    const [tab, setTab] = useState<Tab>('leaderboard');
    const [face, setFace] = useState<Face>(initialFace);
    const [opened, setOpened] = useState<GameRecord | null>(null);

    if (opened) {
        return <GameDetail record={opened} onBack={() => setOpened(null)} />;
    }

    const games = tab === 'leaderboard' ? leaderboard(history, face) : byDate(history);
    const empty = tab === 'leaderboard'
        ? `Aucune partie terminée en face ${face}`
        : 'Aucune partie terminée pour le moment';

    return (
        <main className="history-screen">
            <header className="history-header">
                <div className="history-title">
                    <button type="button" onClick={onBack}>Accueil</button>
                    <h1>Scores</h1>
                </div>
                <div className="history-tabs" role="tablist">
                    {TABS.map(t => (
                        <button
                            key={t.tab}
                            type="button"
                            role="tab"
                            aria-selected={t.tab === tab}
                            className={t.tab === tab ? 'selected' : ''}
                            onClick={() => setTab(t.tab)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
                {tab === 'leaderboard' && (
                    <div className="face-choice history-faces">
                        {(['A', 'B'] as const).map(f => (
                            <button
                                key={f}
                                type="button"
                                className={`face-button${f === face ? ' selected' : ''}`}
                                aria-pressed={f === face}
                                onClick={() => setFace(f)}
                            >
                                <span className="face-label">Face {f}</span>
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {games.length === 0 ? (
                <p className="history-empty">{empty}</p>
            ) : (
                <ol className="history-list">
                    {games.map((game, i) => (
                        <li key={game.id}>
                            <button type="button" className="history-row" onClick={() => setOpened(game)}>
                                {tab === 'leaderboard' && <span className="history-rank">{i + 1}</span>}
                                <span className="history-info">
                                    <span>{formatDate(game.endedAt)}</span>
                                    <span className="history-meta">
                                        {tab === 'history' && `Face ${game.face} · `}
                                        {game.spirit ? formatCardName(game.spirit.cardId) : 'Sans esprit'}
                                    </span>
                                </span>
                                <span className="history-total">{game.score.total}</span>
                            </button>
                        </li>
                    ))}
                </ol>
            )}
        </main>
    );
}
