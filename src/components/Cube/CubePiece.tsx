import React, { useRef } from "react";
import * as THREE from "three";
import type { ThreeEvent } from "@react-three/fiber";
import type { CubePiece as CubePieceType, Axis, Direction, FaceColor } from "../../types/cube";

interface CubePieceProps {
  piece: CubePieceType;
  onLayerClick: (axis: Axis, layerIndex: number, direction: Direction) => void;
}

// Color mapping
const colorMap: Record<FaceColor, string> = {
  white: "#FFFFFF",
  yellow: "#FFFF00",
  red: "#FF0000",
  orange: "#FFA500",
  blue: "#0000FF",
  green: "#00FF00",
};

const CubePiece: React.FC<CubePieceProps> = ({ piece, onLayerClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position, colors } = piece;

  // Size of each cube piece
  const size = 0.95;

  // Handle clicks on cube faces
  const handleClick = (e: ThreeEvent<MouseEvent>, face: string) => {
    e.stopPropagation();

    // Determine the axis and layer based on which face was clicked
    let axis: Axis;
    let layerIndex: number;
    let direction: Direction = 1;

    // Get click coordinates relative to the face
    const point = e.point.clone();
    if (meshRef.current) {
      meshRef.current.updateMatrixWorld();
      const worldMatrix = meshRef.current.matrixWorld;
      point.applyMatrix4(new THREE.Matrix4().copy(worldMatrix).invert());
    }

    // Determine axis and layer based on which face was clicked
    if (face === "right" || face === "left") {
      axis = "x";
      layerIndex = position[0] + 2; // Convert from -1,0,1 to 1,2,3
      direction = face === "right" ? 1 : -1;
    } else if (face === "top" || face === "bottom") {
      axis = "y";
      layerIndex = position[1] + 2; // Convert from -1,0,1 to 1,2,3
      direction = face === "top" ? 1 : -1;
    } else {
      // front or back
      axis = "z";
      layerIndex = position[2] + 2; // Convert from -1,0,1 to 1,2,3
      direction = face === "front" ? 1 : -1;
    }

    // Call the parent handler
    onLayerClick(axis, layerIndex, direction);
  };

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial color="#111111" />

        {/* Render each colored face of the cube piece */}
        {Object.entries(colors).map(([face, color]) => {
          if (!color) return null;

          let rotation: [number, number, number] = [0, 0, 0];
          let position: [number, number, number] = [0, 0, 0];

          // Position and rotate the face based on which side it is
          switch (face) {
            case "right":
              rotation = [0, Math.PI / 2, 0];
              position = [size / 2 + 0.001, 0, 0];
              break;
            case "left":
              rotation = [0, -Math.PI / 2, 0];
              position = [-size / 2 - 0.001, 0, 0];
              break;
            case "top":
              rotation = [Math.PI / 2, 0, 0];
              position = [0, size / 2 + 0.001, 0];
              break;
            case "bottom":
              rotation = [-Math.PI / 2, 0, 0];
              position = [0, -size / 2 - 0.001, 0];
              break;
            case "front":
              rotation = [0, 0, 0];
              position = [0, 0, size / 2 + 0.001];
              break;
            case "back":
              rotation = [0, Math.PI, 0];
              position = [0, 0, -size / 2 - 0.001];
              break;
          }

          return (
            <mesh key={face} position={position} rotation={rotation} onClick={(e) => handleClick(e, face)}>
              <planeGeometry args={[size, size]} />
              <meshStandardMaterial color={colorMap[color]} emissive={colorMap[color]} emissiveIntensity={0.1} roughness={0.3} />
            </mesh>
          );
        })}
      </mesh>
    </group>
  );
};

export default CubePiece;
