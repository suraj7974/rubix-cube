import { useEffect, useState } from "react";
import Cube from "./components/Cube/Cube";
import Controls from "./components/UI/Controls";
import { useCubeStore } from "./store/cubeStore";
import type { Axis, Direction } from "./types/cube";
import "./App.css";

function App() {
  const { rotateLayer, theme, initializeCube } = useCubeStore();
  const [colorMode, setColorMode] = useState(theme); // Local state for color mode

  // Initialize the cube and sync theme on component mount
  useEffect(() => {
    initializeCube();

    // Apply theme to body
    document.body.setAttribute("data-theme", colorMode);

    // Add keyboard controls for cube rotation
    const handleKeyDown = (e: KeyboardEvent) => {
      // Layer indices (1, 2, 3) correspond to layers (-1, 0, 1)
      let axis: Axis | null = null;
      let layerIndex = 0;
      let direction: Direction = 1;

      switch (e.key) {
        // X-axis rotations
        case "r":
          axis = "x";
          layerIndex = 3;
          direction = 1;
          break;
        case "R":
          axis = "x";
          layerIndex = 3;
          direction = -1;
          break;
        case "l":
          axis = "x";
          layerIndex = 1;
          direction = -1;
          break;
        case "L":
          axis = "x";
          layerIndex = 1;
          direction = 1;
          break;

        // Y-axis rotations
        case "u":
          axis = "y";
          layerIndex = 3;
          direction = 1;
          break;
        case "U":
          axis = "y";
          layerIndex = 3;
          direction = -1;
          break;
        case "d":
          axis = "y";
          layerIndex = 1;
          direction = -1;
          break;
        case "D":
          axis = "y";
          layerIndex = 1;
          direction = 1;
          break;

        // Z-axis rotations
        case "f":
          axis = "z";
          layerIndex = 3;
          direction = 1;
          break;
        case "F":
          axis = "z";
          layerIndex = 3;
          direction = -1;
          break;
        case "b":
          axis = "z";
          layerIndex = 1;
          direction = -1;
          break;
        case "B":
          axis = "z";
          layerIndex = 1;
          direction = 1;
          break;

        // Middle layer rotations
        case "m":
          axis = "x";
          layerIndex = 2;
          direction = -1;
          break;
        case "M":
          axis = "x";
          layerIndex = 2;
          direction = 1;
          break;
        case "e":
          axis = "y";
          layerIndex = 2;
          direction = -1;
          break;
        case "E":
          axis = "y";
          layerIndex = 2;
          direction = 1;
          break;
        case "s":
          axis = "z";
          layerIndex = 2;
          direction = 1;
          break;
        case "S":
          axis = "z";
          layerIndex = 2;
          direction = -1;
          break;
      }

      if (axis !== null) {
        rotateLayer(axis, layerIndex, direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [initializeCube, rotateLayer, colorMode]);

  // Handler for cube face rotation
  const handleLayerClick = (axis: Axis, layerIndex: number, direction: Direction) => {
    rotateLayer(axis, layerIndex, direction);
  };

  // Handle theme toggle
  const toggleColorMode = () => {
    const newMode = colorMode === "light" ? "dark" : "light";
    setColorMode(newMode);
    document.body.setAttribute("data-theme", newMode);
    useCubeStore.getState().toggleTheme();
  };

  return (
    <div className="container">
      <div className="header">
        <h1>3D Rubik's Cube</h1>
      </div>

      <div className="content">
        {/* Cube display area */}
        <div className="cube-container">
          <Cube onLayerClick={handleLayerClick} />
        </div>

        {/* Controls and stats */}
        <div className="controls-container">
          <Controls colorMode={colorMode} toggleColorMode={toggleColorMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
