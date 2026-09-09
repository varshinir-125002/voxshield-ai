"""
VoxShield AI - Transcript Security & Social Engineering Analyzer
Detects scam patterns, credential extortion, impersonation, and pressure tactics.
"""

import re
from typing import Dict, Any, List


class TranscriptAnalyzer:
    """
    Contextual NLP pattern analyzer for social engineering and voice fraud signals.
    """

    PATTERNS = {
        "OTP_REQUEST": [
            r"\b(otp|one[-\s]time[-\s]password|verification\s+code|security\s+code|6[-\s]digit\s+code|authentication\s+code)\b",
            r"\b(send|share|tell|read|give)\s+(me\s+)?(the\s+)?(otp|code|pin)\b",
            r"\bcode\s+(you\s+just\s+)?received\b",
        ],
        "PASSWORD_REQUEST": [
            r"\b(password|passcode|secret\s+pin|login\s+credentials|master\s+password|credential)\b",
            r"\b(enter|share|reset|provide)\s+(your\s+)?password\b",
        ],
        "BANKING_REQUEST": [
            r"\b(credit\s+card|debit\s+card|cvv|card\s+number|account\s+number|bank\s+account|routing\s+number|expiry\s+date)\b",
            r"\b(verify|update)\s+your\s+(bank|account|card)\b",
            r"\bnet\s+banking\b",
        ],
        "MONEY_TRANSFER": [
            r"\b(wire\s+transfer|send\s+money|transfer\s+funds|immediate\s+payment|gift\s+card|crypto|bitcoin|upi|gpay|paytm)\b",
            r"\b(pay|transfer)\s+(the\s+)?(amount|fees|penalty|fine)\b",
        ],
        "URGENT_REQUEST": [
            r"\b(immediately|right\s+now|urgent|urgently|within\s+\d+\s+minutes|asap|hurry|time\s+is\s+running\s+out|quick)\b",
            r"\bdo\s+not\s+delay\b",
            r"\bact\s+fast\b",
        ],
        "THREAT": [
            r"\b(police|arrest|warrant|lawsuit|legal\s+action|court|customs|fbi|cbi|tax\s+penalty)\b",
            r"\b(account\s+will\s+be\s+suspended|blocked\s+permanently|frozen|cancelled)\b",
            r"\byou\s+will\s+be\s+prosecuted\b",
        ],
        "CONFIDENTIAL_INFORMATION": [
            r"\b(ssn|social\s+security|aadhar|pan\s+card|national\s+id|passport\s+number|date\s+of\s+birth|mother'?s\s+maiden\s+name)\b",
            r"\bconfidential\s+(data|details)\b",
        ],
        "IMPERSONATION": [
            r"\bcalling\s+from\s+(the\s+)?(bank|fraud\s+department|security\s+division|headquarters|police|microsoft|apple|support)\b",
            r"\bi\s+am\s+(your\s+)?(manager|officer|supervisor|executive|director)\b",
            r"\bofficial\s+representative\b",
        ],
        "BYPASS_VERIFICATION": [
            r"\b(don'?t\s+hang\s+up|do\s+not\s+call\s+back|keep\s+this\s+(secret|between\s+us)|skip\s+verification|bypass)\b",
            r"\bdo\s+not\s+tell\s+anyone\b",
            r"\bline\s+is\s+secured\b",
        ],
    }

    # Threat severity weighting per pattern category
    FLAG_WEIGHTS = {
        "OTP_REQUEST": 0.40,
        "PASSWORD_REQUEST": 0.40,
        "BANKING_REQUEST": 0.35,
        "MONEY_TRANSFER": 0.30,
        "THREAT": 0.25,
        "IMPERSONATION": 0.25,
        "BYPASS_VERIFICATION": 0.25,
        "CONFIDENTIAL_INFORMATION": 0.20,
        "URGENT_REQUEST": 0.15,
    }

    def analyze(self, transcript: str) -> Dict[str, Any]:
        """
        Scans transcript and returns risk_score (0.0 to 1.0) and list of triggered flags.
        """
        if not transcript or not transcript.strip():
            return {"risk_score": 0.0, "flags": []}

        cleaned_text = transcript.lower().strip()
        detected_flags: List[str] = []
        total_risk = 0.0

        for flag_name, patterns in self.PATTERNS.items():
            matched = False
            for pattern in patterns:
                if re.search(pattern, cleaned_text, re.IGNORECASE):
                    matched = True
                    break
            if matched:
                detected_flags.append(flag_name)
                total_risk += self.FLAG_WEIGHTS.get(flag_name, 0.15)

        # Compound penalty: if urgent + OTP / Banking, risk compounds
        has_urgency = "URGENT_REQUEST" in detected_flags or "THREAT" in detected_flags
        has_credential = any(f in detected_flags for f in ["OTP_REQUEST", "PASSWORD_REQUEST", "BANKING_REQUEST"])
        if has_urgency and has_credential:
            total_risk += 0.20

        # Bound to [0.0, 1.0]
        final_risk = float(round(min(total_risk, 1.0), 2))

        return {
            "risk_score": final_risk,
            "flags": detected_flags,
        }


transcript_analyzer = TranscriptAnalyzer()
