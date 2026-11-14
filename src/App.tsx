import { useReducer, useState } from 'react';
import './App.css';
import PWABadge from './PWABadge.tsx';
import { CardsScreen } from './components/Cards/CardsScreen.tsx';
import { GameScreen } from './components/Game/GameScreen.tsx';
import { HomeScreen } from './components/Home/HomeScreen.tsx';
import { loadSettings, saveSettings } from './game/settings.ts';
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
    const [state, dispatch] = useReducer(appReducer, null);

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
                <HomeScreen initialFace={face} onStart={startGame} onShowCards={() => setScreen('cards')} />
            )}
            <PWABadge />
        </>
    );
}

export default App;
