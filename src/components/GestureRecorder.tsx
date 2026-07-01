import React, { useState, useEffect, useRef } from 'react';
import { Hand, Gesture } from '../types';
import { playTone } from '../services/audio';

interface GestureRecorderProps {
  currentHands: Hand[];
  isRecording: boolean;
  recordingSamples: Hand[][];
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAddSample: (hands: Hand[]) => void;
  onSaveGesture: (gesture: Gesture) => void;
  recordingDuration: number;
  isActive?: boolean; // true when the Create tab is the active tab
}

export const GestureRecorder: React.FC<GestureRecorderProps> = ({
  currentHands,
  isRecording,
  recordingSamples,
  onStartRecording,
  onStopRecording,
  onAddSample,
  onSaveGesture,
  recordingDuration,
  isActive = true,
}) => {
  const [gestureName, setGestureName] = useState('');
  const [handedness, setHandedness] = useState<'Left' | 'Right' | 'Both'>('Both');
  const [recordingTime, setRecordingTime] = useState(0);

  const isVisible = useRef(isActive);
  useEffect(() => {
    isVisible.current = isActive;

    // If the tab becomes inactive mid-recording, stop so we don't keep
    // sampling a hand feed the user can no longer see/control.
    if (!isActive && isRecording) {
      onStopRecording();
    }
  }, [isActive, isRecording, onStopRecording]);

  useEffect(() => {
    if (!isRecording || !isVisible.current) return;

    const interval = setInterval(() => {
      setRecordingTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording || currentHands.length === 0 || !isVisible.current) return;

    const sampleInterval = setInterval(() => {
      if (!isVisible.current) return; // tab/visibility may have changed mid-interval
      onAddSample(currentHands);
      playTone(800, 50);
    }, 100);

    return () => clearInterval(sampleInterval);
  }, [isRecording, currentHands, onAddSample]);

  useEffect(() => {
    if (isRecording && recordingTime >= recordingDuration) {
      onStopRecording();
    }
  }, [recordingTime, recordingDuration, isRecording, onStopRecording]);

  const handleStartRecording = () => {
    if (!isVisible.current) return;
    if (currentHands.length === 0) {
      alert('Please show a hand to the camera first');
      return;
    }
    setRecordingTime(0);
    onStartRecording();
  };

  const handleSaveGesture = () => {
    if (!gestureName.trim()) {
      alert('Please enter a gesture name');
      return;
    }
    if (recordingSamples.length < 10) {
      alert('Need at least 10 samples. Record longer!');
      return;
    }

    const newGesture: Gesture = {
      id: `custom-${Date.now()}`,
      name: gestureName,
      landmarks: recordingSamples.map((hands) =>
        hands.length > 0 ? hands[0].landmarks : []
      ),
      handedness,
      isCustom: true,
      createdAt: Date.now(),
    };

    onSaveGesture(newGesture);
    setGestureName('');
    setRecordingTime(0);
  };

  return (
    <div className="glass rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-neon-blue">Create Custom Gesture</h2>

      {!isRecording && recordingSamples.length === 0 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Gesture Name
            </label>
            <input
              type="text"
              value={gestureName}
              onChange={(e) => setGestureName(e.target.value)}
              placeholder="e.g., My Cool Gesture"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-neon-blue text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Handedness
            </label>
            <select
              value={handedness}
              onChange={(e) => setHandedness(e.target.value as 'Left' | 'Right' | 'Both')}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:outline-none focus:border-neon-blue text-sm"
            >
              <option value="Left">Left Hand</option>
              <option value="Right">Right Hand</option>
              <option value="Both">Both Hands</option>
            </select>
          </div>

          <button
            onClick={handleStartRecording}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple text-slate-950 font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-neon-blue/50 transition-all text-lg"
          >
            🔴 Start Recording
          </button>
        </div>
      )}

      {isRecording && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-neon-blue animate-pulse">
              {recordingTime}s / {recordingDuration}s
            </div>
            <div className="text-sm text-slate-400 mt-2">
              {recordingSamples.length} samples collected
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-300">Perform your gesture now!</p>
          </div>

          <button
            onClick={onStopRecording}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors"
          >
            ⏹ Stop Recording
          </button>
        </div>
      )}

      {recordingSamples.length > 0 && !isRecording && (
        <div className="space-y-4">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="text-sm font-semibold mb-2">Recording Summary</div>
            <div className="text-xs text-slate-400 space-y-1">
              <div>Name: {gestureName || '(not set)'}</div>
              <div>Samples: {recordingSamples.length}</div>
              <div>Handedness: {handedness}</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setRecordingTime(0)}
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              ⮕️ Discard
            </button>
            <button
              onClick={handleSaveGesture}
              disabled={!gestureName.trim() || recordingSamples.length < 10}
              className="flex-1 bg-gradient-to-r from-neon-green to-neon-blue text-slate-950 font-bold py-2 rounded-lg hover:shadow-lg hover:shadow-neon-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save Gesture
            </button>
          </div>
        </div>
      )}
    </div>
  );
};