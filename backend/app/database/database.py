"""
VoxShield AI - Database Module
Modular SQLite storage for registered speakers, analysis sessions, and security alerts.
"""

import sqlite3
import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from app.core.config import settings
from app.core.logging import logger


DB_PATH = Path("voxshield.db")


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables if they do not exist."""
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Table: Registered Speakers
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS speakers (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                embedding TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table: Analysis Sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                speaker_id TEXT,
                start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP,
                peak_risk_score REAL DEFAULT 0.0,
                threat_level TEXT DEFAULT 'SAFE'
            )
        """)

        # Table: Security Alerts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                session_id TEXT,
                risk_score REAL NOT NULL,
                threat_level TEXT NOT NULL,
                reason TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    finally:
        conn.close()


def save_speaker(speaker_id: str, name: str, embedding: List[float]) -> bool:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT OR REPLACE INTO speakers (id, name, embedding) VALUES (?, ?, ?)",
            (speaker_id, name, json.dumps(embedding)),
        )
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error saving speaker: {e}")
        return False
    finally:
        conn.close()


def get_speaker(speaker_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, embedding, created_at FROM speakers WHERE id = ?", (speaker_id,))
        row = cursor.fetchone()
        if row:
            return {
                "id": row["id"],
                "name": row["name"],
                "embedding": json.loads(row["embedding"]),
                "created_at": row["created_at"],
            }
        return None
    finally:
        conn.close()


def get_all_speakers() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, name, created_at FROM speakers ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [{"id": r["id"], "name": r["name"], "created_at": r["created_at"]} for r in rows]
    finally:
        conn.close()


def save_alert(alert_id: str, risk_score: float, threat_level: str, reason: str, session_id: Optional[str] = None) -> bool:
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO alerts (id, session_id, risk_score, threat_level, reason) VALUES (?, ?, ?, ?, ?)",
            (alert_id, session_id, risk_score, threat_level, reason),
        )
        conn.commit()
        return True
    except Exception as e:
        logger.error(f"Error saving alert: {e}")
        return False
    finally:
        conn.close()
