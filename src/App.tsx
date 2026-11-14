import { useEffect, useReducer, useState } from 'react';
import './App.css';
import PWABadge from './PWABadge.tsx';
import { CardsScreen } from './components/Cards/CardsScreen.tsx';
import { GameScreen } from './components/Game/GameScreen.tsx';
import { HomeScreen } from './components/Home/HomeScreen.tsx';
import { loadSettings, saveSettings } from './game/settings.ts';
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from './game/storage.ts';
import { gameReducer, newGame } from './game/state.ts';
import type { Face, GameAction, GameState } from './game/state.ts';

function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 32);
}

// No game until the player starts one from the home screen
function appReducer(state: GameState | null, action: GameAction): GameState | null {
    if (action.type === 'NEW_GAME') {
        return newGame(action.seed, action.face);
    }
    return state && gameReducer(state, action);
}

function App() {
    const [face, setFace] = useState<Face>(() => loadSettings().face);
    const [screen, setScreen] = useState<'home' | 'game' | 'cards'>('home');
    // The saved game is loaded at launch, but only shown once the player resumes it
    const [state, dispatch] = useReducer(appReducer, null, () => loadCurrentGame());

    // Rejected actions return the same state, so this only runs when the game changes
    useEffect(() => {
        if (state === null) {
            return;
        }
        if (state.status === 'over') {
            clearCurrentGame();
        } else {
            saveCurrentGame(state);
        }
    }, [state]);

    // The game in memory decides: resuming works even when storage is unavailable
    const current = state && state.status !== 'over' ? state : null;

    function startGame(chosen: Face) {
        setFace(chosen);
        saveSettings({ face: chosen });
        dispatch({ type: 'NEW_GAME', seed: randomSeed(), face: chosen });
        setScreen('game');
    }

    return (
        <>
            {screen === 'game' && state ? (
                <GameScreen
                    state={state}
                    dispatch={dispatch}
                    onReplay={() => startGame(state.face)}
                    onHome={() => setScreen('home')}
                />
            ) : screen === 'cards' ? (
                <CardsScreen onBack={() => setScreen('home')} />
            ) : (
                <HomeScreen
                    initialFace={face}
                    current={current && { face: current.face, turn: current.turn }}
                    onStart={startGame}
                    onResume={() => setScreen('game')}
                    onShowCards={() => setScreen('cards')}
                />
            )}
            <PWABadge />
        </>
    );
}

export default App;
