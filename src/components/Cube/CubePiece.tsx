import React, { useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import type { CubePiece as CubePieceType, Axis, Direction, FaceColor } from "../../types/cube";

interface CubePieceProps {
  piece: CubePieceType;
  onLayerClick: (axis: Axis, layerIndex: number, direction: Direction) => void;
}

// Enhanced color mapping with slightly more realistic colors
const colorMap: Record<FaceColor, string> = {
  white: "#F0F0F0",
  yellow: "#FFD700",
  red: "#D32F2F",
  orange: "#FF8C00",
  blue: "#1976D2",
  green: "#388E3C",
};

const CubePiece: React.FC<CubePieceProps> = ({ piece, onLayerClick }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { position, colors } = piece;

  // Size settings
  const size = 0.95;
  const faceSize = size * 0.85; // Stickers are slightly smaller than the cube face
  const bevelSize = 0.04; // Size of the beveled edge

  // Handle interactive hover states
  const [hovered, setHovered] = useState<string | null>(null);

  // Subtle animation for interactivity
  useFrame(() => {
    if (meshRef.current && hovered) {
      // Very subtle "breathing" effect when hovered
      const t = Date.now() * 0.001;
      const scale = 1 + Math.sin(t * 3) * 0.01;
      meshRef.current.scale.setScalar(scale);
    } else if (meshRef.current && meshRef.current.scale.x !== 1) {
      // Reset scale when not hovered
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
  });

  // Handle clicks on cube faces
  const handleClick = (e: ThreeEvent<MouseEvent>, face: string) => {
    e.stopPropagation();

    // Determine the axis and layer based on which face was clicked
    let axis: Axis;
    let layerIndex: number;
    let direction: Direction = 1;

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
      {/* Main cube piece with rounded edges */}
      <RoundedBox ref={meshRef} args={[size, size, size]} radius={bevelSize} smoothness={4} castShadow receiveShadow>
        <meshPhysicalMaterial color="#111111" roughness={0.4} clearcoat={0.5} clearcoatRoughness={0.2} />
      </RoundedBox>

      {/* Render each colored face sticker */}
      {Object.entries(colors).map(([face, color]) => {
        if (!color) return null;

        let rotation: [number, number, number] = [0, 0, 0];
        let position: [number, number, number] = [0, 0, 0];

        // Position and rotate the face based on which side it is
        switch (face) {
          case "right":
            rotation = [0, Math.PI / 2, 0];
            position = [size / 2 + 0.002, 0, 0];
            break;
          case "left":
            rotation = [0, -Math.PI / 2, 0];
            position = [-size / 2 - 0.002, 0, 0];
            break;
          case "top":
            rotation = [Math.PI / 2, 0, 0];
            position = [0, size / 2 + 0.002, 0];
            break;
          case "bottom":
            rotation = [-Math.PI / 2, 0, 0];
            position = [0, -size / 2 - 0.002, 0];
            break;
          case "front":
            rotation = [0, 0, 0];
            position = [0, 0, size / 2 + 0.002];
            break;
          case "back":
            rotation = [0, Math.PI, 0];
            position = [0, 0, -size / 2 - 0.002];
            break;
        }

        return (
          <mesh
            key={face}
            position={position}
            rotation={rotation}
            onClick={(e) => handleClick(e, face)}
            onPointerOver={() => setHovered(face)}
            onPointerOut={() => setHovered(null)}
          >
            <boxGeometry args={[faceSize, faceSize, 0.01]} />
            <meshPhysicalMaterial color={colorMap[color]} roughness={0.25} metalness={0.1} clearcoat={0.8} clearcoatRoughness={0.2} envMapIntensity={1.2} />
          </mesh>
        );
      })}
    </group>
  );
};

export default CubePiece;
