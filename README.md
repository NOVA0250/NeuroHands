# NeuroHands 🧠

**Production-quality hand tracking and gesture recognition web app**

NeuroHands is a browser-based computer vision application that enables real-time hand tracking and custom gesture recognition using only your webcam. No installation, no downloads, no setup required.

## ✨ Features

### 🎯 Real-Time Hand Tracking
- Detect up to 2 hands simultaneously
- Track all 21 hand landmarks
- Display FPS and confidence metrics
- Smooth, low-latency performance

### 🤚 Gesture Recognition
- **Pre-built Gestures**: Thumbs up, Peace, OK, and more
- **Custom Gestures**: Record and create your own gestures
- **Landmark-based Matching**: Advanced gesture detection algorithm
- **Configurable Thresholds**: Adjust sensitivity to your needs

### 🎨 Custom Effects
Assign visual effects to each gesture:
- 🔥 Fire
- ⚡ Lightning
- ✨ Particles
- 🎉 Confetti
- 💫 Neon
- 🌀 Ripple
- 🌌 Portal

### 🔊 Audio Support
- Upload custom sound files (.mp3, .wav)
- Play audio on gesture detection
- Per-gesture sound configuration

### 📚 Gesture Library
- View all saved gestures
- Edit, rename, and delete gestures
- Duplicate gestures as templates
- Customize effects and sounds

### ⚙️ Advanced Settings
- Confidence threshold adjustment
- Recording duration configuration
- Gesture cooldown timer
- Enable/disable effects and audio

## 🚀 Quick Start

1. **Visit**: https://neurohands.vercel.app (coming soon)
2. **Allow Camera Access**: Click "Allow" when prompted
3. **Start Using**: Detect gestures or create your own!

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Vision**: MediaPipe Tasks Vision (Hand Landmarker)
- **State Management**: Zustand
- **Build Tool**: Vite
- **Deployment**: Vercel (Frontend)

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── WebcamDisplay.tsx
│   ├── GestureDisplay.tsx
│   ├── GestureLibrary.tsx
│   ├── GestureRecorder.tsx
│   ├── EffectEditor.tsx
│   └── SettingsPanel.tsx
├── services/           # Core services
│   ├── mediapipe.ts    # Hand detection
│   ├── gestureRecognition.ts
│   ├── effectRenderer.ts
│   └── audio.ts
├── store/             # State management
│   └── appStore.ts
├── utils/             # Utilities
│   ├── drawing.ts
│   └── landmarks.ts
├── types.ts           # TypeScript types
├── App.tsx           # Main component
└── main.tsx          # Entry point
```

## 🎓 How to Create a Custom Gesture

1. Go to **✏️ Create** tab
2. Enter a gesture name
3. Select handedness (Left, Right, or Both)
4. Click **🔴 Start Recording**
5. Perform your gesture for the duration shown
6. Click **⏹ Stop Recording**
7. Click **💾 Save Gesture**

## 🎬 How to Customize Effects

1. Go to **📚 Library** tab
2. Select a gesture
3. Click **Edit Gesture**
4. In the effect editor:
   - Choose an effect type
   - Adjust intensity and duration
   - Change color
   - Upload a custom sound
5. Click **✨ Apply Effect**

## 🔧 Configuration Options

### Confidence Threshold
Adjust how strict gesture matching should be. Higher values require closer matches.

### Recording Duration
How long to record when creating a gesture (10-60 seconds).

### Gesture Cooldown
Minimum time between gesture detections (prevents duplicate triggers).

## 📊 Performance

- **Detection Speed**: ~30+ FPS on modern hardware
- **Latency**: <100ms from gesture to effect
- **Memory**: ~50MB typical usage
- **Offline Capable**: Yes (after initial load)

## 🔐 Privacy

- All processing happens **locally in your browser**
- No video/data is sent to servers
- Gestures stored in browser's localStorage
- Full offline support

## 🐛 Known Limitations

- Requires modern browser with WebGL support
- Works best in good lighting
- Hand must be visible to camera
- Maximum 2 hands per frame

## 🚀 Future Enhancements

- [ ] ML-based gesture classification
- [ ] Multi-hand gesture combinations
- [ ] Gesture export/import
- [ ] Cloud sync for gestures
- [ ] Mobile-optimized UI
- [ ] Hand pose estimation
- [ ] Gesture sequences

## 📄 License

MIT License - Feel free to use and modify!

## 🙏 Credits

Built with [MediaPipe](https://mediapipe.dev) by Google

---

**Made for AI/ML internship recruiters** 🎯

A showcase of:
- Computer vision implementation
- Real-time data processing
- Modern React development
- Full-stack thinking (frontend-first)
- UX design and polish
