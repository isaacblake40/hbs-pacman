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

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [dots, setDots] = useState<Array<{ x: number; y: number }>>([]);
  const [score, setScore] = useState(0);
  const keysPressed = useRef<Set<string>>(new Set());
  const dotsRef = useRef<Array<{ x: number; y: number }>>([]);

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
    };

    const interval = setInterval(gameLoop, 100);
    return () => clearInterval(interval);
  }, []);

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
  }, [playerPos, dots]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-2">HBS Pac-Man</h1>
      <p className="text-2xl font-bold text-yellow-400 mb-6">Score: {score}</p>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * GRID_SIZE}
          height={ROWS * GRID_SIZE}
          className="border-4 border-yellow-400 bg-black"
        />
      </div>
      <p className="text-white text-center mt-6">Use arrow keys to move and collect dots</p>
    </div>
  );
}
