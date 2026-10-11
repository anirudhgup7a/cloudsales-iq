import json
from typing import Dict, Any, Tuple

def calculate_lead_score(lead_data: Dict[str, Any]) -> Tuple[int, str, str, str]:
    """
    Calculates deterministic lead score (0-100) based on 6 explainable factors:
    1. Service & Need Fit (max 20)
    2. Budget Suitability (max 20)
    3. Purchase Timeline & Urgency (max 20)
    4. Decision-Making Authority (max 15)
    5. Company Scale & Complexity (max 15)
    6. Engagement & Data Completeness (max 10)

    Returns:
        (total_score, priority, scoring_breakdown_json, recommended_next_action)
    """
    breakdown = {}
    reasons = []

    # 1. Service & Need Fit (20 pts)
    req_services = str(lead_data.get("required_services", "")).lower()
    fit_score = 6
    if any(k in req_services for k in ["aws", "migration", "gpu", "kubernetes", "accounting", "tax", "database", "modernization"]):
        fit_score = 20
        reasons.append("High alignment with core cloud & managed hosting offerings (+20)")
    elif any(k in req_services for k in ["private cloud", "iaas", "managed security", "virtual desktop", "vdi"]):
        fit_score = 16
        reasons.append("Solid fit with infrastructure / managed IT services (+16)")
    elif any(k in req_services for k in ["hosting", "cloud", "backup", "server"]):
        fit_score = 12
        reasons.append("General cloud interest identified (+12)")
    else:
        reasons.append("Broad or unvalidated service requirement (+6)")
    breakdown["service_fit"] = {"score": fit_score, "max": 20}

    # 2. Budget Suitability (20 pts)
    budget = float(lead_data.get("estimated_monthly_budget", 0) or 0)
    if budget >= 5000:
        budget_score = 20
        reasons.append(f"Enterprise/high-tier budget (${budget:,.0f}/mo) (+20)")
    elif budget >= 2500:
        budget_score = 16
        reasons.append(f"Strong mid-market budget (${budget:,.0f}/mo) (+16)")
    elif budget >= 1000:
        budget_score = 12
        reasons.append(f"Commercial tier budget (${budget:,.0f}/mo) (+12)")
    elif budget >= 400:
        budget_score = 8
        reasons.append(f"Entry-level SMB budget (${budget:,.0f}/mo) (+8)")
    else:
        budget_score = 4
        reasons.append(f"Limited or unconfirmed budget (${budget:,.0f}/mo) (+4)")
    breakdown["budget"] = {"score": budget_score, "max": 20}

    # 3. Purchase Timeline / Urgency (20 pts)
    timeline = str(lead_data.get("purchase_timeline", "")).lower()
    if "<30" in timeline or "immediate" in timeline or "urgent" in timeline:
        timeline_score = 20
        reasons.append("Immediate purchase intent within 30 days (+20)")
    elif "1-3" in timeline or "quarter" in timeline:
        timeline_score = 16
        reasons.append("Active evaluation window within 1-3 months (+16)")
    elif "3-6" in timeline:
        timeline_score = 10
        reasons.append("Medium-term project timeline (3-6 months) (+10)")
    else:
        timeline_score = 4
        reasons.append("Exploratory stage with distant purchase horizon (+4)")
    breakdown["timeline"] = {"score": timeline_score, "max": 20}

    # 4. Decision Maker Authority (15 pts)
    authority = str(lead_data.get("decision_maker_authority", "")).lower()
    if any(k in authority for k in ["final", "c-level", "cio", "cto", "ceo", "owner", "partner", "vp"]):
        auth_score = 15
        reasons.append("Direct engagement with final economic decision maker (+15)")
    elif any(k in authority for k in ["evaluator", "director", "head of", "architect", "tech lead"]):
        auth_score = 12
        reasons.append("Strong technical evaluator / buying influencer (+12)")
    elif "influencer" in authority or "manager" in authority:
        auth_score = 8
        reasons.append("Operational user or mid-level team influencer (+8)")
    else:
        auth_score = 4
        reasons.append("Gatekeeper or unconfirmed authority (+4)")
    breakdown["authority"] = {"score": auth_score, "max": 15}

    # 5. Company Scale & Complexity (15 pts)
    company_size = str(lead_data.get("company_size", "")).lower()
    if "500+" in company_size or "enterprise" in company_size:
        scale_score = 15
        reasons.append("Large enterprise account scale (500+ employees) (+15)")
    elif "201-500" in company_size:
        scale_score = 13
        reasons.append("Upper mid-market account (201-500 employees) (+13)")
    elif "51-200" in company_size:
        scale_score = 11
        reasons.append("Solid mid-market account (51-200 employees) (+11)")
    elif "11-50" in company_size:
        scale_score = 8
        reasons.append("Growing SMB account (11-50 employees) (+8)")
    else:
        scale_score = 5
        reasons.append("Small business account (1-10 employees) (+5)")
    breakdown["company_scale"] = {"score": scale_score, "max": 15}

    # 6. Engagement & Completeness (10 pts)
    complete_score = 0
    phone = lead_data.get("phone")
    pain_points = lead_data.get("pain_points")
    current_infra = lead_data.get("current_infra")
    if phone and len(str(phone).strip()) > 5:
        complete_score += 3
    if pain_points and len(str(pain_points).strip()) > 10:
        complete_score += 4
    if current_infra and len(str(current_infra).strip()) > 3:
        complete_score += 3
    reasons.append(f"Profile completeness and contactability (+{complete_score}/10)")
    breakdown["completeness"] = {"score": complete_score, "max": 10}

    total_score = fit_score + budget_score + timeline_score + auth_score + scale_score + complete_score

    # Determine Priority & Next Action
    if total_score >= 75:
        priority = "High"
        next_action = "Schedule consultative discovery call within 24 hours and run Cloud Fit Assessment"
    elif total_score >= 50:
        priority = "Medium"
        next_action = "Send targeted service overview & case study; confirm budget and technical timeline"
    else:
        priority = "Low"
        next_action = "Enroll in educational email nurture campaign; monitor for infrastructure trigger events"

    breakdown["total"] = total_score
    breakdown["reasons"] = reasons

    return total_score, priority, json.dumps(breakdown), next_action
