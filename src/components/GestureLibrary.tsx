import React, { useState } from 'react';
import { Gesture, GestureEffect } from '../types';
import { playSound } from '../services/audio';

interface GestureLibraryProps {
  gestures: Gesture[];
  onSelectGesture: (gesture: Gesture) => void;
  onDeleteGesture: (id: string) => void;
  onDuplicateGesture: (id: string) => void;
  onUpdateGesture: (id: string, updates: Partial<Gesture>) => void;
}

export const GestureLibrary: React.FC<GestureLibraryProps> = ({
  gestures,
  onSelectGesture,
  onDeleteGesture,
  onDuplicateGesture,
  onUpdateGesture,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (gesture: Gesture) => {
    setEditingId(gesture.id);
    setEditName(gesture.name);
  };

  const handleSaveName = (id: string) => {
    if (editName.trim()) {
      onUpdateGesture(id, { name: editName });
    }
    setEditingId(null);
  };

  if (gestures.length === 0) {
    return (
      <div className="glass rounded-lg p-6 text-center text-slate-400">
        <p>No gestures yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {gestures.map((gesture) => (
        <div key={gesture.id} className="glass rounded-lg overflow-hidden">
          <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors">
            <button
              onClick={() => setExpandedId(expandedId === gesture.id ? null : gesture.id)}
              className="flex-1 text-left"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{gesture.name.split(' ')[0]}</span>
                <div>
                  <div className="font-semibold">{gesture.name}</div>
                  <div className="text-xs text-slate-400">
                    {gesture.isCustom ? '✎ Custom' : 'Built-in'} • {gesture.landmarks.length} samples
                  </div>
                </div>
              </div>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => onDuplicateGesture(gesture.id)}
                className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded transition-colors"
                title="Duplicate"
              >
                📋
              </button>
              <button
                onClick={() => onDeleteGesture(gesture.id)}
                className="px-2 py-1 text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded transition-colors"
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>

          {expandedId === gesture.id && (
            <div className="border-t border-slate-700 p-4 bg-slate-800/30 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-300 block mb-2">Name</label>
                {editingId === gesture.id ? (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm focus:outline-none focus:border-neon-blue"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveName(gesture.id)}
                      className="px-3 py-1 bg-neon-blue text-slate-950 rounded text-sm font-semibold hover:bg-neon-blue/80 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(gesture)}
                    className="w-full text-left bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 transition-colors"
                  >
                    {gesture.name} <span className="float-right text-xs">✎</span>
                  </button>
                )}
              </div>

              {gesture.effect && (
                <div>
                  <label className="text-sm font-semibold text-slate-300 block mb-2">Effect</label>
                  <div className="bg-slate-700 rounded px-3 py-2">
                    <div className="text-sm font-mono">{gesture.effect.type}</div>
                    <div className="text-xs text-slate-400 mt-1">Intensity: {gesture.effect.intensity}/1</div>
                  </div>
                </div>
              )}

              {gesture.soundUrl && (
                <div>
                  <label className="text-sm font-semibold text-slate-300 block mb-2">Sound</label>
                  <button
                    onClick={() => playSound(gesture.soundUrl!)}
                    className="w-full bg-slate-700 hover:bg-slate-600 rounded px-3 py-2 text-sm transition-colors"
                  >
                    🔊 Play Sound
                  </button>
                </div>
              )}

              <button
                onClick={() => onSelectGesture(gesture)}
                className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 font-bold py-2 rounded hover:shadow-lg hover:shadow-neon-blue/50 transition-all"
              >
                Edit Gesture
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
