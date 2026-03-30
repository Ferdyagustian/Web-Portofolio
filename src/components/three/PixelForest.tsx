"use client";

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Instance, Instances } from '@react-three/drei';
import { EffectComposer, Pixelation } from '@react-three/postprocessing';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function Trees() {
  const treeCount = 50;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < treeCount; i++) {
      // Place trees along a path, leaving the center relatively clear
      const x = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 60;
      // Filter out center path
      if (Math.abs(x) < 3) {
        if (x > 0) pos.push({ x: x + 4, z });
        else pos.push({ x: x - 4, z });
      } else {
        pos.push({ x, z });
      }
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Tree Trunks */}
      <Instances limit={treeCount} range={treeCount}>
        <boxGeometry args={[0.5, 3, 0.5]} />
        <meshStandardMaterial color="#2d1500" />
        {positions.map((p, i) => (
          <Instance key={`trunk-${i}`} position={[p.x, 1.5, p.z]} />
        ))}
      </Instances>
      
      {/* Tree Leaves */}
      <Instances limit={treeCount} range={treeCount}>
        <boxGeometry args={[2, 3, 2]} />
        <meshStandardMaterial color="#2d5a27" />
        {positions.map((p, i) => (
          <Instance key={`leaves-${i}`} position={[p.x, 3.5, p.z]} />
        ))}
      </Instances>
    </group>
  );
}

function CameraRig() {
  const cameraGroup = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useGSAP(() => {
    if (!cameraGroup.current) return;
    
    // GSAP ScrollTrigger to move camera forward through the forest
    gsap.to(cameraGroup.current.position, {
      z: -40,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    });

  }, []);

  useFrame((state) => {
    // Add slight floating effect to camera based on mouse or time
    if (cameraGroup.current) {
      cameraGroup.current.rotation.y = THREE.MathUtils.lerp(
        cameraGroup.current.rotation.y,
        (state.pointer.x * Math.PI) / 8, 
        0.05
      );
      cameraGroup.current.rotation.x = THREE.MathUtils.lerp(
        cameraGroup.current.rotation.x,
        (-state.pointer.y * Math.PI) / 16, 
        0.05
      );
    }
  });

  return (
    <group ref={cameraGroup} position={[0, 2, 5]}>
      <PerspectiveCamera makeDefault fov={60} />
    </group>
  );
}

function Fireflies() {
  const count = 100;
  const particles = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40; // x
      arr[i * 3 + 1] = Math.random() * 5;      // y
      arr[i * 3 + 2] = -Math.random() * 60;    // z
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (particles.current) {
      particles.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      const positionsRef = particles.current.geometry.attributes.position;
      for (let i = 0; i < count; i++) {
        // slight jitter
        positionsRef.setY(i, positions[i * 3 + 1] + Math.sin(state.clock.elapsedTime * 2 + i) * 0.5);
      }
      positionsRef.needsUpdate = true;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#fbbf24" transparent opacity={0.8} />
    </points>
  );
}

function GroundBushes() {
  const count = 100;
  
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      // Edge of the path
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (2.5 + Math.random() * 5); // Clears the center path
      const z = -Math.random() * 60;
      const scale = 0.4 + Math.random() * 1.2;
      pos.push({ x, z, scale });
    }
    return pos;
  }, []);

  return (
    <Instances limit={count} range={count}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#1e3f1b" /> {/* Darker green for ground bushes */}
      {positions.map((p, i) => (
        <Instance 
          key={`bush-${i}`} 
          position={[p.x, p.scale / 2, p.z]} 
          scale={[p.scale, p.scale, p.scale]} 
          rotation={[0, Math.random() * Math.PI, 0]}
        />
      ))}
    </Instances>
  );
}

function FallingLeaves() {
  const count = 150;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        x: (Math.random() - 0.5) * 40,
        y: Math.random() * 20,
        z: -Math.random() * 60,
        speed: 0.015 + Math.random() * 0.02,
        swaySpeed: 0.5 + Math.random() * 1.5,
      });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.y -= p.speed;
      if (p.y < -1) {
        p.y = 20;
        p.x = (Math.random() - 0.5) * 40;
        p.z = -Math.random() * 60;
      }
      const sway = Math.sin(state.clock.elapsedTime * p.swaySpeed + i) * 0.3;
      dummy.position.set(p.x + sway, p.y, p.z);
      dummy.rotation.set(
        state.clock.elapsedTime * p.speed * 10,
        state.clock.elapsedTime * p.swaySpeed,
        0
      );
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[0.25, 0.25]} />
      <meshStandardMaterial color="#4ade80" side={THREE.DoubleSide} transparent opacity={0.8} />
    </instancedMesh>
  );
}

export default function PixelForest() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas>
        <color attach="background" args={['#0a1628']} />
        <fog attach="fog" args={['#0a1628', 5, 40]} />
        
        <CameraRig />
        
        <ambientLight intensity={0.5} color="#e2e8f0" />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#fbbf24" />
        
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -30]}>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#020617" />
        </mesh>

        <Trees />
        <GroundBushes />
        <FallingLeaves />
        <Fireflies />
        
        {/* Post-processing for Pixel Art Look */}
        <EffectComposer>
          <Pixelation granularity={5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
