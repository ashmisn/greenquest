import React, { useState, useEffect, useCallback } from 'react';
import { GlassWater, Recycle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Award } from 'lucide-react';
import { authAPI } from '../services/api'; // CORRECTED: Import authAPI

const mazeLayout = [
  ['S', 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 'E'],
];
const CELL_SIZE = 40;
const POINTS_PER_WIN = 25;

// REMOVED: The local gameAPI object is no longer needed.

const MazeGame: React.FC = () => {
  const findStartPos = () => {
    for (let r = 0; r < mazeLayout.length; r++) {
      for (let c = 0; c < mazeLayout[r].length; c++) {
        if (mazeLayout[r][c] === 'S') return { row: r, col: c };
      }
    }
    return { row: 0, col: 0 };
  };

  const [playerPosition, setPlayerPosition] = useState(findStartPos);
  const [gameWon, setGameWon] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  // ... (useEffect for handleKeyDown remains the same)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return;
      // ... movement logic ...
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, gameWon]);


  useEffect(() => {
    const cell = mazeLayout[playerPosition.row][playerPosition.col];
    if (cell === 'E' && !gameWon && !pointsAwarded) {
      setGameWon(true);
      setPointsAwarded(true); // Prevent sending points multiple times

      // CORRECTED: Call the function from the imported authAPI
      authAPI.addGamePoints(POINTS_PER_WIN, "Maze Challenge")
        .then(() => {
          console.log("Points added successfully!");
        })
        .catch(err => {
          console.error("Failed to add points:", err);
          setPointsAwarded(false); // Allow retry on error
        });
    }
  }, [playerPosition, gameWon, pointsAwarded]);

  const resetGame = () => {
    setPlayerPosition(findStartPos());
    setGameWon(false);
    setPointsAwarded(false);
  };

  // ... (The return(...) JSX part of your component remains the same)
  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-12 text-center">
        {/* All the JSX for your game */}
    </div>
  );
};

export default MazeGame;