import { useEffect, useRef } from "react";
import { useCubeStore } from "../store/cubeStore";

// Custom hook for handling the cube timer
export const useTimer = () => {
  const { timerRunning, currentTime, updateTimer, startTimer, stopTimer } = useCubeStore();

  // Set up timer interval
  useEffect(() => {
    let intervalId: number | null = null;

    if (timerRunning) {
      intervalId = window.setInterval(() => {
        updateTimer();
      }, 10); // Update every 10ms for smooth display
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [timerRunning, updateTimer]);

  // Format time as mm:ss.ms
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time * 100) % 100);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
  };

  return {
    time: currentTime,
    formattedTime: formatTime(currentTime),
    isRunning: timerRunning,
    startTimer,
    stopTimer,
  };
};
