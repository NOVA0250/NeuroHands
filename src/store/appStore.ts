import { create } from 'zustand';
import { Gesture, GestureEffect, AppConfig, Hand } from '../types';

interface AppState {
  gestures: Gesture[];
  customGestures: Gesture[];
  currentHands: Hand[];
  fps: number;
  isRecording: boolean;
  recordingSamples: Hand[][];
  config: AppConfig;
  selectedGesture: Gesture | null;
  detectedGesture: { gesture: Gesture; confidence: number } | null;
  lastDetectionTime: number;
  
  // Gesture management
  addGesture: (gesture: Gesture) => void;
  removeGesture: (id: string) => void;
  updateGesture: (id: string, gesture: Partial<Gesture>) => void;
  duplicateGesture: (id: string) => void;
  
  // Recording
  startRecording: () => void;
  stopRecording: () => void;
  addSample: (hands: Hand[]) => void;
  clearRecording: () => void;
  
  // State updates
  setCurrentHands: (hands: Hand[]) => void;
  setFps: (fps: number) => void;
  setConfig: (config: Partial<AppConfig>) => void;
  setDetectedGesture: (gesture: { gesture: Gesture; confidence: number } | null) => void;
  
  // Persistence
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const defaultConfig: AppConfig = {
  confidenceThreshold: 0.7,
  enableSound: true,
  enableEffects: true,
  recordingDuration: 30,
  cooldownTime: 1000,
};

const defaultGestures: Gesture[] = [
  {
    id: 'thumb-up',
    name: '👍 Thumbs Up',
    landmarks: [],
    handedness: 'Both',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'peace',
    name: '✌ Peace',
    landmarks: [],
    handedness: 'Both',
    isCustom: false,
    createdAt: Date.now(),
  },
  {
    id: 'ok',
    name: '👌 OK',
    landmarks: [],
    handedness: 'Both',
    isCustom: false,
    createdAt: Date.now(),
  },
];

export const useStore = create<AppState>((set, get) => ({
  gestures: defaultGestures,
  customGestures: [],
  currentHands: [],
  fps: 0,
  isRecording: false,
  recordingSamples: [],
  config: defaultConfig,
  selectedGesture: null,
  detectedGesture: null,
  lastDetectionTime: 0,

  addGesture: (gesture) =>
    set((state) => ({
      customGestures: [...state.customGestures, gesture],
    })),

  removeGesture: (id) =>
    set((state) => ({
      customGestures: state.customGestures.filter((g) => g.id !== id),
    })),

  updateGesture: (id, updates) =>
    set((state) => ({
      customGestures: state.customGestures.map((g) =>
        g.id === id ? { ...g, ...updates } : g
      ),
    })),

  duplicateGesture: (id) =>
    set((state) => {
      const gesture = state.customGestures.find((g) => g.id === id);
      if (!gesture) return state;
      const duplicate = {
        ...gesture,
        id: `${gesture.id}-${Date.now()}`,
        name: `${gesture.name} (Copy)`,
        createdAt: Date.now(),
      };
      return {
        customGestures: [...state.customGestures, duplicate],
      };
    }),

  startRecording: () =>
    set({
      isRecording: true,
      recordingSamples: [],
    }),

  stopRecording: () =>
    set({
      isRecording: false,
    }),

  addSample: (hands) =>
    set((state) => ({
      recordingSamples: [...state.recordingSamples, hands],
    })),

  clearRecording: () =>
    set({
      recordingSamples: [],
    }),

  setCurrentHands: (hands) =>
    set({
      currentHands: hands,
    }),

  setFps: (fps) =>
    set({
      fps: Math.round(fps),
    }),

  setConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),

  setDetectedGesture: (gesture) =>
    set({
      detectedGesture: gesture,
      lastDetectionTime: gesture ? Date.now() : 0,
    }),

  loadFromStorage: () => {
    const stored = localStorage.getItem('neurohands-state');
    if (stored) {
      const { customGestures, config } = JSON.parse(stored);
      set({ customGestures, config });
    }
  },

  saveToStorage: () => {
    const state = get();
    localStorage.setItem(
      'neurohands-state',
      JSON.stringify({
        customGestures: state.customGestures,
        config: state.config,
      })
    );
  },
}));
