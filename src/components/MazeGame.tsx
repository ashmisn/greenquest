import React, { useState, useEffect, useCallback } from 'react';
import { GlassWater, Recycle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Award } from 'lucide-react';
import { authAPI } from '../services/api';

// --- Maze Layout and Configuration ---
const mazeLayout = [
    ['S', 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0, 'E'],
];
const CELL_SIZE = 60;
const POINTS_PER_WIN = 15;

const MazeGame: React.FC = () => {
  const findStartPos = () => {
    for (let r = 0; r < mazeLayout.length; r++) {
      for (let c = 0; c < mazeLayout[r].length; c++) {
        if (mazeLayout[r][c] === 'S') return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  };

  // --- State Management ---
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [playerPosition, setPlayerPosition] = useState(findStartPos);
  const [timer, setTimer] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  // --- ADDED: State to track if the user can play today ---
  const [canPlay, setCanPlay] = useState(false);
  const [message, setMessage] = useState("Guide the bottle to the recycling bin!");

  // --- ADDED: Check localStorage on component mount ---
  useEffect(() => {
    const lastPlayedDate = localStorage.getItem('lastMazePlayedDate');
    const today = new Date().toLocaleDateString();
    if (lastPlayedDate === today) {
      setCanPlay(false);
      setMessage("You've completed the maze today. Come back tomorrow for another challenge!");
    } else {
      setCanPlay(true);
    }
  }, []);

  // --- Game Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // --- Movement Logic ---
  const handleMove = useCallback((dx: number, dy: number) => {
    const newRow = playerPosition.row + dy;
    const newCol = playerPosition.col + dx;

    if (
      newRow >= 0 && newRow < mazeLayout.length &&
      newCol >= 0 && newCol < mazeLayout[0].length &&
      mazeLayout[newRow][newCol] !== 1
    ) {
      setPlayerPosition({ row: newRow, col: newCol });
      setMoveCount(prev => prev + 1);
    }
  }, [playerPosition]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const moveMap: { [key: string]: [number, number] } = {
        'ArrowUp': [0, -1], 'ArrowDown': [0, 1], 'ArrowLeft': [-1, 0], 'ArrowRight': [1, 0],
      };

      if (e.key in moveMap) {
        e.preventDefault();
        const [dx, dy] = moveMap[e.key];
        handleMove(dx, dy);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleMove]);

  // --- Win Condition and Score Submission ---
  useEffect(() => {
    if (gameState === 'playing' && mazeLayout[playerPosition.row][playerPosition.col] === 'E') {
      setGameState('won');
      // --- ADDED: Save the play date upon winning ---
      const today = new Date().toLocaleDateString();
      localStorage.setItem('lastMazePlayedDate', today);
      setCanPlay(false); // Lock the game after winning
      authAPI.addGamePoints(POINTS_PER_WIN, 'Maze Challenge').catch(console.error);
    }
  }, [playerPosition, gameState]);

  // --- Game Controls ---
  const startGame = () => {
    // --- MODIFIED: Only start if the user is allowed to play ---
    if (canPlay) {
        setPlayerPosition(findStartPos());
        setMoveCount(0);
        setTimer(0);
        setGameState('playing');
    }
  };
  
  const resetAndLockGame = () => {
      setGameState('idle');
      // This will ensure the "come back tomorrow" message shows on the idle screen
      setCanPlay(false); 
      setMessage("You've completed the maze today. Come back tomorrow for another challenge!");
  }

  // --- RENDER LOGIC ---
  if (gameState === 'idle') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-12 text-center">
        <h2 className="text-3xl font-bold mb-4">Maze Challenge</h2>
        <Recycle size={80} className="mx-auto text-green-500 my-6" />
        <p className="text-gray-600 mb-8">{message}</p>
        {/* --- MODIFIED: Disable button if canPlay is false --- */}
        <button 
          onClick={startGame} 
          disabled={!canPlay}
          className={`font-bold py-4 px-8 rounded-lg text-xl inline-flex items-center gap-2 ${
              canPlay ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          }`}
        >
          <Play /> {canPlay ? 'Start Game' : 'Played Today'}
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-12 text-center">
        <h2 className="text-3xl font-bold text-green-600 mb-4">You did it!</h2>
        <Award size={80} className="mx-auto text-yellow-500 my-6" />
        <div className="flex justify-around my-6 text-lg">
          <div><p className="font-bold">{timer}</p><p className="text-sm text-gray-500">Seconds</p></div>
          <div><p className="font-bold">{moveCount}</p><p className="text-sm text-gray-500">Moves</p></div>
        </div>
        <p className="text-2xl font-bold text-green-600 mb-8">You earned +{POINTS_PER_WIN} Points!</p>
        {/* --- MODIFIED: This button now takes you back to the locked idle screen --- */}
        <button onClick={resetAndLockGame} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg'>
          Finish
        </button>
      </div>
    );
  }

  // --- Active Gameplay Screen (No changes needed here) ---
  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-fit mx-auto mt-12 text-center">
      <div className="flex justify-between items-center mb-4 px-2">
        <div><strong>Time:</strong> {timer}s</div>
        <div><strong>Moves:</strong> {moveCount}</div>
      </div>
      <div className="maze-container" style={{ gridTemplateColumns: `repeat(${mazeLayout[0].length}, ${CELL_SIZE}px)` }}>
        <div className="player-icon-wrapper" style={{ transform: `translate(${playerPosition.col * CELL_SIZE}px, ${playerPosition.row * CELL_SIZE}px)` }}>
          <GlassWater className="player-icon" />
        </div>
        {mazeLayout.flat().map((cell, index) => {
          const cellType = cell === 1 ? 'wall' : 'path';
          return (
            <div key={index} className={`maze-cell ${cellType}`}>
              {cell === 'E' && <Recycle className="goal-icon" />}
            </div>
          );
        })}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="grid grid-cols-3 gap-2">
            <div></div>
            <button onClick={() => handleMove(0, -1)} className="p-4 bg-gray-200 rounded-lg"><ArrowUp /></button>
            <div></div>
            <button onClick={() => handleMove(-1, 0)} className="p-4 bg-gray-200 rounded-lg"><ArrowLeft /></button>
            <button onClick={() => handleMove(0, 1)} className="p-4 bg-gray-200 rounded-lg"><ArrowDown /></button>
            <button onClick={() => handleMove(1, 0)} className="p-4 bg-gray-200 rounded-lg"><ArrowRight /></button>
        </div>
      </div>
    </div>
  );
};

export default MazeGame;