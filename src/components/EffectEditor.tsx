import React, { useState } from 'react';
import { Gesture, GestureEffect } from '../types';
import EffectRenderer from '../services/effectRenderer';

interface EffectEditorProps {
  gesture: Gesture | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onUpdateGesture: (id: string, updates: Partial<Gesture>) => void;
}

const DEFAULT_EFFECTS: GestureEffect[] = [
  { id: 'fire', name: 'Fire', type: 'fire', color: '#ff6b00', intensity: 1, duration: 500 },
  { id: 'lightning', name: 'Lightning', type: 'lightning', color: '#00f7ff', intensity: 1, duration: 400 },
  { id: 'particles', name: 'Particles', type: 'particles', color: 'rgb(34, 197, 94)', intensity: 1, duration: 600 },
  { id: 'confetti', name: 'Confetti', type: 'confetti', color: '#d946ef', intensity: 1, duration: 800 },
  { id: 'neon', name: 'Neon', type: 'neon', color: '#00f7ff', intensity: 1, duration: 500 },
  { id: 'ripple', name: 'Ripple', type: 'ripple', color: '#ec4899', intensity: 1, duration: 600 },
  { id: 'portal', name: 'Portal', type: 'portal', color: '#d946ef', intensity: 1, duration: 1000 },
];

export const EffectEditor: React.FC<EffectEditorProps> = ({
  gesture,
  canvasRef,
  onUpdateGesture,
}) => {
  const [selectedEffect, setSelectedEffect] = useState<GestureEffect | null>(
    gesture?.effect || null
  );
  const [soundUrl, setSoundUrl] = useState(gesture?.soundUrl || '');

  const handleSelectEffect = (effect: GestureEffect) => {
    setSelectedEffect(effect);
    if (gesture && canvasRef.current) {
      const renderer = new EffectRenderer(canvasRef.current);
      renderer.renderEffect(effect, canvasRef.current.width / 2, canvasRef.current.height / 2);
    }
  };

  const handleApplyEffect = () => {
    if (gesture && selectedEffect) {
      onUpdateGesture(gesture.id, { effect: selectedEffect });
    }
  };

  const handleSoundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setSoundUrl(url);
        if (gesture) {
          onUpdateGesture(gesture.id, { soundUrl: url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!gesture) {
    return (
      <div className="glass rounded-lg p-6 text-center text-slate-400">
        <p>Select a gesture to edit its effects</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-bold text-neon-blue">Effect Editor</h2>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Select Effect</h3>
        <div className="grid grid-cols-2 gap-2">
          {DEFAULT_EFFECTS.map((effect) => (
            <button
              key={effect.id}
              onClick={() => handleSelectEffect(effect)}
              className={`px-3 py-2 rounded text-sm font-semibold transition-all ${
                selectedEffect?.id === effect.id
                  ? 'bg-neon-blue text-slate-950 shadow-lg shadow-neon-blue/50'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {effect.name}
            </button>
          ))}
        </div>
      </div>

      {selectedEffect && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Intensity: {selectedEffect.intensity.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={selectedEffect.intensity}
              onChange={(e) =>
                setSelectedEffect({
                  ...selectedEffect,
                  intensity: parseFloat(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Duration: {selectedEffect.duration}ms
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={selectedEffect.duration}
              onChange={(e) =>
                setSelectedEffect({
                  ...selectedEffect,
                  duration: parseInt(e.target.value),
                })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Color
            </label>
            <input
              type="color"
              value={selectedEffect.color}
              onChange={(e) =>
                setSelectedEffect({
                  ...selectedEffect,
                  color: e.target.value,
                })
              }
              className="w-full h-10 rounded cursor-pointer"
            />
          </div>

          <button
            onClick={handleApplyEffect}
            className="w-full bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold py-2 rounded-lg hover:shadow-lg hover:shadow-neon-purple/50 transition-all"
          >
            ✨ Apply Effect
          </button>
        </div>
      )}

      <div className="border-t border-slate-700 pt-6">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Custom Sound</h3>
        <label className="block">
          <span className="sr-only">Upload sound</span>
          <input
            type="file"
            accept="audio/*"
            onChange={handleSoundUpload}
            className="block w-full text-sm text-slate-400
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-neon-blue file:text-slate-950
              hover:file:bg-neon-blue/80
              cursor-pointer"
          />
        </label>
        {soundUrl && (
          <div className="mt-2 text-xs text-slate-400">✓ Sound uploaded</div>
        )}
      </div>
    </div>
  );
};
