from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional
import numpy as np


class ModelAdapter(ABC):
    """
    Abstract Base Class for Football Computer Vision & Analytics Models.
    Allows seamless switching between the existing Roboflow Sports pipeline
    and any custom user-provided ML model.
    """

    @abstractmethod
    def initialize(self, config: Optional[Dict[str, Any]] = None) -> None:
        """
        Initialize model weights, device (MPS/CUDA/CPU), and processors.
        """
        pass

    @abstractmethod
    def predict(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Run inference on a single video frame.
        Returns raw detections (boxes, classes, confidence).
        """
        pass

    @abstractmethod
    def analyze_frame(
        self,
        frame: np.ndarray,
        frame_idx: int,
        fps: float
    ) -> Dict[str, Any]:
        """
        Complete analysis for a single frame: detections, tracking, team classification,
        pitch keypoints, and radar coordinates.
        """
        pass

    @abstractmethod
    def analyze_video(
        self,
        source_video_path: str,
        target_video_path: Optional[str] = None,
        radar_video_path: Optional[str] = None,
        max_frames: Optional[int] = None,
        progress_callback: Optional[Callable[[str, int, Dict[str, Any]], None]] = None,
        mode: str = "RADAR"
    ) -> Dict[str, Any]:
        """
        Execute video analysis end-to-end, periodically invoking progress_callback(stage, progress_percent, metadata).
        Returns aggregated video analysis results.
        """
        pass
