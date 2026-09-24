'use client';

import { useEffect, useRef, useState } from 'react';

const GRID_SIZE = 20;
const COLS = 21;
const ROWS = 19;

const MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,0,0,0,1,1,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function initializeDots() {
  const dots: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (MAZE[row][col] === 0 && !(row === 1 && col === 1)) {
        dots.push({ x: col, y: row });
      }
    }
  }
  return dots;
}

function getRandomOpenCell(): { x: number; y: number } {
  let x, y;
  do {
    x = Math.floor(Math.random() * COLS);
    y = Math.floor(Math.random() * ROWS);
  } while (MAZE[y][x] !== 0 || (x === 1 && y === 1));
  return { x, y };
}

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [ghostPos, setGhostPos] = useState({ x: 10, y: 9 });
  const [dots, setDots] = useState<Array<{ x: number; y: number }>>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const dotsRef = useRef<Array<{ x: number; y: number }>>([]);
  const gameOverRef = useRef(false);

  useEffect(() => {
    const initialDots = initializeDots();
    setDots(initialDots);
    dotsRef.current = initialDots;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current.add(e.key);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const gameLoop = () => {
      if (gameOverRef.current) return;

      setPlayerPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        if (keysPressed.current.has('ArrowUp')) newY = prev.y - 1;
        if (keysPressed.current.has('ArrowDown')) newY = prev.y + 1;
        if (keysPressed.current.has('ArrowLeft')) newX = prev.x - 1;
        if (keysPressed.current.has('ArrowRight')) newX = prev.x + 1;

        if (
          newY >= 0 &&
          newY < ROWS &&
          newX >= 0 &&
          newX < COLS &&
          MAZE[newY][newX] === 0
        ) {
          const dotIndex = dotsRef.current.findIndex(
            (dot) => dot.x === newX && dot.y === newY
          );
          if (dotIndex !== -1) {
            const newDots = dotsRef.current.filter((_, i) => i !== dotIndex);
            dotsRef.current = newDots;
            setDots(newDots);
            setScore((s) => s + 10);
          }
          return { x: newX, y: newY };
        }

        return prev;
      });

      setGhostPos((prev) => {
        const directions = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];
        const validMoves = directions.filter((dir) => {
          const nx = prev.x + dir.x;
          const ny = prev.y + dir.y;
          return (
            ny >= 0 &&
            ny < ROWS &&
            nx >= 0 &&
            nx < COLS &&
            MAZE[ny][nx] === 0
          );
        });

        if (validMoves.length === 0) return prev;

        const randomMove =
          validMoves[Math.floor(Math.random() * validMoves.length)];
        const newGhostPos = {
          x: prev.x + randomMove.x,
          y: prev.y + randomMove.y,
        };

        if (gameOverRef.current === false) {
          setPlayerPos((currentPlayer) => {
            if (
              currentPlayer.x === newGhostPos.x &&
              currentPlayer.y === newGhostPos.y
            ) {
              gameOverRef.current = true;
              setGameOver(true);
              setFinalScore(score);
            }
            return currentPlayer;
          });
        }

        return newGhostPos;
      });
    };

    const interval = setInterval(gameLoop, 100);
    return () => clearInterval(interval);
  }, [score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#00f';
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (MAZE[row][col] === 1) {
          ctx.fillRect(col * GRID_SIZE, row * GRID_SIZE, GRID_SIZE, GRID_SIZE);
        }
      }
    }

    ctx.fillStyle = '#fff';
    for (const dot of dots) {
      ctx.beginPath();
      ctx.arc(
        dot.x * GRID_SIZE + GRID_SIZE / 2,
        dot.y * GRID_SIZE + GRID_SIZE / 2,
        3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(
      ghostPos.x * GRID_SIZE + GRID_SIZE / 2,
      ghostPos.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(
      playerPos.x * GRID_SIZE + GRID_SIZE / 2,
      playerPos.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [playerPos, ghostPos, dots]);

  const handlePlayAgain = () => {
    setPlayerPos({ x: 1, y: 1 });
    setGhostPos({ x: 10, y: 9 });
    setDots(initializeDots());
    setScore(0);
    setGameOver(false);
    setFinalScore(0);
    gameOverRef.current = false;
    dotsRef.current = initializeDots();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-2">HBS Pac-Man</h1>
      <p className="text-2xl font-bold text-yellow-400 mb-6">Score: {score}</p>
      <div className="relative flex justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * GRID_SIZE}
          height={ROWS * GRID_SIZE}
          className="border-4 border-yellow-400 bg-black"
        />
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 border-4 border-yellow-400">
            <h2 className="text-5xl font-bold text-red-500 mb-4">Game Over</h2>
            <p className="text-3xl font-bold text-yellow-400 mb-8">
              Final Score: {finalScore}
            </p>
            <button
              onClick={handlePlayAgain}
              className="px-8 py-3 bg-yellow-400 text-black font-bold text-xl rounded-lg hover:bg-yellow-300 transition"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
      <p className="text-white text-center mt-6">
        {gameOver
          ? "Caught by the ghost!"
          : "Collect dots while avoiding the red ghost"}
      </p>
    </div>
  );
}
