import React, { useState, useEffect } from 'react';
import { GlassWater, Recycle } from 'lucide-react'; // <-- CORRECTED: Changed Bottle to GlassWater

// ... The rest of the file is the same ...

const mazeLayout = [
  ['S', 0, 1, 0, 0, 0, 1, 0],
  [1, 0, 1, 0, 1, 0, 1, 0],
  [1, 0, 0, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 0, 'E'],
];

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return;
      let newRow = playerPosition.row;
      let newCol = playerPosition.col;
      switch (e.key) {
        case 'ArrowUp': newRow--; break;
        case 'ArrowDown': newRow++; break;
        case 'ArrowLeft': newCol--; break;
        case 'ArrowRight': newCol++; break;
        default: return;
      }
      if (
        newRow >= 0 && newRow < mazeLayout.length &&
        newCol >= 0 && newCol < mazeLayout[0].length &&
        mazeLayout[newRow][newCol] !== 1
      ) {
        setPlayerPosition({ row: newRow, col: newCol });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPosition, gameWon]);

  useEffect(() => {
    const cell = mazeLayout[playerPosition.row][playerPosition.col];
    if (cell === 'E') {
      setGameWon(true);
    }
  }, [playerPosition]);
  
  const resetGame = () => {
      setPlayerPosition(findStartPos());
      setGameWon(false);
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl mx-auto mt-12 text-center">
      <h2 className="text-2xl font-bold mb-2">Maze Challenge</h2>
      <p className="text-gray-600 mb-6">Use your arrow keys to guide the bottle to the recycling bin!</p>
      
      {gameWon ? (
        <div>
          <h3 className="text-3xl font-bold text-green-600 my-8">You did it! +15 Points!</h3>
          <button onClick={resetGame} className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg'>
            Play Again
          </button>
        </div>
      ) : (
        <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${mazeLayout[0].length}, 1fr)` }}>
          {mazeLayout.flat().map((cell, index) => {
            const row = Math.floor(index / mazeLayout[0].length);
            const col = index % mazeLayout[0].length;
            const isPlayerHere = playerPosition.row === row && playerPosition.col === col;
            
            let cellType = '';
            if (cell === 1) cellType = 'wall';
            else if (cell === 0 || cell === 'S' || cell === 'E') cellType = 'path';
            
            return (
              <div key={index} className={`maze-cell ${cellType}`}>
                {isPlayerHere && <GlassWater className="player-icon" />} {/* <-- CORRECTED: Changed Bottle to GlassWater */}
                {cell === 'E' && <Recycle className="goal-icon" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MazeGame;