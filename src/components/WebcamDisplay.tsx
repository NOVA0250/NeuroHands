import React, { useEffect, useRef } from 'react';
import { Hand } from '../types';
import { drawMultipleHands } from '../utils/drawing';

interface WebcamDisplayProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  hands: Hand[];
  fps: number;
  isLoading: boolean;
}

export const WebcamDisplay: React.FC<WebcamDisplayProps> = ({
  videoRef,
  canvasRef,
  hands,
  fps,
  isLoading,
}) => {
  const animationRef = useRef<number>();

  useEffect(() => {
    const drawFrame = () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw video
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Draw hands
      drawMultipleHands(ctx, hands, canvas.width, canvas.height);

      // Draw FPS
      ctx.fillStyle = '#00f7ff';
      ctx.font = 'bold 16px sans-serif';
      ctx.shadowColor = 'rgba(0, 247, 255, 0.5)';
      ctx.shadowBlur = 10;
      ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 30);
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(drawFrame);
    };

    animationRef.current = requestAnimationFrame(drawFrame);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hands, fps, canvasRef, videoRef]);

  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
            <p>Initializing hand tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
};
