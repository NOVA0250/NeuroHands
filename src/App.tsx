import React, { useEffect, useRef, useState } from 'react';
import { useStore } from './store/appStore';
import { initializeHandLandmarker, detectHands, isHandLandmarkerReady } from './services/mediapipe';
import { matchGestures } from './services/gestureRecognition';
import { WebcamDisplay } from './components/WebcamDisplay';
import { GestureDisplay } from './components/GestureDisplay';
import { GestureLibrary } from './components/GestureLibrary';
import { SettingsPanel } from './components/SettingsPanel';
import { GestureRecorder } from './components/GestureRecorder';
import { EffectEditor } from './components/EffectEditor';
import EffectRenderer from './services/effectRenderer';
import { playSound } from './services/audio';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'create' | 'library' | 'settings'>('home');

  const store = useStore();
  const allGestures = [...store.gestures, ...store.customGestures];
  const latestStore = useRef(store);
  const latestGestures = useRef(allGestures);

  useEffect(() => {
    latestStore.current = store;
    latestGestures.current = allGestures;
   }, [store, allGestures]);
  // Live tab specifically (controls GestureDisplay visibility)
  const isHomeVisible = activeTab === 'home';
  // Webcam preview needs to be visible on both Live and Create tabs
  const isWebcamVisible = activeTab === 'home' || activeTab === 'create';
  // Detection (hand tracking) is needed on both Live and Create tabs,
  // since GestureRecorder relies on store.currentHands being populated.
  const isDetectionNeeded = activeTab === 'home' || activeTab === 'create';

  // Initialize MediaPipe
  useEffect(() => {
    const init = async () => {
      try {
        await initializeHandLandmarker();
        store.loadFromStorage();
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Setup webcam
  useEffect(() => {
    const setupWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Failed to access webcam:', error);
        alert('Camera access denied. Please allow camera access to use NeuroHands.');
      }
    };
    setupWebcam();
  }, []);

  // Detection loop
useEffect(() => {
  if (!isDetectionNeeded) {
    if (detectionIntervalRef.current) {
      cancelAnimationFrame(detectionIntervalRef.current);
      detectionIntervalRef.current = undefined;
    }
    return;
  }

  let cancelled = false;

  const startDetection = async () => {
    // Wait for MediaPipe
    while (!isHandLandmarkerReady()) {
      if (cancelled) return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Wait for video
    while (
      !videoRef.current ||
      videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
      videoRef.current.videoWidth === 0
    ) {
      if (cancelled) return;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;

    const detect = () => {
  if (cancelled) return;

  const video = videoRef.current;

  if (video) {
    const result = detectHands(video);

    if (result) {
      latestStore.current.setCurrentHands(result.hands);
      latestStore.current.setFps(result.fps);

      if (result.hands.length > 0) {
        const matches = matchGestures(
          result.hands,
          latestGestures.current,
          latestStore.current.config.confidenceThreshold
        );

        if (matches.length > 0) {
          const match = matches[0];

          const timeSinceLastDetection =
            Date.now() - latestStore.current.lastDetectionTime;

          if (
            timeSinceLastDetection >
            latestStore.current.config.cooldownTime
          ) {
            latestStore.current.setDetectedGesture(match);

            if (
              latestStore.current.config.enableSound &&
              match.gesture.soundUrl
            ) {
              playSound(match.gesture.soundUrl);
            }

            if (
              latestStore.current.config.enableEffects &&
              match.gesture.effect &&
              effectCanvasRef.current
            ) {
              const renderer = new EffectRenderer(effectCanvasRef.current);

              const hand = result.hands[match.handIndex];

              renderer.renderEffect(
                match.gesture.effect,
                hand.landmarks[9].x *
                  effectCanvasRef.current.width,
                hand.landmarks[9].y *
                  effectCanvasRef.current.height
              );
            }
          }
        }
      }
    } else {
      latestStore.current.setCurrentHands([]);
    }
  }

  detectionIntervalRef.current =
    requestAnimationFrame(detect);
};

detectionIntervalRef.current =
  requestAnimationFrame(detect);

}; // closes startDetection()

startDetection();

   return () => {
    cancelled = true;

    if (detectionIntervalRef.current) {
      cancelAnimationFrame(detectionIntervalRef.current);
      detectionIntervalRef.current = undefined;
    }
  };
}, [isDetectionNeeded]);

  // Save to storage on changes
  useEffect(() => {
    store.saveToStorage();
  }, [store.customGestures, store.config]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-3xl font-black bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
            🧠 NeuroHands
          </h1>
          <div className="text-sm text-slate-400">
            {store.currentHands.length > 0 && (
              <span>
                {store.currentHands.length} hand{store.currentHands.length !== 1 ? 's' : ''} detected
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'home' as const, label: '🎥 Live' },
            { id: 'create' as const, label: '✏️ Create' },
            { id: 'library' as const, label: '📚 Library' },
            { id: 'settings' as const, label: '⚙️ Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-neon-blue text-slate-950 shadow-lg shadow-neon-blue/50'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* WebcamDisplay stays mounted across tab switches. Visible (block)
                on both Live and Create tabs so users can see their hand while
                recording gestures; hidden on Library/Settings. isVisible controls
                whether the camera/draw loop runs (matches detection needs). */}
            <div className={isWebcamVisible ? 'block space-y-8' : 'hidden'}>
              <WebcamDisplay
                videoRef={videoRef}
                canvasRef={canvasRef}
                hands={store.currentHands}
                fps={store.fps}
                isLoading={isLoading}
                isVisible={isDetectionNeeded}
              />
              {isHomeVisible && (
                <GestureDisplay
                  detectedGesture={store.detectedGesture}
                  allGestures={allGestures}
                />
              )}
            </div>

            {activeTab === 'create' && (
              <GestureRecorder
                currentHands={store.currentHands}
                isRecording={store.isRecording}
                recordingSamples={store.recordingSamples}
                onStartRecording={store.startRecording}
                onStopRecording={store.stopRecording}
                onAddSample={store.addSample}
                onSaveGesture={store.addGesture}
                recordingDuration={store.config.recordingDuration}
                isActive={activeTab === 'create'}
              />
            )}

            {activeTab === 'library' && (
              <GestureLibrary
                gestures={store.customGestures}
                onSelectGesture={(g) => {
                  setActiveTab('settings');
                }}
                onDeleteGesture={store.removeGesture}
                onDuplicateGesture={store.duplicateGesture}
                onUpdateGesture={store.updateGesture}
              />
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8">
                <SettingsPanel
                  config={store.config}
                  onConfigChange={store.setConfig}
                />

                <div className="glass rounded-lg p-6">
                  <h3 className="text-lg font-bold text-neon-blue mb-4">About</h3>
                  <div className="text-sm text-slate-400 space-y-2">
                    <p>NeuroHands - Real-time hand tracking & gesture recognition</p>
                    <p>Powered by MediaPipe Tasks Vision</p>
                    <p className="pt-2 text-xs">No installation required. All processing happens in your browser.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {activeTab === 'home' && (
              <>
                <GestureDisplay
                  detectedGesture={store.detectedGesture}
                  allGestures={allGestures}
                />
                <div className="glass rounded-lg p-6">
                  <h3 className="font-bold text-neon-blue mb-3">Quick Stats</h3>
                  <div className="text-sm space-y-2 text-slate-400">
                    <div>Total Gestures: {allGestures.length}</div>
                    <div>Custom: {store.customGestures.length}</div>
                    <div>Confidence: {(store.config.confidenceThreshold * 100).toFixed(0)}%</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'create' && (
              <EffectEditor
                gesture={store.selectedGesture}
                canvasRef={effectCanvasRef}
                onUpdateGesture={store.updateGesture}
              />
            )}

            {activeTab === 'library' && (
              <div className="glass rounded-lg p-6">
                <h3 className="font-bold text-neon-blue mb-3">Gesture Info</h3>
                <div className="text-sm text-slate-400">
                  <p>Manage your custom gestures here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Effect Canvas */}
      <canvas
        ref={effectCanvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default App;