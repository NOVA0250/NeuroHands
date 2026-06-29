import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Hand, DetectionResult } from '../types';

let handLandmarker: HandLandmarker | null = null;
let lastFrameTime = 0;
let frameCount = 0;
let currentFps = 0;

export const initializeHandLandmarker = async (): Promise<void> => {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-studio/latest/hand_landmarker.task`,
    },
    runningMode: 'VIDEO',
    numHands: 2,
  });
};

export const detectHands = (videoElement: HTMLVideoElement): DetectionResult | null => {
  if (!handLandmarker) return null;

  try {
    const result = handLandmarker.detectForVideo(videoElement, Date.now());

    const hands: Hand[] = result.landmarks.map((landmarks, index) => ({
      landmarks: landmarks.map((l) => ({
        x: l.x,
        y: l.y,
        z: l.z,
        visibility: l.visibility || 1,
      })),
      handedness: result.handedness[index].displayName as 'Left' | 'Right',
      confidence: result.handedness[index].score,
    }));

    // Calculate FPS
    const now = Date.now();
    if (lastFrameTime > 0) {
      frameCount++;
      const timeDiff = now - lastFrameTime;
      if (timeDiff >= 1000) {
        currentFps = (frameCount * 1000) / timeDiff;
        frameCount = 0;
        lastFrameTime = now;
      }
    } else {
      lastFrameTime = now;
    }

    return {
      hands,
      timestamp: Date.now(),
      fps: currentFps,
    };
  } catch (error) {
    console.error('Hand detection error:', error);
    return null;
  }
};

export const isHandLandmarkerReady = (): boolean => {
  return handLandmarker !== null;
};
