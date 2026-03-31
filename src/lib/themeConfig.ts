import { TimeTheme } from './useTimeTheme';

export interface ThemeConfig {
  // Sky gradient (5 stops, bottom to top in shader UV)
  skyTop: string;
  skyMidTop: string;
  skyMid: string;
  skyMidBottom: string;
  skyBottom: string;

  // Celestial body
  celestialType: 'sun' | 'moon';
  celestialPosition: [number, number, number]; // Always z=-65 (locked far back)
  celestialCoreColor: string;
  celestialInnerGlow: string;
  celestialOuterGlow: string;
  celestialHaze: string;
  celestialRayColor: string;
  celestialCoreSize: number;

  // Lighting
  ambientColor: string;
  ambientIntensity: number;
  mainLightColor: string;
  mainLightIntensity: number;
  mainLightPosition: [number, number, number];
  fillLightColor: string;
  fillLightIntensity: number;

  // Fog
  fogColor: string;
  fogNear: number;
  fogFar: number;

  // Scene colors
  bgColor: string;
  groundColor: string;
  trunkColor: string;
  leavesColor: string;
  bushColor: string;
  leafParticleColor: string;
  leafOpacity: number;
  fireflyColor: string;
  fireflyOpacity: number;
  fireflySize: number;

  // Clouds / Stars
  cloudColors: string[];
  cloudOpacity: number;
  showStars: boolean;
}

// ===== PAGI (05:00 - 10:59) =====
// Sunrise: soft pink-gold sky, sun rising from lower right
const PAGI: ThemeConfig = {
  skyTop: '#4a6fa5',      // Soft blue
  skyMidTop: '#7db4c9',   // Light sky blue
  skyMid: '#f4a5b0',      // Soft pink
  skyMidBottom: '#f7c59f', // Peach
  skyBottom: '#ffd700',    // Golden horizon

  celestialType: 'sun',
  celestialPosition: [25, 15, -80],  // Smoothly rising from right
  celestialCoreColor: '#FFE066',
  celestialInnerGlow: '#FFD93D',
  celestialOuterGlow: '#FFB347',
  celestialHaze: '#FF8C42',
  celestialRayColor: '#FFE066',
  celestialCoreSize: 4.5,

  ambientColor: '#ffe4c4',
  ambientIntensity: 0.5,
  mainLightColor: '#FFD700',
  mainLightIntensity: 0.8,
  mainLightPosition: [10, 5, -30],
  fillLightColor: '#f4a5b0',
  fillLightIntensity: 0.2,

  fogColor: '#c4a882',
  fogNear: 8,
  fogFar: 45,

  bgColor: '#4a6fa5',
  groundColor: '#1a2a15',
  trunkColor: '#3d2010',
  leavesColor: '#2a5225',
  bushColor: '#1a3518',
  leafParticleColor: '#6dd892',
  leafOpacity: 0.6,
  fireflyColor: '#f0c55e',
  fireflyOpacity: 0.3,
  fireflySize: 0.08,

  cloudColors: ['#f8e8e0', '#ffd4d4', '#ffe8d0'],
  cloudOpacity: 0.3,
  showStars: false,
};

// ===== SIANG (11:00 - 14:59) =====
// Bright noon: clear blue sky, sun high up center
const SIANG: ThemeConfig = {
  skyTop: '#1565c0',      // Deep blue
  skyMidTop: '#2196f3',   // Bright blue
  skyMid: '#64b5f6',      // Light blue
  skyMidBottom: '#90caf9', // Pale blue
  skyBottom: '#e3f2fd',    // Almost white near horizon

  celestialType: 'sun',
  celestialPosition: [0, 35, -80],  // High center
  celestialCoreColor: '#FFFFFF',
  celestialInnerGlow: '#FFF9C4',
  celestialOuterGlow: '#FFE082',
  celestialHaze: '#FFD54F',
  celestialRayColor: '#FFFFFF',
  celestialCoreSize: 5,

  ambientColor: '#e8f4f8',
  ambientIntensity: 0.7,
  mainLightColor: '#FFFFFF',
  mainLightIntensity: 1.4,
  mainLightPosition: [0, 16, -30],
  fillLightColor: '#87ceeb',
  fillLightIntensity: 0.3,

  fogColor: '#a8c8e8',
  fogNear: 10,
  fogFar: 50,

  bgColor: '#1565c0',
  groundColor: '#1a3a15',
  trunkColor: '#4a2810',
  leavesColor: '#2d6b2d',
  bushColor: '#1e4a1e',
  leafParticleColor: '#4ade80',
  leafOpacity: 0.5,
  fireflyColor: '#f0c55e',
  fireflyOpacity: 0.1,
  fireflySize: 0.06,

  cloudColors: ['#ffffff', '#f5f5f5', '#e8e8e8'],
  cloudOpacity: 0.5,
  showStars: false,
};

// ===== SORE (15:00 - 17:59) =====
// Sunset: purple-red-orange sky, sun low left
const SORE: ThemeConfig = {
  skyTop: '#1a0a2e',      // Deep purple
  skyMidTop: '#4a1942',   // Purple
  skyMid: '#c0392b',      // Deep red
  skyMidBottom: '#e67e22', // Orange
  skyBottom: '#f39c12',    // Golden

  celestialType: 'sun',
  celestialPosition: [-25, 10, -80],  // Setting gracefully on the left
  celestialCoreColor: '#FFD93D',
  celestialInnerGlow: '#FFB347',
  celestialOuterGlow: '#FF8C42',
  celestialHaze: '#FF6B35',
  celestialRayColor: '#FFB347',
  celestialCoreSize: 5,

  ambientColor: '#e8a87c',
  ambientIntensity: 0.3,
  mainLightColor: '#FFB347',
  mainLightIntensity: 1.2,
  mainLightPosition: [-8, 12, -20],
  fillLightColor: '#c0392b',
  fillLightIntensity: 0.3,

  fogColor: '#2a1020',
  fogNear: 8,
  fogFar: 45,

  bgColor: '#1a0a2e',
  groundColor: '#060808',
  trunkColor: '#2a1505',
  leavesColor: '#1a3518',
  bushColor: '#0f2810',
  leafParticleColor: '#e67e22',
  leafOpacity: 0.6,
  fireflyColor: '#f0c55e',
  fireflyOpacity: 0.8,
  fireflySize: 0.12,

  cloudColors: ['#c0392b', '#e74c3c', '#d35400'],
  cloudOpacity: 0.2,
  showStars: false,
};

// ===== MALAM (18:00 - 04:59) =====
// Night: dark blue sky, full moon, stars, bright fireflies
const MALAM: ThemeConfig = {
  skyTop: '#020818',      // Near black
  skyMidTop: '#0a1628',   // Very dark blue
  skyMid: '#0f1f3a',      // Dark blue
  skyMidBottom: '#152a4a', // Navy
  skyBottom: '#1a3050',    // Dark teal horizon

  celestialType: 'moon',
  celestialPosition: [12, 18, -80],  // Lowered slightly and centered more to ensure it is immediately visible
  celestialCoreColor: '#f4f6ff',     // Bright white full moon
  celestialInnerGlow: '#c6d0f5',     
  celestialOuterGlow: '#94a5df',
  celestialHaze: '#556699',          // Deep blue haze
  celestialRayColor: '#c6d0f5',      // (Faded out for moon)
  celestialCoreSize: 5.5,            // Larger, dominant moon

  ambientColor: '#203050',           // FIXED TYPO: previously #3040608
  ambientIntensity: 0.4,             // Increased intensity to light up the trees
  mainLightColor: '#aab8e0',         // Bright moonlight color
  mainLightIntensity: 1.0,           // Strong moonlight casting to highlight leaves
  mainLightPosition: [12, 18, -20],
  fillLightColor: '#223355',
  fillLightIntensity: 0.4,

  fogColor: '#060818',
  fogNear: 5,
  fogFar: 45,

  bgColor: '#020818',
  groundColor: '#0a1220',            // Dark blueish ground
  trunkColor: '#121a22',             // Moonlit tree trunks
  leavesColor: '#102520',            // Moonlit deep pine green (catches the moonlight)
  bushColor: '#0c2018',
  leafParticleColor: '#445577',
  leafOpacity: 0.3,
  fireflyColor: '#fbbf24',
  fireflyOpacity: 1.0,
  fireflySize: 0.15,

  cloudColors: [],
  cloudOpacity: 0,
  showStars: true,
};

export const THEME_CONFIGS: Record<TimeTheme, ThemeConfig> = {
  pagi: PAGI,
  siang: SIANG,
  sore: SORE,
  malam: MALAM,
};
