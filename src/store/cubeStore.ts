import { create } from "zustand";
import type { Axis, CubePiece, Direction, FaceColor, Move, Stats, Theme } from "../types/cube";

interface CubeState {
  // Cube state
  pieces: CubePiece[];
  isScrambled: boolean;
  isSolved: boolean;

  // Animation state
  isAnimating: boolean;

  // Timer state
  timerRunning: boolean;
  startTime: number | null;
  currentTime: number;

  // Move history
  moves: Move[];

  // Stats
  stats: Stats;

  // Theme
  theme: Theme;

  // Actions
  initializeCube: () => void;
  scrambleCube: () => void;
  resetCube: () => void;
  rotateLayer: (axis: Axis, layerIndex: number, direction: Direction) => void;
  rotateWholeCube: (axis: Axis, direction: Direction) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  startTimer: () => void;
  stopTimer: () => void;
  updateTimer: () => void;
}

// Helper to create initial cube pieces
const createInitialPieces = (): CubePiece[] => {
  const pieces: CubePiece[] = [];
  let id = 0;

  // Create all 27 pieces (including the center piece which is not visible)
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const colors: Record<string, FaceColor | null> = {
          right: x === 1 ? "red" : null,
          left: x === -1 ? "orange" : null,
          top: y === 1 ? "white" : null,
          bottom: y === -1 ? "yellow" : null,
          front: z === 1 ? "green" : null,
          back: z === -1 ? "blue" : null,
        };

        pieces.push({
          id: id++,
          position: [x, y, z],
          colors,
        });
      }
    }
  }

  return pieces;
};

// Check if the cube is in a solved state
const isCubeSolved = (pieces: CubePiece[]): boolean => {
  // Helper function to get the color of a face for all pieces in that face
  const getFaceColors = (face: string, coordinate: number): FaceColor[] => {
    const axis = face === "right" || face === "left" ? "x" : face === "top" || face === "bottom" ? "y" : "z";

    const value = face === "right" || face === "top" || face === "front" ? 1 : -1;

    return pieces
      .filter((piece) => piece.position[coordinate] === value)
      .map((piece) => piece.colors[face])
      .filter((color): color is FaceColor => color !== null);
  };

  // Check each face to see if all pieces have the same color
  const faces = [
    { name: "right", coordinate: 0 },
    { name: "left", coordinate: 0 },
    { name: "top", coordinate: 1 },
    { name: "bottom", coordinate: 1 },
    { name: "front", coordinate: 2 },
    { name: "back", coordinate: 2 },
  ];

  return faces.every((face) => {
    const colors = getFaceColors(face.name, face.coordinate);
    return colors.length > 0 && colors.every((color) => color === colors[0]);
  });
};

export const useCubeStore = create<CubeState>((set, get) => ({
  // Initial state
  pieces: createInitialPieces(),
  isScrambled: false,
  isSolved: true,
  isAnimating: false,
  timerRunning: false,
  startTime: null,
  currentTime: 0,
  moves: [],
  stats: {
    bestTime: null,
    lastTime: null,
    averageTime: 0,
    totalSolves: 0,
    lastMoveCount: 0,
  },
  theme: "light",

  // Actions
  initializeCube: () => {
    set({ pieces: createInitialPieces(), isSolved: true, isScrambled: false });
  },

  scrambleCube: () => {
    const { rotateLayer } = get();
    const axes: Axis[] = ["x", "y", "z"];
    const directions: Direction[] = [1, -1];

    // Perform 20 random moves
    set({ isAnimating: true });

    // Schedule the scramble moves with delays to allow for animations
    const scrambleMoves = Array.from({ length: 20 }, () => ({
      axis: axes[Math.floor(Math.random() * axes.length)],
      layerIndex: Math.floor(Math.random() * 3),
      direction: directions[Math.floor(Math.random() * directions.length)],
    }));

    // Execute the scramble moves with a delay between each
    let moveIndex = 0;
    const executeMove = () => {
      if (moveIndex < scrambleMoves.length) {
        const move = scrambleMoves[moveIndex];
        rotateLayer(move.axis, move.layerIndex, move.direction);
        moveIndex++;
        setTimeout(executeMove, 100);
      } else {
        set({ isAnimating: false, isScrambled: true, moves: [] });
      }
    };

    executeMove();
  },

  resetCube: () => {
    set({
      pieces: createInitialPieces(),
      isScrambled: false,
      isSolved: true,
      timerRunning: false,
      startTime: null,
      currentTime: 0,
      moves: [],
    });
  },

  rotateLayer: (axis: Axis, layerIndex: number, direction: Direction) => {
    const { pieces, moves, timerRunning, startTimer } = get();

    // Start the timer on the first move if it's not already running
    if (!timerRunning && moves.length === 0) {
      startTimer();
    }

    // Find the pieces in the specified layer
    const layerPieces = pieces.filter((piece) => piece.position[axis === "x" ? 0 : axis === "y" ? 1 : 2] === layerIndex - 1);

    // Create new pieces array with rotated pieces
    const newPieces = [...pieces];

    // Apply rotation matrix based on axis and direction
    layerPieces.forEach((piece) => {
      const pieceIndex = newPieces.findIndex((p) => p.id === piece.id);
      const [x, y, z] = piece.position;

      let newPosition: [number, number, number];
      const colors = { ...piece.colors };

      if (axis === "x") {
        // Rotate around X axis
        newPosition = [x, direction * z, -direction * y];
        if (direction === 1) {
          colors.top = piece.colors.back;
          colors.back = piece.colors.bottom;
          colors.bottom = piece.colors.front;
          colors.front = piece.colors.top;
        } else {
          colors.top = piece.colors.front;
          colors.front = piece.colors.bottom;
          colors.bottom = piece.colors.back;
          colors.back = piece.colors.top;
        }
      } else if (axis === "y") {
        // Rotate around Y axis
        newPosition = [-direction * z, y, direction * x];
        if (direction === 1) {
          colors.front = piece.colors.right;
          colors.right = piece.colors.back;
          colors.back = piece.colors.left;
          colors.left = piece.colors.front;
        } else {
          colors.front = piece.colors.left;
          colors.left = piece.colors.back;
          colors.back = piece.colors.right;
          colors.right = piece.colors.front;
        }
      } else {
        // Rotate around Z axis
        newPosition = [direction * y, -direction * x, z];
        if (direction === 1) {
          colors.top = piece.colors.left;
          colors.right = piece.colors.top;
          colors.bottom = piece.colors.right;
          colors.left = piece.colors.bottom;
        } else {
          colors.top = piece.colors.right;
          colors.right = piece.colors.bottom;
          colors.bottom = piece.colors.left;
          colors.left = piece.colors.top;
        }
      }

      newPieces[pieceIndex] = {
        ...piece,
        position: newPosition,
        colors,
      };
    });

    // Record the move
    const newMoves = [
      ...moves,
      {
        axis,
        layerIndex,
        direction,
        timestamp: Date.now(),
      },
    ];

    // Check if the cube is solved
    const isSolved = isCubeSolved(newPieces);

    // Update state
    set({
      pieces: newPieces,
      moves: newMoves,
      isSolved,
      // Stop timer if cube is solved
      ...(isSolved && {
        timerRunning: false,
        isScrambled: false,
      }),
    });

    // Update stats if the cube is solved
    if (isSolved) {
      const { stats, currentTime } = get();
      const newBestTime = stats.bestTime === null || currentTime < stats.bestTime ? currentTime : stats.bestTime;

      const newAverageTime = stats.totalSolves === 0 ? currentTime : (stats.averageTime * stats.totalSolves + currentTime) / (stats.totalSolves + 1);

      set({
        stats: {
          bestTime: newBestTime,
          lastTime: currentTime,
          averageTime: newAverageTime,
          totalSolves: stats.totalSolves + 1,
          lastMoveCount: newMoves.length,
        },
      });
    }
  },

  rotateWholeCube: (axis: Axis, direction: Direction) => {
    const { pieces } = get();

    // Create new pieces array with all pieces rotated
    const newPieces = [...pieces];

    // Apply rotation matrix based on axis and direction to all pieces
    newPieces.forEach((piece, index) => {
      const [x, y, z] = piece.position;

      let newPosition: [number, number, number];

      if (axis === "x") {
        // Rotate around X axis
        newPosition = [x, direction * z, -direction * y];
      } else if (axis === "y") {
        // Rotate around Y axis
        newPosition = [-direction * z, y, direction * x];
      } else {
        // Rotate around Z axis
        newPosition = [direction * y, -direction * x, z];
      }

      newPieces[index] = {
        ...piece,
        position: newPosition,
      };
    });

    // Update state
    set({ pieces: newPieces });
  },

  setTheme: (theme: Theme) => set({ theme }),

  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),

  startTimer: () => set({ timerRunning: true, startTime: Date.now(), currentTime: 0 }),

  stopTimer: () => {
    const { startTime } = get();
    if (startTime) {
      const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
      set({ timerRunning: false, currentTime: elapsed });
    }
  },

  updateTimer: () => {
    const { timerRunning, startTime } = get();
    if (timerRunning && startTime) {
      const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
      set({ currentTime: elapsed });
    }
  },
}));
