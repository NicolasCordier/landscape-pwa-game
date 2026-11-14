import { useEffect, useReducer, useRef, useState } from 'react';
import './App.css';
import PWABadge from './PWABadge.tsx';
import { CardsScreen } from './components/Cards/CardsScreen.tsx';
import { GameScreen } from './components/Game/GameScreen.tsx';
import { HistoryScreen } from './components/History/HistoryScreen.tsx';
import { HomeScreen } from './components/Home/HomeScreen.tsx';
import { addRecord, loadHistory, placement, recordOf, saveHistory } from './game/history.ts';
import type { History } from './game/history.ts';
import { loadSettings, saveSettings } from './game/settings.ts';
import { clearCurrentGame, loadCurrentGame, saveCurrentGame } from './game/storage.ts';
import { gameReducer, newGame } from './game/state.ts';
import type { Face, GameAction, GameState } from './game/state.ts';

function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 32);
}

// crypto.randomUUID is not available over plain HTTP (phone testing on the local network)
function gameId(seed: number): string {
    return `${Date.now().toString(36)}-${seed.toString(36)}`;
}

// No game until the player starts one from the home screen
function appReducer(state: GameState | null, action: GameAction): GameState | null {
    if (action.type === 'NEW_GAME') {
        return newGame(action.seed, action.face, action.id);
    }
    return state && gameReducer(state, action);
}

// Games recorded by another tab are kept: the stored history is merged with the one in memory
function withRecord(inMemory: History, state: GameState): History {
    const merged = [...loadHistory(), ...inMemory].reduce(addRecord, [] as History);
    return addRecord(merged, recordOf(state, new Date().toISOString()));
}

function App() {
    const [face, setFace] = useState<Face>(() => loadSettings().face);
    const [screen, setScreen] = useState<'home' | 'game' | 'cards' | 'scores'>('home');
    // The saved game is loaded at launch, but only shown once the player resumes it
    const [state, dispatch] = useReducer(appReducer, null, () => loadCurrentGame());
    // Kept in memory too, so the leaderboard works even when storage is unavailable
    const [history, setHistory] = useState<History>(() => loadHistory());
    const loadedHistory = useRef(history);

    // Rejected actions return the same state, so this only runs when the game changes
    useEffect(() => {
        if (state === null) {
            return;
        }
        if (state.status === 'over') {
            clearCurrentGame();
            // Recorded once: a game already in the history is not added again
            setHistory(current => withRecord(current, state));
        } else {
            saveCurrentGame(state);
        }
    }, [state]);

    // Written only after a game is added, not when the history is just loaded
    useEffect(() => {
        if (history !== loadedHistory.current) {
            saveHistory(history);
        }
    }, [history]);

    // The game in memory decides: resuming works even when storage is unavailable
    const current = state && state.status !== 'over' ? state : null;

    function startGame(chosen: Face) {
        setFace(chosen);
        saveSettings({ face: chosen });
        const seed = randomSeed();
        dispatch({ type: 'NEW_GAME', seed, face: chosen, id: gameId(seed) });
        setScreen('game');
    }

    return (
        <>
            {screen === 'game' && state ? (
                <GameScreen
                    state={state}
                    dispatch={dispatch}
                    placement={state.status === 'over' ? placement(history, state.id) : null}
                    onReplay={() => startGame(state.face)}
                    onHome={() => setScreen('home')}
                />
            ) : screen === 'cards' ? (
                <CardsScreen onBack={() => setScreen('home')} />
            ) : screen === 'scores' ? (
                <HistoryScreen history={history} initialFace={face} onBack={() => setScreen('home')} />
            ) : (
                <HomeScreen
                    face={face}
                    onFaceChange={setFace}
                    current={current && { face: current.face, turn: current.turn }}
                    onStart={startGame}
                    onResume={() => setScreen('game')}
                    onShowCards={() => setScreen('cards')}
                    onShowScores={() => setScreen('scores')}
                />
            )}
            <PWABadge />
        </>
    );
}

export default App;
