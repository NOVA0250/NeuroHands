import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { Hand, DetectionResult } from '../types';

let handLandmarker: HandLandmarker | null = null;
let initPromise: Promise<void> | null = null;
let lastFrameTime = 0;
let frameCount = 0;
let currentFps = 0;
let lastVideoTime = -1;

let consecutiveErrors = 0;
const MAX_CONSECUTIVE_ERRORS = 5;
let reinitializing = false;

export const initializeHandLandmarker = async (): Promise<void> => {
  // Prevent duplicate initialization (e.g. React StrictMode double-invoking
  // effects in dev mode), which creates two WebGL contexts and breaks GL state.
  if (handLandmarker) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'CPU',
      },
      runningMode: 'VIDEO',
      numHands: 2,
    });

    consecutiveErrors = 0;
    reinitializing = false;

    console.log('HandLandmarker initialized:', handLandmarker);
  })();

  return initPromise;
};

export const detectHands = (videoElement: HTMLVideoElement): DetectionResult | null => {
  if (!handLandmarker || detectionDisabled) return null;

  // Don't call detectForVideo until the video actually has frame data —
  // calling it too early (0 width/height) can corrupt internal GL state.
  if (videoElement.readyState < 2 || videoElement.videoWidth === 0) return null;
  if (videoElement.currentTime === lastVideoTime) { return null;
}

lastVideoTime = videoElement.currentTime;

  try {
    const result = handLandmarker.detectForVideo(videoElement, Date.now());
    consecutiveErrors = 0;

    const hands: Hand[] = result.landmarks.map((landmarks, index) => {
      const handedness = result.handedness[index];
      return {
        landmarks: landmarks.map((l) => ({
          x: l.x,
          y: l.y,
          z: l.z,
          visibility: l.visibility || 1,
        })),
        handedness: (handedness[0]?.categoryName || 'Right') as 'Left' | 'Right',
        confidence: handedness[0]?.score || 0,
      };
    });

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
    consecutiveErrors++;
    if (consecutiveErrors === 1) {
      console.error('Hand detection error:', error);
    }
    if (
      consecutiveErrors >= MAX_CONSECUTIVE_ERRORS &&
      !reinitializing
    ) {
      reinitializing = true;
      console.warn(
        "Too many MediaPipe errors. Reinitializing HandLandmarker..."
      );
      handLandmarker?.close();
      handLandmarker = null;
      initPromise = null;
      initializeHandLandmarker()
      .catch((err) => {
        console.error("MediaPipe reinitialization failed:", err);
      })
      .finally(() => {
        consecutiveErrors = 0;
        reinitializing = false;
      });
    }
    return null;
  }
};

export const isHandLandmarkerReady = (): boolean => {
  return handLandmarker !== null;
};