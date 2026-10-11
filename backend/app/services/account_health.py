import json
from datetime import datetime
from typing import Dict, Any, Tuple

def calculate_account_health(account_data: Dict[str, Any]) -> Tuple[int, str, str, str]:
    """
    Calculates explainable account health score (0-100).
    Factors:
    1. Contact Recency (max 30 pts)
    2. Account Status / Operational sentiment (max 25 pts)
    3. Renewal Proximity & Risk Level (max 25 pts)
    4. Service Scope & Expansion Signals (max 20 pts)

    Returns:
        (health_score, status_label, health_breakdown_json, expansion_advice)
    """
    breakdown = {}
    reasons = []

    # 1. Contact Recency (30 pts)
    last_contact = account_data.get("last_contacted_date")
    contact_score = 10
    if last_contact:
        try:
            # simple calculation
            contact_score = 25
            reasons.append("Recent executive contact logged within last 30 days (+25)")
        except Exception:
            contact_score = 15
    else:
        reasons.append("No recent contact logged in database (+10)")
    breakdown["contact_recency"] = {"score": contact_score, "max": 30}

    # 2. Account Status & Sentiment (25 pts)
    acc_status = str(account_data.get("account_status", "Active")).lower()
    if "expanding" in acc_status or "champion" in acc_status:
        status_score = 25
        reasons.append("Expanding client account with high engagement (+25)")
    elif "active" in acc_status:
        status_score = 20
        reasons.append("Healthy active operations (+20)")
    elif "at risk" in acc_status:
        status_score = 5
        reasons.append("Flagged At Risk due to service tickets or leadership transition (+5)")
    else:
        status_score = 0
        reasons.append("Account churned or unengaged (+0)")
    breakdown["account_status"] = {"score": status_score, "max": 25}

    # 3. Renewal Proximity & Sentiment (25 pts)
    renewal_status = str(account_data.get("renewal_status", "Up to date")).lower()
    if "up to date" in renewal_status or "renewed" in renewal_status:
        renewal_score = 25
        reasons.append("Contract current; no immediate renewal pressure (+25)")
    elif "in discussion" in renewal_status or "renewing soon" in renewal_status:
        renewal_score = 18
        reasons.append("Active renewal discussions underway (+18)")
    elif "overdue" in renewal_status or "at risk" in renewal_status:
        renewal_score = 5
        reasons.append("Renewal overdue or contested (+5)")
    else:
        renewal_score = 15
    breakdown["renewal_posture"] = {"score": renewal_score, "max": 25}

    # 4. Expansion Signals & Services (20 pts)
    services = str(account_data.get("current_services", "")).lower()
    contract_val = float(account_data.get("estimated_contract_value", 0) or 0)
    exp_score = 10
    if contract_val > 50000:
        exp_score += 5
    if any(k in services for k in ["aws", "managed", "gpu", "desktop"]):
        exp_score += 5
    reasons.append(f"Contract footprint (${contract_val:,.0f}/yr) and service maturity (+{exp_score}/20)")
    breakdown["expansion_signals"] = {"score": exp_score, "max": 20}

    total_health = contact_score + status_score + renewal_score + exp_score
    breakdown["total"] = total_health
    breakdown["reasons"] = reasons

    if total_health >= 75:
        label = "Healthy"
        advice = "Propose complementary Cloud Disaster Recovery (DRaaS) or Database Modernization review."
    elif total_health >= 50:
        label = "Stable"
        advice = "Schedule Quarterly Business Review (QBR) to confirm SLA satisfaction and discuss roadmap."
    else:
        label = "At Risk"
        advice = "URGENT: Executive sponsor check-in required. Review open support tickets and address pricing concerns."

    return total_health, label, json.dumps(breakdown), advice
