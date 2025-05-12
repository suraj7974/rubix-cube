// Define the face colors for the Rubik's Cube
export type FaceColor = "white" | "yellow" | "red" | "orange" | "blue" | "green";

// Define the possible axes for rotation
export type Axis = "x" | "y" | "z";

// Define the possible directions for rotation
export type Direction = 1 | -1;

// Define a single piece of the cube
export interface CubePiece {
  id: number;
  position: [number, number, number]; // x, y, z position
  colors: Record<string, FaceColor | null>; // which sides have which colors
}

// Define a move on the cube
export interface Move {
  axis: Axis;
  layerIndex: number; // Which layer to rotate (0, 1, 2 for a 3x3 cube)
  direction: Direction;
  timestamp: number;
}

// Define user statistics
export interface Stats {
  bestTime: number | null;
  lastTime: number | null;
  averageTime: number;
  totalSolves: number;
  lastMoveCount: number;
}

// Define application theme
export type Theme = "light" | "dark";
