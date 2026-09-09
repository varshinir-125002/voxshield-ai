"""
VoxShield AI - Speaker Verification
Independent identity verification system.
Distinguishes between voice authenticity (is it synthetic?) and identity (is it the authorized person?).
"""

from typing import List, Dict, Any, Optional
import numpy as np
import librosa
from app.audio.features import extract_mfcc
from app.core.logging import logger


class SpeakerVerifier:
    """
    Extracts acoustic vocal tract embeddings and compares them using cosine similarity.
    Threshold for match: 0.75 (prototype default).
    """

    def __init__(self, threshold: float = 0.75):
        self.threshold = threshold
        self.embedding_dim = 64
        logger.info(f"Initialized SpeakerVerifier (threshold={self.threshold})")

    def create_embedding(self, audio: np.ndarray, sr: int = 16000) -> List[float]:
        """
        Creates a 64-dimensional acoustic speaker embedding from MFCCs, spectral moments,
        and delta coefficients representing vocal tract geometry.
        """
        if audio is None or len(audio) < 1024:
            return [0.0] * self.embedding_dim

        try:
            # 1. MFCCs (coefficients 1 to 20, excluding coefficient 0 which represents energy/gain)
            mfcc = extract_mfcc(audio, sr=sr, n_mfcc=21)[1:]  # 20 coefficients
            # Cepstral Mean Normalization across time frames
            mfcc_centered = mfcc - np.mean(mfcc, axis=1, keepdims=True)
            mfcc_mean = np.mean(mfcc_centered, axis=1)  # 20
            mfcc_std = np.std(mfcc, axis=1)            # 20

            # 2. Delta MFCCs (temporal vocal tract dynamics)
            delta = librosa.feature.delta(mfcc)
            delta_mean = np.mean(delta, axis=1)[:12]  # 12

            # 3. Spectral contrast and shape
            contrast = np.mean(librosa.feature.spectral_contrast(y=audio, sr=sr), axis=1)  # 7 bands
            centroid = np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr))
            rolloff = np.mean(librosa.feature.spectral_rolloff(y=audio, sr=sr))
            zcr = np.mean(librosa.feature.zero_crossing_rate(y=audio))

            spec_shape = np.array([
                np.log1p(centroid) / 10.0,
                np.log1p(rolloff) / 10.0,
                zcr * 5.0,
                float(contrast[0] if len(contrast) > 0 else 0.0) / 20.0,
                float(contrast[1] if len(contrast) > 1 else 0.0) / 20.0,
            ])

            # Concatenate features -> 20 + 20 + 12 + 7 + 5 = 64 dimensions
            raw_vector = np.concatenate([mfcc_mean, mfcc_std, delta_mean, contrast, spec_shape])
            if len(raw_vector) < self.embedding_dim:
                raw_vector = np.pad(raw_vector, (0, self.embedding_dim - len(raw_vector)))
            else:
                raw_vector = raw_vector[:self.embedding_dim]

            # Zero-mean the vector before L2 normalization for robust angular separation
            raw_vector = raw_vector - np.mean(raw_vector)
            norm = np.linalg.norm(raw_vector)
            if norm > 1e-6:
                normalized = raw_vector / norm
            else:
                normalized = raw_vector

            return [float(round(v, 6)) for v in normalized]
        except Exception as e:
            logger.error(f"Error creating speaker embedding: {e}")
            return [0.0] * self.embedding_dim

    def compare(
        self,
        current_embedding: List[float],
        registered_embedding: Optional[List[float]],
    ) -> Dict[str, Any]:
        """
        Compares current voice embedding against registered speaker profile using Cosine Similarity.
        """
        if not registered_embedding or len(registered_embedding) == 0:
            return {
                "match": False,
                "similarity": 0.0,
                "threshold": self.threshold,
                "registered_speaker": None,
                "status_message": "Speaker verification unavailable — no registered speaker",
            }

        vec_a = np.array(current_embedding, dtype=np.float32)
        vec_b = np.array(registered_embedding, dtype=np.float32)

        norm_a = np.linalg.norm(vec_a)
        norm_b = np.linalg.norm(vec_b)

        if norm_a < 1e-6 or norm_b < 1e-6:
            similarity = 0.0
        else:
            similarity = float(np.dot(vec_a, vec_b) / (norm_a * norm_b))
            similarity = np.clip(similarity, 0.0, 1.0)

        match = bool(similarity >= self.threshold)

        return {
            "match": match,
            "similarity": round(similarity, 2),
            "threshold": self.threshold,
            "status_message": "Speaker matched" if match else "Speaker mismatch detected",
        }


speaker_verifier = SpeakerVerifier()
