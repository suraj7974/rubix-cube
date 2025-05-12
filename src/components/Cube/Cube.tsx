import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useCubeStore } from "../../store/cubeStore";
import type { CubePiece as CubePieceType, Axis, Direction } from "../../types/cube";
import CubePiece from "./CubePiece";

interface CubeProps {
  onLayerClick: (axis: Axis, layerIndex: number, direction: Direction) => void;
}

// Create a separate component for the cube scene that will be used inside the Canvas
const CubeScene = ({ onLayerClick }: CubeProps) => {
  const pieces = useCubeStore((state) => state.pieces);
  const isAnimating = useCubeStore((state) => state.isAnimating);
  const groupRef = useRef(null);

  // useFrame hook is correctly used inside a component that is a child of Canvas
  React.useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (groupRef.current && !isAnimating) {
        groupRef.current.rotation.y += 0.002;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isAnimating]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Cube container */}
      <group ref={groupRef}>
        {/* Render each cube piece */}
        {pieces.map((piece: CubePieceType) => (
          <CubePiece key={piece.id} piece={piece} onLayerClick={onLayerClick} />
        ))}
      </group>

      {/* Controls for rotating the entire cube */}
      <OrbitControls enablePan={false} minDistance={5} maxDistance={15} />
    </>
  );
};

// Main Cube component that renders the Canvas and the CubeScene within it
const Cube: React.FC<CubeProps> = ({ onLayerClick }) => {
  return (
    <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
      <CubeScene onLayerClick={onLayerClick} />
    </Canvas>
  );
};

export default Cube;
