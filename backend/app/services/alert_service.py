"""
VoxShield AI - Alert Service
Records high-threat security alerts and facilitates incident response.
"""

import uuid
from typing import Dict, Any, List
from app.database.database import save_alert, get_db_connection
from app.core.logging import logger


class AlertService:
    def __init__(self):
        self._recent_alerts: List[Dict[str, Any]] = []

    def trigger_alert(
        self,
        risk_score: float,
        threat_level: str,
        reason: str,
        session_id: str = "default_session",
    ) -> str:
        alert_id = f"alert-{uuid.uuid4().hex[:8]}"
        save_alert(
            alert_id=alert_id,
            session_id=session_id,
            risk_score=risk_score,
            threat_level=threat_level,
            reason=reason,
        )

        record = {
            "alert_id": alert_id,
            "session_id": session_id,
            "risk_score": risk_score,
            "threat_level": threat_level,
            "reason": reason,
        }
        self._recent_alerts.append(record)
        if len(self._recent_alerts) > 50:
            self._recent_alerts.pop(0)

        logger.warning(f"SECURITY ALERT [{threat_level}] ({alert_id}): {reason} (Risk: {risk_score})")
        return alert_id

    def get_recent_alerts(self, limit: int = 20) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, session_id, risk_score, threat_level, reason, created_at FROM alerts ORDER BY created_at DESC LIMIT ?",
                (limit,),
            )
            rows = cursor.fetchall()
            return [
                {
                    "alert_id": r["id"],
                    "session_id": r["session_id"],
                    "risk_score": r["risk_score"],
                    "threat_level": r["threat_level"],
                    "reason": r["reason"],
                    "created_at": r["created_at"],
                }
                for r in rows
            ]
        except Exception as e:
            logger.error(f"Error fetching alerts: {e}")
            return self._recent_alerts[-limit:]
        finally:
            conn.close()


alert_service = AlertService()
