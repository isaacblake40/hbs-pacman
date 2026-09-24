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

export default function PacManGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const keysPressed = useRef<Set<string>>(new Set());

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
  }, [playerPos]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-4xl font-bold text-yellow-400 mb-6">HBS Pac-Man</h1>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * GRID_SIZE}
          height={ROWS * GRID_SIZE}
          className="border-4 border-yellow-400 bg-black"
        />
      </div>
      <p className="text-white text-center mt-6">Use arrow keys to move</p>
    </div>
  );
}
