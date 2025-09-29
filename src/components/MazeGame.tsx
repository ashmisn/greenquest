import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Trophy, RotateCcw, Play, Pause, Home, Clock, Footprints, Star, Award, X } from 'lucide-react'; 

// NOTE: Import the actual API client module from your services.
import { authAPI, notificationAPI } from '../services/api'; 

// ==========================================
// AUTH UTILITY: YOU MUST IMPLEMENT THIS
// ==========================================
/**
 * Placeholder function to retrieve the current authenticated user's ID.
 * In a real application, this would read the ID from the decoded JWT token
 * stored in localStorage or from a global Redux/Context state.
 */
const getUserIdFromAuth = (): string => {
    // NOTE: This is a MOCK ID. Replace with actual user ID retrieval logic.
    const token = localStorage.getItem('greenquest_token');
    if (token) {
        // In reality, you'd decode the token payload to get the user ID (e.g., req.user.userId)
        return "current_authenticated_user_123"; // Use a dynamic, unique ID here
    }
    return "GUEST_USER"; // Fallback for testing when not logged in
};

// ==========================================
// TYPES & INTERFACES (UNCHANGED)
// ==========================================
interface Position { x: number; y: number; }
interface MazeData { grid: number[][]; start: Position; end: Position; difficulty?: Difficulty; optimalMoves?: number; }
type Difficulty = 'easy' | 'medium' | 'hard';
interface Toast { message: string; type: 'success' | 'error'; } 

// ==========================================
// FUNCTIONAL NOTIFICATION HOOK (UNCHANGED)
// ==========================================
const useNotification = (setToast: React.Dispatch<React.SetStateAction<Toast | null>>) => {
    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success', duration = 5000) => {
        setToast({ message, type });
        setTimeout(() => setToast(null), duration);
    }, [setToast]);
    
    const dismissNotification = useCallback(() => setToast(null), [setToast]);

    return { showNotification, dismissNotification };
};


// ==========================================
// MAZE GENERATOR CLASS & CONFIG (BUG FIX APPLIED)
// ==========================================
class MazeGenerator {
    private width: number; private height: number; private maze: number[][];
    constructor(width: number, height: number) { this.width = width; this.height = height; this.maze = []; }
    
    generateRecursiveBacktracking(): MazeData { 
        this.maze = Array(this.height).fill(null).map(() => Array(this.width).fill(1));
        const stack: Position[] = [];
        const startX = 0, startY = 0;
        this.maze[startY][startX] = 0;
        stack.push({ x: startX, y: startY });
        const directions = [
            { dx: 0, dy: -2, wallY: -1, wallX: 0 }, { dx: 2, dy: 0, wallY: 0, wallX: 1 },
            { dx: 0, dy: 2, wallY: 1, wallX: 0 }, { dx: -2, dy: 0, wallY: 0, wallX: -1 }
        ];
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = directions.filter(dir => {
                const newX = current.x + dir.dx;
                const newY = current.y + dir.dy;
                return newX >= 0 && newX < this.width && newY >= 0 && newY < this.height && this.maze[newY][newX] === 1;
            });
            if (neighbors.length > 0) {
                const chosen = neighbors[Math.floor(Math.random() * neighbors.length)];
                const newX = current.x + chosen.dx; const newY = current.y + chosen.dy;
                const wallX = current.x + chosen.wallX; const wallY = current.y + chosen.wallY;
                this.maze[newY][newX] = 0; this.maze[wallY][wallX] = 0; stack.push({ x: newX, y: newY });
            } else { stack.pop(); }
        }
        this.maze[0][0] = 0; this.maze[this.height - 1][this.width - 1] = 0;
        
        // FIX: Call getOptimalPathLength on THIS instance, which has the populated maze.
        return { 
            grid: this.maze, 
            start: { x: 0, y: 0 }, 
            end: { x: this.width - 1, y: this.height - 1 }, 
            optimalMoves: this.getOptimalPathLength() 
        };
    }
    
    getOptimalPathLength(): number { 
        const start = { x: 0, y: 0 }; const end = { x: this.width - 1, y: this.height - 1 };
        const queue: Array<Position & { dist: number }> = [{ ...start, dist: 0 }];
        const visited = Array(this.height).fill(null).map(() => Array(this.width).fill(false)); 
        visited[start.y][start.x] = true;
        const directions = [{ dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }];
        while (queue.length > 0) {
            const current = queue.shift()!;
            if (current.x === end.x && current.y === end.y) return current.dist;
            for (const dir of directions) {
                const nx = current.x + dir.dx; const ny = current.y + dir.dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height && !visited[ny][nx] && this.maze[ny][nx] === 0) {
                    visited[ny][nx] = true; queue.push({ x: nx, y: ny, dist: current.dist + 1 });
                }
            }
        }
        return -1;
    }
}
const DIFFICULTY_CONFIG = { easy: { width: 11, height: 11 }, medium: { width: 17, height: 17 }, hard: { width: 23, height: 23 } };
function generateMaze(difficulty: Difficulty): MazeData {
    const config = DIFFICULTY_CONFIG[difficulty];
    // FIX: Removed redundant 'new' keyword
    const generator = new MazeGenerator(config.width, config.height); 
    const mazeData = generator.generateRecursiveBacktracking();
    mazeData.difficulty = difficulty;
    return mazeData;
}
// ------------------------------------------

// ==========================================
// MAIN GAME COMPONENT
// ==========================================
export default function MazeGame() {
    // State and Hooks
    const [toast, setToast] = useState<Toast | null>(null);
    const { showNotification, dismissNotification } = useNotification(setToast);
    
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'completed'>('menu');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [maze, setMaze] = useState<MazeData | null>(null);
    const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
    const [moves, setMoves] = useState(0);
    const [time, setTime] = useState(0);
    const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const [leaderboard, setLeaderboard] = useState<any[]>(() => {
        const savedLeaderboard = localStorage.getItem('mazeLeaderboard');
        return savedLeaderboard ? JSON.parse(savedLeaderboard) : [];
    });
    
    // --- Daily Play State ---
    const [canPlay, setCanPlay] = useState(false);
    const [message, setMessage] = useState("Select a difficulty to start your Green Quest.");

    // --- Effect: Daily Limit Check & Leaderboard Save (FIXED LOGIC) ---
    useEffect(() => {
        const userId = getUserIdFromAuth();
        // FIXED BUG: Using ISO format (YYYY-MM-DD) for reliable date checking
        const today = new Date().toISOString().split('T')[0]; 
        // FIX: The storage key is now unique per user
        const lockKey = `lastMazePlayedDate_${userId}`;
        
        const lastPlayedDate = localStorage.getItem(lockKey);
        
        const isPlayable = lastPlayedDate !== today;
        setCanPlay(isPlayable);

        if (!isPlayable) {
            setMessage("You've completed your Green Quest for today. Come back tomorrow!");
            if (gameState !== 'menu') setGameState('menu'); 
        } else if (gameState === 'menu') {
            setMessage("Select a difficulty to start your Green Quest.");
        }

        localStorage.setItem('mazeLeaderboard', JSON.stringify(leaderboard));
    }, [gameState, leaderboard]);

    // --- Timer Effect (UNCHANGED) ---
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (gameState === 'playing') {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [gameState]);

    // --- Scoring Logic (UNCHANGED) ---
    const calculateScore = useCallback(() => {
        if (!maze) return 0;
        const basePoints = 1000;
        const timePenalty = time;
        const movePenalty = Math.max(0, moves - (maze.optimalMoves || 0)) * 5; 
        const multiplier = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 1.5 : 2;
        const bonus = time < 60 ? 500 : 0; 
        return Math.max(0, Math.round((basePoints - timePenalty - movePenalty + bonus) * multiplier));
    }, [maze, time, moves, difficulty]);

    // --- Game Completion, API Call, and Notification (FIXED LOGIC) ---
    const completeGame = useCallback(() => {
        setGameState('completed');
        const calculatedScore = calculateScore();
        const earnedPoints = Math.floor(calculatedScore / 100);
        setScore(calculatedScore);
        
        const userId = getUserIdFromAuth();
        // 1. Lock game for the current user only
        const today = new Date().toISOString().split('T')[0];
        const lockKey = `lastMazePlayedDate_${userId}`;
        localStorage.setItem(lockKey, today);
        setCanPlay(false); 
        
        // 2. Submit score via API and handle notification
        authAPI.addGamePoints(earnedPoints, `Maze Challenge: ${difficulty}`)
            .then(() => {
                showNotification(`Success! You earned ${earnedPoints} Eco-Points for completing the ${difficulty} maze!`, 'success');
            })
            .catch((error) => {
                console.error("Failed to add points:", error);
                showNotification(`Error: Points could not be awarded. Please check your network and log in again.`, 'error');
            });

        // 3. Update Leaderboard (Local)
        const newEntry = { difficulty, time, moves, score: calculatedScore, date: new Date().toLocaleString() };
        setLeaderboard(prev => [...prev, newEntry].sort((a, b) => b.score - a.score).slice(0, 10));
    }, [calculateScore, difficulty, time, moves, showNotification]);

    // --- Keyboard controls (UNCHANGED) ---
    const handleKeyPress = useCallback((e: KeyboardEvent) => {
        if (gameState !== 'playing' || !maze) return;

        const directions: Record<string, Position> = {
            ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
            w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
        };

        const dir = directions[e.key];
        if (!dir) return;

        e.preventDefault();
        const newX = playerPos.x + dir.x;
        const newY = playerPos.y + dir.y;

        if (newX >= 0 && newX < maze.grid[0].length && newY >= 0 && newY < maze.grid.length && maze.grid[newY][newX] === 0) {
            setPlayerPos({ x: newX, y: newY });
            setMoves(m => m + 1);
            setVisitedCells(prev => new Set(prev).add(`${newX},${newY}`));

            if (newX === maze.end.x && newY === maze.end.y) {
                completeGame();
            }
        }
    }, [gameState, maze, playerPos, completeGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleKeyPress]);

    const startGame = (selectedDifficulty: Difficulty) => {
        if (!canPlay) return; 

        const newMaze = generateMaze(selectedDifficulty);
        setMaze(newMaze);
        setPlayerPos({ x: newMaze.start.x, y: newMaze.start.y });
        setMoves(0);
        setTime(0);
        setVisitedCells(new Set(['0,0']));
        setDifficulty(selectedDifficulty);
        setGameState('playing');
        setMessage("Maze in progress!");
    };

    const resetGame = () => {
        setGameState('menu');
        setMaze(null);
        setScore(0);
    };

    const pauseGame = () => {
        setGameState(gameState === 'paused' ? 'playing' : 'paused');
    };

    // --- Helper Calculations (UNCHANGED) ---
    const cellSize = useMemo(() => {
        if (!maze) return 30;
        return Math.min(500 / maze.grid[0].length, 500 / maze.grid.length);
    }, [maze]);

    const formattedTime = useMemo(() => {
        const minutes = Math.floor(time / 60);
        const seconds = (time % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [time]);

    // --- JSX RENDER ---
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8 relative">
            
            {/* TOAST NOTIFICATION COMPONENT: Functional UI feedback */}
            {toast && (
                <div 
                    className={`fixed top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-xl text-white font-semibold flex items-center z-50 transition-opacity duration-300 ${
                        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                >
                    {toast.message}
                    <button onClick={dismissNotification} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition">
                        <X size={16} />
                    </button>
                </div>
            )}
            
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-green-800 mb-2 flex items-center justify-center gap-3">
                        🌿 Green Quest Maze
                    </h1>
                    <p className="text-green-600">{message}</p>
                </div>

                {/* --- MENU SCREEN --- */}
                {gameState === 'menu' && (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-green-800 mb-6 text-center">Select Difficulty</h2>
                        <div className="grid gap-4 mb-8">
                            {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => startGame(level)}
                                    disabled={!canPlay} // Daily limit check disables the button
                                    className={`p-6 text-white rounded-xl font-semibold text-xl transition transform hover:scale-105 shadow-lg capitalize ${
                                        canPlay 
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
                                        : 'bg-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {level} - {DIFFICULTY_CONFIG[level].width}x{DIFFICULTY_CONFIG[level].height}
                                </button>
                            ))}
                        </div>
                        
                        {!canPlay && (
                             <p className="text-red-500 font-semibold text-center mt-4">Daily limit reached. Try again tomorrow! ♻️</p>
                        )}

                        {leaderboard.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
                                    <Trophy className="text-yellow-500" /> Leaderboard
                                </h3>
                                <div className="space-y-2">
                                    {leaderboard.slice(0, 5).map((entry, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                            <span className="font-semibold">#{idx + 1}</span>
                                            <span className="capitalize">{entry.difficulty}</span>
                                            <span>{entry.moves} moves</span>
                                            <span>{entry.time}s</span>
                                            <span className="font-bold text-green-600">{entry.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- GAMEPLAY SCREEN --- */}
                {(gameState === 'playing' || gameState === 'paused') && maze && (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 relative max-w-fit mx-auto">
                        
                        {/* Stats Bar */}
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
                                <Clock className="text-blue-600" size={20} />
                                <span className="font-bold text-blue-800">{formattedTime}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
                                <Footprints className="text-purple-600" size={20} />
                                <span className="font-bold text-purple-800">{moves} moves</span>
                            </div>
                            <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg">
                                <Star className="text-yellow-600" size={20} />
                                <span className="font-bold text-yellow-800">Target: {maze.optimalMoves}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={pauseGame} className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition">
                                    {gameState === 'paused' ? <Play size={20} /> : <Pause size={20} />}
                                </button>
                                <button onClick={resetGame} className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
                                    <Home size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Maze Grid */}
<div className="flex justify-center mb-4">
    <div 
        className="inline-block border-4 border-green-800 rounded-lg overflow-hidden" 
        style={{ 
            backgroundColor: '#1a1a1a', 
            // Ensures the grid dimensions match the calculated cellSize
            width: maze.grid[0].length * cellSize, 
            height: maze.grid.length * cellSize 
        }}
    >
        {maze.grid.map((row, y) => (
            <div key={y} className="flex">
                {row.map((cell, x) => {
                    const isPlayer = playerPos.x === x && playerPos.y === y;
                    const isEnd = maze.end.x === x && maze.end.y === y;
                    const isStart = maze.start.x === x && maze.start.y === y;
                    const isVisited = visitedCells.has(`${x},${y}`);
                    
                    // Determine cell color based on state
                    let cellClass = cell === 1 ? 'bg-green-800' : 'bg-green-50';

                    if (isVisited && cell !== 1) cellClass = 'bg-green-200';
                    if (isStart) cellClass = 'bg-green-300';
                    if (isEnd) cellClass = 'bg-yellow-400';
                    if (isPlayer) cellClass = 'bg-blue-500';

                    return (
                        <div
                            key={`${x}-${y}`}
                            style={{ width: cellSize, height: cellSize }}
                            className={`${cellClass} flex items-center justify-center transition-colors duration-200`}
                        >
                            {/* Player icon (🌱) rendered inside their current cell */}
                            {isPlayer && <div className="text-2xl">🌱</div>}
                            {isEnd && !isPlayer && <div className="text-2xl">🏆</div>}
                            {isStart && !isPlayer && <div className="text-2xl">🏡</div>}
                        </div>
                    );
                })}
            </div>
        ))}
    </div>
</div>
                        {/* Controls Info */}
                        <div className="text-center text-gray-600 text-sm">
                            Use Arrow Keys or WASD to move • 🌱 You • 🏆 Goal
                        </div>

                        {/* Pause Overlay */}
                        {gameState === 'paused' && (
                            <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-2xl z-10">
                                <div className="bg-white p-8 rounded-xl text-center shadow-2xl">
                                    <h3 className="text-4xl font-bold text-green-800 mb-6">Game Paused</h3>
                                    <button 
                                        onClick={pauseGame} 
                                        className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg flex items-center gap-2 mx-auto"
                                    >
                                        <Play size={24} /> Resume Game
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- COMPLETION SCREEN --- */}
                {gameState === 'completed' && (
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-green-800 mb-6 flex items-center justify-center gap-3">
                            <Award className="text-yellow-500" size={40} /> Victory!
                        </h2>
                        
                        <p className="text-xl font-semibold text-green-600 mb-8">You successfully navigated the {difficulty} maze!</p>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard title="Time" value={`${time}s`} color="blue" />
                            <StatCard title="Moves" value={`${moves}`} color="purple" />
                            <StatCard title="Target Moves" value={`${maze?.optimalMoves}`} color="yellow" />
                            <StatCard title="Final Score" value={`${score} pts`} color="green" isPrimary={true} />
                        </div>
                        
                        <p className="text-lg font-bold text-green-700 mb-8">
                            Points Awarded: **{Math.floor(score / 100)}** Eco-Points! ♻️
                        </p>

                        <div className="flex gap-4 justify-center">
                            <button onClick={resetGame} className="px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition flex items-center gap-2">
                                <Home size={20} /> Finish & Back to Menu
                            </button>
                        </div>
                        <p className='text-sm text-red-500 mt-4'>Your daily game has been completed. Check back tomorrow!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper component for clean rendering of stats
interface StatCardProps {
    title: string;
    value: string;
    color: 'blue' | 'purple' | 'yellow' | 'green';
    isPrimary?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color, isPrimary = false }) => {
    const colorMap = {
        blue: { bg: 'bg-blue-100', text: 'text-blue-600', value: 'text-blue-800' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-600', value: 'text-purple-800' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', value: 'text-yellow-800' },
        green: { bg: 'bg-green-100', text: 'text-green-600', value: 'text-green-800' },
    };
    const styles = colorMap[color];

    return (
        <div className={`${styles.bg} p-4 rounded-xl ${isPrimary ? 'col-span-2 lg:col-span-1' : ''}`}>
            <p className={`${styles.text} font-semibold mb-2`}>{title}</p>
            <p className={`text-3xl font-bold ${styles.value}`}>{value}</p>
        </div>
    );
};