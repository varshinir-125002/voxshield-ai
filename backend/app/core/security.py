"""
VoxShield AI - Security Module
Input validation, payload limits, and error sanitization.
"""

from typing import Tuple
from fastapi import HTTPException
from app.core.config import settings
from app.core.logging import logger


ALLOWED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".ogg", ".flac", ".webm", ".m4a"}
ALLOWED_MIME_TYPES = {
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/mpeg",
    "audio/mp3",
    "audio/ogg",
    "audio/flac",
    "audio/webm",
    "audio/x-m4a",
    "audio/mp4",
    "application/octet-stream",
}


def validate_audio_file(filename: str, content_type: str, file_size_bytes: int) -> Tuple[bool, str]:
    """
    Validate audio file extension, content-type and size.
    """
    max_bytes = settings.max_audio_chunk_size_mb * 1024 * 1024
    if file_size_bytes > max_bytes:
        logger.warning(f"Rejected audio file: size {file_size_bytes} exceeds {max_bytes} bytes limit.")
        raise HTTPException(
            status_code=413,
            detail=f"Audio file size exceeds limit of {settings.max_audio_chunk_size_mb} MB.",
        )

    # Check extension
    lower_name = (filename or "").lower()
    has_valid_ext = any(lower_name.endswith(ext) for ext in ALLOWED_AUDIO_EXTENSIONS)
    if not has_valid_ext and not (content_type in ALLOWED_MIME_TYPES):
        logger.warning(f"Rejected audio file with invalid type: name={filename}, mime={content_type}")
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format. Supported: WAV, MP3, OGG, FLAC, WebM.",
        )

    return True, "Valid"


def sanitize_error_message(exc: Exception) -> str:
    """
    Never expose internal stack traces to the frontend.
    Returns a clean, user-safe error message.
    """
    logger.error(f"Internal error intercepted: {type(exc).__name__}: {str(exc)}", exc_info=True)
    return "An internal processing error occurred while analyzing the audio. Please try again."
