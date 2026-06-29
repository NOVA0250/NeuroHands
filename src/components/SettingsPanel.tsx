import React, { useState } from 'react';
import { AppConfig } from '../types';

interface SettingsPanelProps {
  config: AppConfig;
  onConfigChange: (config: Partial<AppConfig>) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  config,
  onConfigChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-700 hover:bg-slate-600 rounded-lg p-4 font-semibold flex items-center justify-between transition-colors"
      >
        <span>⚙️ Settings</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="glass rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Confidence Threshold: {(config.confidenceThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.confidenceThreshold}
              onChange={(e) =>
                onConfigChange({ confidenceThreshold: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
            <p className="text-xs text-slate-400 mt-2">
              Higher = stricter gesture matching
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Recording Duration: {config.recordingDuration}s
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={config.recordingDuration}
              onChange={(e) =>
                onConfigChange({ recordingDuration: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Gesture Cooldown: {config.cooldownTime}ms
            </label>
            <input
              type="range"
              min="500"
              max="5000"
              step="500"
              value={config.cooldownTime}
              onChange={(e) =>
                onConfigChange({ cooldownTime: parseInt(e.target.value) })
              }
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSound}
                onChange={(e) => onConfigChange({ enableSound: e.target.checked })}
                className="w-4 h-4 rounded accent-neon-blue"
              />
              <span className="text-sm font-semibold">Enable Sound</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableEffects}
                onChange={(e) => onConfigChange({ enableEffects: e.target.checked })}
                className="w-4 h-4 rounded accent-neon-blue"
              />
              <span className="text-sm font-semibold">Enable Effects</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
