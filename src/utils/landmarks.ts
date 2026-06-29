import { Hand, HandLandmark } from '../types';

export const calculateDistance = (
  p1: HandLandmark,
  p2: HandLandmark
): number => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

export const calculateAngle = (
  p1: HandLandmark,
  p2: HandLandmark,
  p3: HandLandmark
): number => {
  const a = calculateDistance(p1, p2);
  const b = calculateDistance(p2, p3);
  const c = calculateDistance(p1, p3);

  return Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);
};

export const isFingerExtended = (
  landmarks: HandLandmark[],
  fingerTip: number,
  fingerPip: number
): boolean => {
  return calculateDistance(landmarks[fingerTip], landmarks[fingerPip]) > 0.05;
};

export const countExtendedFingers = (landmarks: HandLandmark[]): number => {
  let count = 0;

  // Thumb
  if (isFingerExtended(landmarks, 4, 3)) count++;

  // Index
  if (isFingerExtended(landmarks, 8, 7)) count++;

  // Middle
  if (isFingerExtended(landmarks, 12, 11)) count++;

  // Ring
  if (isFingerExtended(landmarks, 16, 15)) count++;

  // Pinky
  if (isFingerExtended(landmarks, 20, 19)) count++;

  return count;
};

export const normalizeHandLandmarks = (
  landmarks: HandLandmark[]
): HandLandmark[] => {
  const wrist = landmarks[0];
  const normalized: HandLandmark[] = [];

  for (const landmark of landmarks) {
    normalized.push({
      x: landmark.x - wrist.x,
      y: landmark.y - wrist.y,
      z: landmark.z - wrist.z,
      visibility: landmark.visibility,
    });
  }

  return normalized;
};

export const calculateLandmarkSimilarity = (
  landmarks1: HandLandmark[],
  landmarks2: HandLandmark[]
): number => {
  if (landmarks1.length !== landmarks2.length) return 0;

  const normalized1 = normalizeHandLandmarks(landmarks1);
  const normalized2 = normalizeHandLandmarks(landmarks2);

  let totalDistance = 0;
  for (let i = 0; i < normalized1.length; i++) {
    totalDistance += calculateDistance(normalized1[i], normalized2[i]);
  }

  const averageDistance = totalDistance / normalized1.length;
  const similarity = Math.max(0, 1 - averageDistance * 5);

  return similarity;
};
