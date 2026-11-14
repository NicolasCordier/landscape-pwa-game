import { useState } from 'react';
import type { Face } from '../../game/state';

// What the home screen shows of the game in progress
export interface CurrentGame {
    face: Face;
    turn: number;
}

interface HomeScreenProps {
    face:         Face; // preselected; only remembered on the device once a game starts
    onFaceChange: (face: Face) => void;
    current:      CurrentGame | null; // game in progress, if any
    onStart:      (face: Face) => void;
    onResume:     () => void;
    onShowCards:  () => void;
    onShowScores: () => void;
}

const FACES: { face: Face; label: string; detail: string }[] = [
    { face: 'A', label: 'Face A', detail: '23 cases' },
    { face: 'B', label: 'Face B', detail: '25 cases, rivière en îles' },
];

// Entry point: resume the game in progress, set up and start a new one, or see the scores
export function HomeScreen({ face, onFaceChange, current, onStart, onResume, onShowCards, onShowScores }: HomeScreenProps) {
    const [confirming, setConfirming] = useState(false);

    // Starting a game replaces the one in progress: ask first
    function handleStart() {
        if (current) {
            setConfirming(true);
        } else {
            onStart(face);
        }
    }

    return (
        <main className="home-screen">
            <h1 className="home-title">Landscape</h1>

            {current && (
                <button type="button" className="primary home-resume" onClick={onResume}>
                    Reprendre la partie
                    <span className="home-resume-detail">Face {current.face} · tour {current.turn}</span>
                </button>
            )}

            <fieldset className="home-option">
                <legend>{current ? 'Nouvelle partie' : 'Plateau'}</legend>
                <div className="face-choice">
                    {FACES.map(option => (
                        <button
                            key={option.face}
                            type="button"
                            className={`face-button${option.face === face ? ' selected' : ''}`}
                            aria-pressed={option.face === face}
                            onClick={() => onFaceChange(option.face)}
                        >
                            <span className="face-label">{option.label}</span>
                            <span className="face-detail">{option.detail}</span>
                        </button>
                    ))}
                </div>
            </fieldset>

            <button type="button" className={`home-start${current ? '' : ' primary'}`} onClick={handleStart}>
                Commencer
            </button>

            <div className="home-links">
                <button type="button" onClick={onShowScores}>
                    Scores
                </button>
                <button type="button" onClick={onShowCards}>
                    Voir les cartes
                </button>
            </div>

            {confirming && (
                <div className="overlay" onClick={() => setConfirming(false)}>
                    <div
                        className="confirm-dialog"
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 id="confirm-title">Abandonner la partie en cours ?</h2>
                        <p>La partie en cours (face {current?.face}, tour {current?.turn}) sera remplacée par une nouvelle partie en face {face}.</p>
                        <div className="confirm-actions">
                            <button type="button" onClick={() => setConfirming(false)}>Annuler</button>
                            <button type="button" className="primary" onClick={() => onStart(face)}>Nouvelle partie</button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
