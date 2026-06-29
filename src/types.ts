export interface HandLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface Hand {
  landmarks: HandLandmark[];
  handedness: 'Left' | 'Right';
  confidence: number;
}

export interface DetectionResult {
  hands: Hand[];
  timestamp: number;
  fps: number;
}

export interface Gesture {
  id: string;
  name: string;
  landmarks: HandLandmark[][];
  handedness: 'Left' | 'Right' | 'Both';
  isCustom: boolean;
  createdAt: number;
  effect?: GestureEffect;
  soundUrl?: string;
}

export interface GestureEffect {
  id: string;
  name: string;
  type: 'fire' | 'lightning' | 'particles' | 'confetti' | 'portal' | 'neon' | 'ripple';
  color: string;
  intensity: number;
  duration: number;
}

export interface AppConfig {
  confidenceThreshold: number;
  enableSound: boolean;
  enableEffects: boolean;
  recordingDuration: number;
  cooldownTime: number;
}

export interface MatchResult {
  gesture: Gesture;
  confidence: number;
  handIndex: number;
}