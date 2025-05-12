import React from "react";
import { useTimer } from "../../hooks/useTimer";
import { useCubeStore } from "../../store/cubeStore";
import "./Controls.css"; // We'll create this CSS file next

// Custom icons as before
const MoonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "8px" }}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const SunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: "8px" }}
  >
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

interface ControlsProps {
  colorMode: string;
  toggleColorMode: () => void;
}

const Controls: React.FC<ControlsProps> = ({ colorMode, toggleColorMode }) => {
  const { scrambleCube, resetCube, isScrambled, isSolved, isAnimating, moves, stats } = useCubeStore();
  const { formattedTime, isRunning } = useTimer();

  return (
    <div className={`controls ${colorMode}`}>
      {/* Timer Display */}
      <div className="timer-display">
        <span className={`timer ${isRunning ? "running" : isSolved && moves.length > 0 ? "solved" : ""}`}>{formattedTime}</span>
      </div>

      {/* Control Buttons */}
      <div className="button-group">
        <button className="button scramble-button" onClick={scrambleCube} disabled={isAnimating}>
          Scramble
        </button>

        <button className="button reset-button" onClick={resetCube}>
          Reset
        </button>

        <button className="button theme-button" onClick={toggleColorMode} aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}>
          {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          {colorMode === "light" ? "Dark" : "Light"}
        </button>
      </div>

      {/* Stats Display */}
      <div className="stats-container">
        <Stat label="Moves" value={moves.length.toString()} />
        <Stat label="Best Time" value={stats.bestTime !== null ? formatTime(stats.bestTime) : "-"} />
        <Stat label="Last Solve" value={stats.lastTime !== null ? formatTime(stats.lastTime) : "-"} />
        <Stat label="Avg Time" value={stats.totalSolves > 0 ? formatTime(stats.averageTime) : "-"} />
        <Stat label="Total Solves" value={stats.totalSolves.toString()} />
      </div>

      {/* Status Badge */}
      <div className="status-container">
        {isScrambled && !isSolved && <div className="status-badge solving">Solving...</div>}
        {isSolved && moves.length > 0 && <div className="status-badge solved">Solved!</div>}
      </div>
    </div>
  );
};

// Helper component for displaying stats
const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="stat">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </div>
);

// Helper function to format time
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time * 100) % 100);

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
};

export default Controls;
