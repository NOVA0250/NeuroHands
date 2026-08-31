
import time
import urllib.request
from pathlib import Path

import av
import cv2
import mediapipe as mp
import numpy as np
import streamlit as st
from streamlit_webrtc import VideoProcessorBase, webrtc_streamer


# ============================================================
# CONFIG
# ============================================================

st.set_page_config(
    page_title="NeuroHands",
    page_icon="🖐️",
    layout="wide",
)

MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "hand_landmarker/hand_landmarker/float16/1/"
    "hand_landmarker.task"
)

MODEL_PATH = Path(__file__).parent / "hand_landmarker.task"


# ============================================================
# DOWNLOAD MODEL
# ============================================================

@st.cache_resource
def get_model():

    if not MODEL_PATH.exists():
        urllib.request.urlretrieve(
            MODEL_URL,
            MODEL_PATH,
        )

    return str(MODEL_PATH)


# ============================================================
# LOAD MEDIAPIPE
# ============================================================

@st.cache_resource
def create_landmarker():

    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(
            model_asset_path=get_model()
        ),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_hands=1,
        min_hand_detection_confidence=0.5,
        min_hand_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )

    return mp.tasks.vision.HandLandmarker.create_from_options(
        options
    )


# ============================================================
# GESTURE CLASSIFIER
# ============================================================

def classify_gesture(hand):

    points = np.array(
        [[p.x, p.y, p.z] for p in hand],
        dtype=np.float32,
    )

    wrist = points[0]

    fingers = [
        (8, 5),    # index
        (12, 9),   # middle
        (16, 13),  # ring
        (20, 17),  # pinky
    ]

    extended = []

    for tip, joint in fingers:

        tip_distance = np.linalg.norm(
            points[tip] - wrist
        )

        joint_distance = np.linalg.norm(
            points[joint] - wrist
        )

        extended.append(
            tip_distance > joint_distance
        )

    index, middle, ring, pinky = extended

    # Open palm
    if all(extended):
        return "OPEN PALM"

    # Fist / thumbs up
    if not any(extended):

        if points[4][1] < points[5][1] - 0.05:
            return "THUMBS UP"

        return "FIST"

    # Peace
    if index and middle and not ring and not pinky:
        return "PEACE"

    # Point
    if index and not middle and not ring and not pinky:
        return "POINT"

    return "UNKNOWN"


# ============================================================
# VIDEO PROCESSOR
# ============================================================

class NeuroHandsProcessor(VideoProcessorBase):

    def __init__(self):

        self.landmarker = create_landmarker()

        self.frame_id = 0
        self.last_time = time.perf_counter()

        self.fps = 0.0
        self.gesture = "NO HAND"

    def recv(self, frame):

        image = frame.to_ndarray(
            format="bgr24"
        )

        rgb = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB,
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb,
        )

        self.frame_id += 1

        result = self.landmarker.detect_for_video(
            mp_image,
            self.frame_id * 33,
        )

        # FPS
        now = time.perf_counter()

        delta = now - self.last_time

        if delta > 0:

            current_fps = 1.0 / delta

            self.fps = (
                0.9 * self.fps
                + 0.1 * current_fps
            )

        self.last_time = now

        # ====================================================
        # HAND DETECTED
        # ====================================================

        if result.hand_landmarks:

            hand = result.hand_landmarks[0]

            self.gesture = classify_gesture(
                hand
            )

            height, width = image.shape[:2]

            points = []

            for landmark in hand:

                x = int(
                    landmark.x * width
                )

                y = int(
                    landmark.y * height
                )

                points.append((x, y))

            connections = [
                (0, 1),
                (1, 2),
                (2, 3),
                (3, 4),

                (0, 5),
                (5, 6),
                (6, 7),
                (7, 8),

                (0, 9),
                (9, 10),
                (10, 11),
                (11, 12),

                (0, 13),
                (13, 14),
                (14, 15),
                (15, 16),

                (0, 17),
                (17, 18),
                (18, 19),
                (19, 20),

                (5, 9),
                (9, 13),
                (13, 17),
            ]

            # Draw skeleton
            for start, end in connections:

                cv2.line(
                    image,
                    points[start],
                    points[end],
                    (0, 220, 255),
                    2,
                )

            # Draw landmarks
            for x, y in points:

                cv2.circle(
                    image,
                    (x, y),
                    5,
                    (255, 255, 255),
                    -1,
                )

        else:

            self.gesture = "NO HAND"

        # ====================================================
        # OVERLAY
        # ====================================================

        cv2.putText(
            image,
            self.gesture,
            (20, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1.0,
            (0, 220, 255),
            2,
        )

        cv2.putText(
            image,
            f"FPS: {self.fps:.1f}",
            (20, 80),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (255, 255, 255),
            2,
        )

        return av.VideoFrame.from_ndarray(
            image,
            format="bgr24",
        )


# ============================================================
# APPLICATION
# ============================================================

st.title("🖐️ NeuroHands")

st.caption(
    "Real-Time Gesture Intelligence Platform"
)

left, right = st.columns(
    [2.2, 1]
)


# ============================================================
# CAMERA
# ============================================================

with left:

    webrtc_streamer(
        key="neurohands",

        video_processor_factory=(
            NeuroHandsProcessor
        ),

        media_stream_constraints={
            "video": True,
            "audio": False,
        },

        rtc_configuration={
            "iceServers": [
                {
                    "urls": [
                        "stun:stun.l.google.com:19302"
                    ]
                }
            ]
        },

        async_processing=True,
    )


# ============================================================
# GESTURES
# ============================================================

with right:

    st.subheader("Gesture Map")

    st.markdown(
        """
🖐️ **OPEN PALM** → Play / Pause

✊ **FIST** → Stop

✌️ **PEACE** → Next

☝️ **POINT** → Select

👍 **THUMBS UP** → Confirm
"""
    )

    st.divider()

    st.subheader("Pipeline")

    st.code(
        """Webcam
   ↓
WebRTC
   ↓
MediaPipe
   ↓
21 Landmarks
   ↓
Gesture Classifier
   ↓
Action"""
    )

    st.info(
        "The MediaPipe model downloads "
        "automatically on first run."
    )


# ============================================================
# FEATURES
# ============================================================

st.divider()

st.subheader("MVP Capabilities")

c1, c2, c3, c4 = st.columns(4)

c1.metric("Landmarks", "21")
c2.metric("Gestures", "5")
c3.metric("Inference", "Real-Time")
c4.metric("Deployment", "Streamlit")
```
