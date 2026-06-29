import { Hand } from '../types';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

const COLORS = {
  left: '#ff6b6b',
  right: '#4ecdc4',
  landmark: '#00f7ff',
};

export const drawHand = (
  ctx: CanvasRenderingContext2D,
  hand: Hand,
  canvasWidth: number,
  canvasHeight: number
) => {
  const color = hand.handedness === 'Left' ? COLORS.left : COLORS.right;

  // Draw connections
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [start, end] of HAND_CONNECTIONS) {
    const startLandmark = hand.landmarks[start];
    const endLandmark = hand.landmarks[end];

    if (startLandmark && endLandmark) {
      ctx.beginPath();
      ctx.moveTo(startLandmark.x * canvasWidth, startLandmark.y * canvasHeight);
      ctx.lineTo(endLandmark.x * canvasWidth, endLandmark.y * canvasHeight);
      ctx.stroke();
    }
  }

  // Draw landmarks
  ctx.fillStyle = COLORS.landmark;
  for (const landmark of hand.landmarks) {
    const radius = 4;
    ctx.beginPath();
    ctx.arc(landmark.x * canvasWidth, landmark.y * canvasHeight, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
};

export const drawMultipleHands = (
  ctx: CanvasRenderingContext2D,
  hands: Hand[],
  canvasWidth: number,
  canvasHeight: number
) => {
  for (const hand of hands) {
    drawHand(ctx, hand, canvasWidth, canvasHeight);
  }
};
