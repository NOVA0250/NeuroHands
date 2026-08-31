import time
import urllib.request
from pathlib import Path

import av
import cv2
import mediapipe as mp
import numpy as np
import streamlit as st
from streamlit_webrtc import VideoProcessorBase, webrtc_streamer


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


@st.cache_resource
def load_model():

    if not MODEL_PATH.exists():
        urllib.request.urlretrieve(
            MODEL_URL,
            MODEL_PATH,
        )

    options = mp.tasks.vision.HandLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(
            model_asset_path=str(MODEL_PATH)
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


def gesture(hand):

    p = np.array(
        [[x.x, x.y, x.z] for x in hand],
        dtype=np.float32,
    )

    wrist = p[0]

    fingers = [
        (8, 5),
        (12, 9),
        (16, 13),
        (20, 17),
    ]

    extended = []

    for tip, joint in fingers:

        extended.append(
            np.linalg.norm(p[tip] - wrist)
            >
            np.linalg.norm(p[joint] - wrist)
        )

    index, middle, ring, pinky = extended

    if all(extended):
        return "OPEN PALM"

    if not any(extended):

        if p[4][1] < p[5][1] - 0.05:
            return "THUMBS UP"

        return "FIST"

    if index and middle and not ring and not pinky:
        return "PEACE"

    if index and not middle and not ring and not pinky:
        return "POINT"

    return "UNKNOWN"


class Processor(VideoProcessorBase):

    def __init__(self):

        self.model = load_model()

        self.frame = 0
        self.previous = time.perf_counter()

        self.fps = 0
        self.current_gesture = "NO HAND"

    def recv(self, frame):

        image = frame.to_ndarray(format="bgr24")

        rgb = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB,
        )

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb,
        )

        self.frame += 1

        result = self.model.detect_for_video(
            mp_image,
            self.frame * 33,
        )

        now = time.perf_counter()

        delta = now - self.previous

        if delta > 0:

            current_fps = 1 / delta

            self.fps = (
                0.9 * self.fps
                + 0.1 * current_fps
            )

        self.previous = now

        if result.hand_landmarks:

            hand = result.hand_landmarks[0]

            self.current_gesture = gesture(hand)

            height, width = image.shape[:2]

            points = [
                (
                    int(x.x * width),
                    int(x.y * height),
                )
                for x in hand
            ]

            connections = [
                (0, 1), (1, 2), (2, 3), (3, 4),
                (0, 5), (5, 6), (6, 7), (7, 8),
                (0, 9), (9, 10), (10, 11), (11, 12),
                (0, 13), (13, 14), (14, 15), (15, 16),
                (0, 17), (17, 18), (18, 19), (19, 20),
                (5, 9), (9, 13), (13, 17),
            ]

            for a, b in connections:

                cv2.line(
                    image,
                    points[a],
                    points[b],
                    (0, 220, 255),
                    2,
                )

            for x, y in points:

                cv2.circle(
                    image,
                    (x, y),
                    5,
                    (255, 255, 255),
                    -1,
                )

        else:

            self.current_gesture = "NO HAND"

        cv2.putText(
            image,
            self.current_gesture,
            (20, 45),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 220, 255),
            2,
        )

        cv2.putText(
            image,
            f"{self.fps:.0f} FPS",
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


st.title("🖐️ NeuroHands")

st.caption(
    "Real-time hand tracking and gesture intelligence"
)

left, right = st.columns([2.2, 1])

with left:

    webrtc_streamer(
        key="neurohands",
        video_processor_factory=Processor,
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


with right:

    st.subheader("Gestures")

    st.markdown(
        """
        🖐️ **Open Palm**  
        ✊ **Fist**  
        ✌️ **Peace**  
        ☝️ **Point**  
        👍 **Thumbs Up**
        """
    )

    st.divider()

    st.subheader("Pipeline")

    st.code(
        "Camera → WebRTC → MediaPipe\n"
        "→ 21 Landmarks → Gesture"
    )

    st.success("Ready")
