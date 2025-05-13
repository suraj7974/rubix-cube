import React, { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, PresentationControls, ContactShadows, AccumulativeShadows, RandomizedLight, Stage } from "@react-three/drei";
import * as THREE from "three";
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

  // Animation effect for subtle rotation
  React.useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (groupRef.current && !isAnimating) {
        groupRef.current.rotation.y += 0.002;
        groupRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
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
      {/* Advanced lighting setup */}
      <Stage environment="city" intensity={0.5} contactShadow={false} shadows adjustCamera={false}>
        {/* Presentation controls for nice drag effects with spring physics */}
        <PresentationControls global snap rotation={[0, 0, 0]} polar={[-Math.PI / 3, Math.PI / 3]} azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}>
          {/* Cube container with all pieces */}
          <group ref={groupRef} rotation={[0.4, 0.5, 0]}>
            {pieces.map((piece: CubePieceType) => (
              <CubePiece key={piece.id} piece={piece} onLayerClick={onLayerClick} />
            ))}
          </group>
        </PresentationControls>
      </Stage>

      {/* Shadows beneath the cube */}
      <ContactShadows position={[0, -1.6, 0]} opacity={0.7} scale={10} blur={2.5} far={4} />

      {/* Environment map for realistic reflections */}
      <Environment preset="city" />
    </>
  );
};

// Main Cube component that renders the Canvas and the CubeScene within it
const Cube: React.FC<CubeProps> = ({ onLayerClick }) => {
  return (
    <Canvas
      camera={{ position: [5, 5, 5], fov: 40 }}
      gl={{
        antialias: true,
        outputEncoding: THREE.sRGBEncoding,
      }}
      shadows
      dpr={[1, 2]} // Dynamic resolution for performance
      style={{ background: "transparent" }}
    >
      <color attach="background" args={["#f0f0f0"]} />
      <CubeScene onLayerClick={onLayerClick} />
      <OrbitControls enablePan={false} minDistance={5} maxDistance={15} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI - Math.PI / 6} />
    </Canvas>
  );
};

export default Cube;
