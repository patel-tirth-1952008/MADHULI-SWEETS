"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural 3D thali — no GLTF files, only Three.js primitives:
 * a brass thali with a jalebi (torus knot), ladoos (spheres),
 * a barfi cube and a peda, surrounded by floating golden dust.
 * Rotates at 0.3 rpm; tilts up to 5° following the cursor.
 */
function Thali() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y += delta * 0.0314; // 0.3 rpm
    const maxTilt = THREE.MathUtils.degToRad(5);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -state.pointer.y * maxTilt, 0.05);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, state.pointer.x * maxTilt, 0.05);
  });

  return (
    <group ref={group}>
      {/* thali base */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[2.05, 2.3, 0.16, 64]} />
        <meshStandardMaterial color="#C98A3D" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* thali well */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[1.7, 1.78, 0.1, 64]} />
        <meshStandardMaterial color="#E3B169" roughness={0.5} metalness={0.25} />
      </mesh>

      {/* jalebi — torus knot in the centre */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <torusKnotGeometry args={[0.52, 0.17, 128, 16, 2, 3]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.4} />
      </mesh>

      {/* besan ladoos */}
      <mesh position={[1.2, 0.34, -0.55]}>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color="#DE9B36" roughness={0.65} />
      </mesh>
      <mesh position={[-1.25, 0.32, 0.45]}>
        <sphereGeometry args={[0.29, 32, 32]} />
        <meshStandardMaterial color="#E8B04B" roughness={0.65} />
      </mesh>

      {/* barfi — cream cube */}
      <mesh position={[-0.85, 0.3, -0.85]} rotation={[0, 0.6, 0]}>
        <boxGeometry args={[0.5, 0.22, 0.5]} />
        <meshStandardMaterial color="#F6EFDD" roughness={0.55} />
      </mesh>
      {/* pista sprinkle on the barfi */}
      <mesh position={[-0.78, 0.44, -0.8]} rotation={[0, 0.6, 0.3]}>
        <boxGeometry args={[0.12, 0.04, 0.12]} />
        <meshStandardMaterial color="#7CB342" roughness={0.6} />
      </mesh>

      {/* peda — flat disc */}
      <mesh position={[0.95, 0.3, 0.85]}>
        <cylinderGeometry args={[0.32, 0.34, 0.18, 24]} />
        <meshStandardMaterial color="#F2C879" roughness={0.55} />
      </mesh>
      {/* kesar strands on the peda */}
      <mesh position={[0.98, 0.4, 0.82]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
        <meshStandardMaterial color="#E65100" roughness={0.7} />
      </mesh>
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 4;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    const p = ref.current;
    if (!p) return;
    p.rotation.y = state.clock.elapsedTime * 0.02;
    p.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#EAB308" size={0.05} transparent opacity={0.65} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export default function HeroScene() {
  const [count, setCount] = useState(50);

  useEffect(() => {
    // fewer particles on small screens for performance
    setCount(window.matchMedia("(max-width: 767px)").matches ? 24 : 50);
  }, []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 2.1, 4.6], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
      aria-label="A rotating thali of fresh mithai"
    >
      <ambientLight intensity={0.9} color="#FFF6E0" />
      <directionalLight position={[3, 5, 2]} intensity={1.5} color="#FFE9B8" />
      <pointLight position={[-3, 2, -2]} intensity={0.6} color="#FACC15" />
      <Thali />
      <Dust count={count} />
    </Canvas>
  );
}
