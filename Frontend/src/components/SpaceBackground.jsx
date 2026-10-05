import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function StarField({ count = 5000 }) {
  const ref = useRef();
  
  // Create stars with random positions in a large cube
  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const pha = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
      pha[i] = Math.random() * Math.PI * 2;
    }
    return [pos, pha];
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.elapsedTime;
      // Constant rotation
      ref.current.rotation.y = time * 0.05;
      ref.current.rotation.x = time * 0.02;

      // Make stars "travel" towards the camera by moving the whole group
      // and looping it
      ref.current.position.z = (time * 2) % 50;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Second layer for depth */}
      <Points positions={positions.map(p => p * 1.5)} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#60a5fa"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function HyperSpeed() {
  const ref = useRef();
  const count = 1000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = r * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(theta);
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.position.z += 0.5;
      if (ref.current.position.z > 50) ref.current.position.z = -50;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#8b5cf6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

function Scene() {
  const groupRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    // Intense mouse response
    const x = (state.pointer.x * viewport.width) / 2;
    const y = (state.pointer.y * viewport.height) / 2;

    if (groupRef.current) {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, x * 0.1, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, y * 0.1, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.01, 0.1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.01, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
      <StarField count={4000} />
      <HyperSpeed />
      
      {/* Subtle ambient light to "pop" the darks */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#4f46e5" />
    </group>
  );
}

export default function SpaceBackground() {
  return (
    <div className="fixed inset-0 -z-50 bg-[#020617]">
      <Canvas
        camera={{ position: [0, 0, 20], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
      
      {/* Clean dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_100%)] pointer-events-none" />
    </div>
  );
}