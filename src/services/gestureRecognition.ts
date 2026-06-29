import { Hand, Gesture, MatchResult } from '../types';
import { calculateLandmarkSimilarity } from '../utils/landmarks';

export const matchGesture = (
  hand: Hand,
  gestures: Gesture[]
): MatchResult | null => {
  const applicableGestures = gestures.filter(
    (g) => g.handedness === 'Both' || g.handedness === hand.handedness
  );

  let bestMatch: MatchResult | null = null;
  let bestConfidence = 0;

  for (const gesture of applicableGestures) {
    if (gesture.landmarks.length === 0) continue;

    for (const sampleLandmarks of gesture.landmarks) {
      const similarity = calculateLandmarkSimilarity(
        hand.landmarks,
        sampleLandmarks
      );

      if (similarity > bestConfidence) {
        bestConfidence = similarity;
        bestMatch = {
          gesture,
          confidence: similarity,
          handIndex: 0,
        };
      }
    }
  }

  return bestMatch && bestConfidence > 0.6 ? bestMatch : null;
};

export const matchGestures = (
  hands: Hand[],
  gestures: Gesture[],
  confidenceThreshold: number
): MatchResult[] => {
  const matches: MatchResult[] = [];

  for (let i = 0; i < hands.length; i++) {
    const match = matchGesture(hands[i], gestures);
    if (match && match.confidence >= confidenceThreshold) {
      matches.push({ ...match, handIndex: i });
    }
  }

  return matches;
};
