import React from 'react';
import { Gesture, MatchResult } from '../types';

interface GestureDisplayProps {
  detectedGesture: MatchResult | null;
  allGestures: Gesture[];
}

export const GestureDisplay: React.FC<GestureDisplayProps> = ({
  detectedGesture,
  allGestures,
}) => {
  return (
    <div className="glass rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-neon-blue">Detected Gesture</h2>
      
      {detectedGesture ? (
        <div className="space-y-3">
          <div className="text-2xl font-bold">
            {detectedGesture.gesture.name}
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-neon-blue to-neon-purple h-full transition-all"
                style={{ width: `${detectedGesture.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-mono">
              {(detectedGesture.confidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-center py-8">
          <p className="text-sm">No gesture detected</p>
          <p className="text-xs mt-2">Show a gesture to the camera</p>
        </div>
      )}

      <div className="border-t border-slate-700 pt-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Available Gestures</h3>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
          {allGestures.map((gesture) => (
            <div
              key={gesture.id}
              className={`px-3 py-2 rounded text-xs text-center transition-colors ${
                detectedGesture?.gesture.id === gesture.id
                  ? 'bg-neon-blue text-slate-950 font-bold'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {gesture.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
