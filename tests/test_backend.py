import pytest
import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.services.scoring import calculate_lead_score
from app.services.cloud_fit import evaluate_cloud_fit, DEMO_PRESETS
from app.services.seeding import seed_database

from sqlalchemy.pool import StaticPool

# Use an in-memory SQLite database with StaticPool so all connections share the same memory DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_database(db, force=True)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

# 1. Lead Scoring Unit Tests
def test_lead_score_calculation():
    # Test High-Score lead
    high_lead = {
        "required_services": "AWS Migration & Cloud Assessment",
        "estimated_monthly_budget": 6000.0,
        "purchase_timeline": "Immediate (<30 days)",
        "decision_maker_authority": "Final Decision Maker",
        "company_size": "201-500",
        "phone": "+1 555-999-1234",
        "pain_points": "Legacy server crashes during flash sales and lack of automated backups",
        "current_infra": "Colocated rack server"
    }
    score, priority, breakdown, next_action = calculate_lead_score(high_lead)
    assert score >= 75
    assert priority == "High"
    assert "discovery call" in next_action.lower()

    # Test Low-Score lead
    low_lead = {
        "required_services": "Unclear",
        "estimated_monthly_budget": 200.0,
        "purchase_timeline": "Exploratory (>6 months)",
        "decision_maker_authority": "Gatekeeper",
        "company_size": "1-10",
        "phone": "",
        "pain_points": "",
        "current_infra": ""
    }
    score, priority, breakdown, next_action = calculate_lead_score(low_lead)
    assert score < 50
    assert priority == "Low"


# 2. Cloud Fit Recommendation Tests
def test_cloud_fit_advisor_presets():
    # Accounting Preset
    acc_eval = evaluate_cloud_fit(DEMO_PRESETS["accounting_firm"])
    assert acc_eval["recommended_category"] == "Managed Hosting"
    assert any("Accounting" in s for s in acc_eval["recommended_services"])
    assert "SOC" in acc_eval["fit_rationale"] or "QuickBooks" in acc_eval["fit_rationale"]

    # AI GPU Preset
    gpu_eval = evaluate_cloud_fit(DEMO_PRESETS["ai_gpu"])
    assert gpu_eval["recommended_category"] == "Infrastructure & Compute"
    assert any("GPU Compute" in s for s in gpu_eval["recommended_services"])

    # Startup AWS Preset
    aws_eval = evaluate_cloud_fit(DEMO_PRESETS["startup_aws"])
    assert aws_eval["recommended_category"] == "Public Cloud & AWS Services"
    assert any("AWS Migration" in s for s in aws_eval["recommended_services"])


# 3. Leads API Tests
def test_get_and_create_lead(client):
    res = client.get("/api/leads")
    assert res.status_code == 200
    leads = res.json()
    assert len(leads) >= 10

    # Create new lead
    new_lead_payload = {
        "company_name": "Test Enterprise Cloud Ltd",
        "contact_name": "Sarah Connor",
        "email": "sconnor@testcloud-demo.com",
        "phone": "+1 (555) 000-1122",
        "industry": "Healthcare & Biotech",
        "company_size": "51-200",
        "location": "Boston, MA",
        "lead_source": "LinkedIn",
        "required_services": "GPU Compute for AI Workloads",
        "estimated_monthly_budget": 7500.0,
        "current_infra": "On-prem workstation",
        "pain_points": "Need dedicated GPU capacity for medical imaging inference",
        "purchase_timeline": "Immediate (<30 days)",
        "decision_maker_authority": "Final Decision Maker",
        "sales_owner": "Priya Sharma"
    }
    create_res = client.post("/api/leads", json=new_lead_payload)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["company_name"] == "Test Enterprise Cloud Ltd"
    assert created["lead_score"] >= 75
    assert created["priority"] == "High"

    # Convert Lead to Opportunity
    conv_res = client.post(f"/api/leads/{created['id']}/convert", json={
        "opportunity_name": "Test Enterprise - AI Cluster",
        "expected_deal_value": 90000.0,
        "mrr": 7500.0,
        "one_time_value": 5000.0,
        "expected_close_date": "2026-11-30",
        "create_account": True
    })
    assert conv_res.status_code == 200
    conv_data = conv_res.json()
    assert "opportunity_id" in conv_data
    assert "account_id" in conv_data


# 4. Pipeline & Opportunities Tests
def test_pipeline_summary_and_stage_update(client):
    summary_res = client.get("/api/opportunities/pipeline/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["open_pipeline_value"] > 0
    assert summary["weighted_forecast_revenue"] > 0
    assert summary["closed_won_revenue"] > 0

    # Get an opportunity and update its stage
    opps = client.get("/api/opportunities").json()
    assert len(opps) > 0
    opp_id = opps[0]["id"]

    patch_res = client.patch(f"/api/opportunities/{opp_id}/stage", json={
        "stage": "Negotiation",
        "probability": 80,
        "notes": "Contract in final legal review"
    })
    assert patch_res.status_code == 200
    assert patch_res.json()["stage"] == "Negotiation"
    assert patch_res.json()["probability"] == 80


# 5. Activity Creation & Completion
def test_activities_flow(client):
    acts_res = client.get("/api/activities")
    assert acts_res.status_code == 200
    acts = acts_res.json()
    assert len(acts) >= 15

    # Complete an activity
    pending_act = next((a for a in acts if a["status"] == "Pending"), None)
    if pending_act:
        comp_res = client.patch(f"/api/activities/{pending_act['id']}/complete", params={
            "outcome": "Product demonstration went great",
            "next_action": "Send customized proposal"
        })
        assert comp_res.status_code == 200
        assert comp_res.json()["status"] == "Completed"


# 6. Proposal Generation & PDF Download
def test_proposal_pdf_generation(client):
    props = client.get("/api/proposals").json()
    assert len(props) > 0
    prop_id = props[0]["id"]

    pdf_res = client.get(f"/api/proposals/{prop_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000  # Actual binary PDF data produced


# 7. Dashboard KPIs & Analytics
def test_dashboard_kpis_and_analytics(client):
    dash_res = client.get("/api/reports/dashboard")
    assert dash_res.status_code == 200
    data = dash_res.json()
    assert "kpis" in data
    assert data["kpis"]["total_leads"] > 0
    assert data["kpis"]["monthly_sales_target"] == 150000.0
    assert len(data["stage_distribution"]) == 8

    analytics_res = client.get("/api/reports/analytics")
    assert analytics_res.status_code == 200
    a_data = analytics_res.json()
    assert "conversion_funnel" in a_data
    assert a_data["conversion_funnel"]["lead_to_qualified_pct"] > 0


# 8. CSV Exports
def test_csv_exports(client):
    csv_leads = client.get("/api/leads/export/csv")
    assert csv_leads.status_code == 200
    assert "text/csv" in csv_leads.headers["content-type"]

    csv_reports = client.get("/api/reports/export/csv?metric=pipeline")
    assert csv_reports.status_code == 200
    assert "text/csv" in csv_reports.headers["content-type"]
