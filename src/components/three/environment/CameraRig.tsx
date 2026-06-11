"use client";

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { interpolateWaypoints } from './utils';

export function CameraRig({
  mousePosRef,
  scrollProgress,
}: {
  mousePosRef: React.RefObject<{ x: number; y: number }>;
  scrollProgress: React.RefObject<number>;
}) {
  const cameraGroup = useRef<THREE.Group>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;

  useFrame(() => {
    if (!cameraGroup.current) return;

    // Read the ref's current value (updated without re-renders)
    const mp = mousePosRef.current ?? { x: 0, y: 0 };
    const sp = scrollProgress.current ?? 0;

    const target = interpolateWaypoints(sp, isMobile);

    // Add parallax offsets (now enabled for mobile via gyroscope)
    const finalPosX = target.pos[0] + (mp.x * 0.4);
    const finalPosY = target.pos[1] + (mp.y * 0.25);
    const finalPosZ = target.pos[2];

    const finalRotX = target.rot[0] + (-mp.y * 0.15);
    const finalRotY = target.rot[1] + (mp.x * 0.15);

    cameraGroup.current.position.x = THREE.MathUtils.lerp(cameraGroup.current.position.x, finalPosX, 0.05);
    cameraGroup.current.position.y = THREE.MathUtils.lerp(cameraGroup.current.position.y, finalPosY, 0.05);
    cameraGroup.current.position.z = THREE.MathUtils.lerp(cameraGroup.current.position.z, finalPosZ, 0.05);

    cameraGroup.current.rotation.x = THREE.MathUtils.lerp(cameraGroup.current.rotation.x, finalRotX, 0.05);
    cameraGroup.current.rotation.y = THREE.MathUtils.lerp(cameraGroup.current.rotation.y, finalRotY, 0.05);
  });

  return (
    <group ref={cameraGroup} position={[0, 2, 5]}>
      <PerspectiveCamera makeDefault fov={60} />
    </group>
  );
}
