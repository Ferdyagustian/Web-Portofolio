import * as THREE from 'three';

export const LERP_SPEED = 0.008; // ~2 seconds for full transition at 60fps

export function lerpColor(current: THREE.Color, target: THREE.Color, t: number) {
  current.r += (target.r - current.r) * t;
  current.g += (target.g - current.g) * t;
  current.b += (target.b - current.b) * t;
}

export function lerpNum(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}

export interface Waypoint {
  pos: [number, number, number];
  rot: [number, number, number];
}

export const WAYPOINTS: Waypoint[] = [
  { pos: [0, 2, 5], rot: [0, 0, 0] },          // Hero (t = 0)
  { pos: [-2.5, 1.5, -9.2], rot: [0, 0.35, 2] }, // About (t = 0.25) (kiri/kanan,atas/bawah,maju/mundur)
  { pos: [2.2, 1.9, -24], rot: [-0.05, -0.35, 0] }, // Skills (t = 0.5)
  { pos: [0, 1.8, -42], rot: [0, 0, 0] },       // Projects (t = 0.75)
  { pos: [0, 4.3, -52], rot: [0.3, 0, 0] }      // Contact (t = 1.0)
];

export function interpolateWaypoints(t: number, isMobile: boolean): Waypoint {

  const segmentCount = WAYPOINTS.length - 1;
  const rawIndex = t * segmentCount;
  const index = Math.min(Math.floor(rawIndex), segmentCount - 1);
  const localT = rawIndex - index;

  const wpA = WAYPOINTS[index];
  const wpB = WAYPOINTS[index + 1];

  const pos: [number, number, number] = [
    THREE.MathUtils.lerp(wpA.pos[0], wpB.pos[0], localT),
    THREE.MathUtils.lerp(wpA.pos[1], wpB.pos[1], localT),
    THREE.MathUtils.lerp(wpA.pos[2], wpB.pos[2], localT),
  ];

  const rot: [number, number, number] = [
    THREE.MathUtils.lerp(wpA.rot[0], wpB.rot[0], localT),
    THREE.MathUtils.lerp(wpA.rot[1], wpB.rot[1], localT),
    THREE.MathUtils.lerp(wpA.rot[2], wpB.rot[2], localT),
  ];

  return { pos, rot };
}
