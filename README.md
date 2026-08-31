NeuroHands
Real-Time Gesture Intelligence Platform.

Features
Real-time webcam processing
MediaPipe hand landmark detection
21 hand landmarks
Gesture recognition
Open Palm
Fist
Peace
Point
Thumbs Up
FPS monitoring
WebRTC video streaming
Streamlit deployment
Local Setup
Create a virtual environment:

python -m venv .venv

Windows:

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run:

streamlit run app.py

Open the URL shown by Streamlit and allow camera access.

Deployment
Upload the project to GitHub.

Then deploy app.py using Streamlit Community Cloud.

The MediaPipe model downloads automatically when the application starts.

Architecture
Webcam
→ WebRTC
→ OpenCV
→ MediaPipe
→ 21 landmarks
→ Gesture classifier
→ Action

Gestures
OPEN PALM → Play / Pause

FIST → Stop

PEACE → Next

POINT → Select

THUMBS UP → Confirm
