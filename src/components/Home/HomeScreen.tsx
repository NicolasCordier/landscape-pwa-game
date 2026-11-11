import { useState } from 'react';
import type { Face } from '../../game/state';

interface HomeScreenProps {
    initialFace: Face;
    onStart:     (face: Face) => void;
}

const FACES: { face: Face; label: string; detail: string }[] = [
    { face: 'A', label: 'Face A', detail: '23 cases' },
    { face: 'B', label: 'Face B', detail: '25 cases, rivière en îles' },
];

// Entry point: set up the game, then start it.
// Resume and history will be added here in the next steps.
export function HomeScreen({ initialFace, onStart }: HomeScreenProps) {
    const [face, setFace] = useState<Face>(initialFace);

    return (
        <main className="home-screen">
            <h1 className="home-title">Landscape</h1>

            <fieldset className="home-option">
                <legend>Plateau</legend>
                <div className="face-choice">
                    {FACES.map(option => (
                        <button
                            key={option.face}
                            type="button"
                            className={`face-button${option.face === face ? ' selected' : ''}`}
                            aria-pressed={option.face === face}
                            onClick={() => setFace(option.face)}
                        >
                            <span className="face-label">{option.label}</span>
                            <span className="face-detail">{option.detail}</span>
                        </button>
                    ))}
                </div>
            </fieldset>

            <button type="button" className="primary home-start" onClick={() => onStart(face)}>
                Commencer
            </button>
        </main>
    );
}
