/**
 * Utility functions for playing sound effects in the Rubik's Cube application
 */

// Play a sound when a cube face is rotated
export const playRotateSound = (): void => {
  const audio = new Audio();
  audio.src = "/sounds/rotate.mp3";
  audio.volume = 0.3;
  audio.play().catch(() => {
    // Swallow error - browser might require user interaction first
    console.log("Sound playback failed. User interaction might be required first.");
  });
};

// Play a sound when the cube is scrambled
export const playScrambleSound = (): void => {
  const audio = new Audio();
  audio.src = "/sounds/scramble.mp3";
  audio.volume = 0.4;
  audio.play().catch(() => {
    console.log("Sound playback failed. User interaction might be required first.");
  });
};

// Play a sound when the cube is solved
export const playSolveSound = (): void => {
  const audio = new Audio();
  audio.src = "/sounds/solve.mp3";
  audio.volume = 0.5;
  audio.play().catch(() => {
    console.log("Sound playback failed. User interaction might be required first.");
  });
};

// Toggle sound on/off
let soundEnabled = true;

export const toggleSound = (): boolean => {
  soundEnabled = !soundEnabled;
  return soundEnabled;
};

export const isSoundEnabled = (): boolean => {
  return soundEnabled;
};
