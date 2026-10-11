# CloudSales IQ ☁️🚀
### Production-Quality B2B Cloud Sales Intelligence & CRM Platform

> **Portfolio Project:** Designed and engineered as a technical and commercial showcase for the **Intern – Cloud Sales** role at **Real Time Data Services (RTDS)**.  
> Demonstrates consultative selling mastery, cloud workload qualification, sales velocity analytics, account retention, and end-to-end full-stack software craftsmanship.

---

## 🌟 Executive Summary

**CloudSales IQ** is an enterprise-grade B2B Cloud Sales Intelligence and CRM platform built specifically for modern cloud hosting, managed infrastructure, and application hosting sales teams. 

Unlike generic CRMs, CloudSales IQ embeds **cloud domain expertise** directly into the sales workflow:
1. **Cloud Fit Advisor**: Evaluates prospect workloads against real infrastructure patterns (Accounting application hosting, Dedicated AI GPU clusters, Enterprise Database migrations) to generate consultative architecture recommendations, cost projections, and trade-offs.
2. **Algorithmic Lead Scoring**: Transparently scores inbound and outbound leads (0–100) using a multi-factor BANT + Cloud Fit model with actionable coaching tips for sales reps.
3. **Forecasting & Pipeline Velocity**: Weighted pipeline forecasting (probability-adjusted ARR/MRR) across multi-stage sales cycles.
4. **On-the-Fly Proposal PDF Generation**: Instantly generates branded, multi-page commercial proposals with service breakdowns and terms.
5. **Account Health & Renewal Protection**: Proactively flags churn risk, contract renewal deadlines (30/60/90 days), and cross-sell expansion opportunities.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│             Frontend (React 19 + TypeScript)           │
│   Vite • Tailwind CSS v4 • Recharts • Lucide Icons     │
└───────────────────────────┬────────────────────────────┘
                            │ (Vite Proxy: /api/*)
┌───────────────────────────▼────────────────────────────┐
│              Backend API (FastAPI + Python 3.14)       │
│   SQLAlchemy 2.0 • Pydantic v2 • ReportLab PDF Engine  │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│              Database (SQLite / PostgreSQL)            │
│   Full ACID Schema • 10 Relational Tables • Seed Data  │
└────────────────────────────────────────────────────────┘
```

### Frontend
- **Framework**: React 19 + TypeScript (Strict mode)
- **Build Tool**: Vite v8
- **Styling**: Tailwind CSS v4 (Glassmorphism, custom micro-interactions, responsive grid)
- **Routing**: React Router v7
- **Data Visualization**: Recharts (Pipeline distribution, Revenue attribution, Funnel analytics)
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Asynchronous Python REST API)
- **ORM & Database**: SQLAlchemy 2.0 with SQLite (zero-config, production-swappable to PostgreSQL)
- **Validation**: Pydantic v2 schemas
- **Document Generation**: ReportLab PDF generator with custom typography, tabular pricing, and terms
- **Testing**: Pytest with HTTPX TestClient (100% core workflow test coverage)

---

## 🚀 Key Modules & Capabilities

| Module | Core Functionality | Cloud Sales Concept |
|---|---|---|
| **Executive Dashboard** | Real-time KPIs, monthly quota attainment (113.6%), stage distribution, high-priority queue | Sales velocity, pipeline coverage, quota attainment |
| **Lead Qualification** | BANT + Cloud Fit scoring (0–100), qualification badges, single-click conversion to Opportunity | Prospect qualification, lead prioritization, BANT framework |
| **Pipeline & Opportunities** | Multi-stage pipeline tracking (Discovery → Won/Lost), weighted revenue forecasting | Probability forecasting, sales stage progression, ARR/MRR |
| **Cloud Fit Advisor** | Interactive consultative workload assessment wizard with 3 realistic presets | Solution engineering, consultative selling, TCO analysis |
| **Activities & Outreach** | Call logs, email sequences, meeting notes, overdue alerts, omnichannel copy-paste scripts | Sales cadence, follow-up discipline, objection handling |
| **Account Health & Expansion** | Health scores (0–100), NPS sentiment, support ticket risk, cross-sell identification | Net Revenue Retention (NRR), customer lifetime value (LTV) |
| **Renewals Tracker** | 30/60/90-day renewal alerts, overdue tracking, contract value at risk | Churn prevention, renewal management, contract lifecycle |
| **Proposal Generator** | Commercial proposal builder + downloadable PDF with dynamic pricing calculations | Commercial structuring, proposal delivery, pricing tiers |
| **Reports & Analytics** | Full conversion funnel, revenue by acquisition channel, activity completion metrics | Conversion economics, customer acquisition channel ROI |
| **Settings & Demo Reset** | Quota targets configuration, system health monitoring, single-click demo data reset | Quota management, demo reliability |

---

## 🛠️ Quickstart (Run Locally)

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### 1. Clone & Set Up Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

*The backend will automatically create SQLite database `cloudsales_iq.db` and seed it with realistic B2B cloud sales demo data upon startup.*

- API Docs (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### 2. Set Up & Run Frontend

```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```

*Open your browser at `http://localhost:5173/`.*

---

## 🧪 Running Automated Tests

A comprehensive test suite verifies API integrity, algorithmic scoring, proposal PDF generation, and CSV reports:

```bash
# From the project root
python -m pytest tests/test_backend.py -v
```

All 8 integration test suites run against an isolated test database:
- `test_lead_score_calculation` ✅
- `test_cloud_fit_advisor_presets` ✅
- `test_get_and_create_lead` ✅
- `test_pipeline_summary_and_stage_update` ✅
- `test_activities_flow` ✅
- `test_proposal_pdf_generation` ✅
- `test_dashboard_kpis_and_analytics` ✅
- `test_csv_exports` ✅

---

## 🚢 Production Deployment Guide

### Option 1: Docker Container (Turnkey)

Use the provided `Dockerfile` and `docker-compose.yml`:

```bash
docker-compose up --build
```
Access the application at `http://localhost:80`.

### Option 2: Cloud Deployment (Render / Railway)

1. **Backend**:
   - Environment: Python 3.11+
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (working directory: `backend`)
2. **Frontend**:
   - Environment: Static Site / Node
   - Build Command: `npm run build` (working directory: `frontend`)
   - Publish Directory: `frontend/dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-url.onrender.com/api`

---

## ⚖️ Legal & Educational Disclaimer

> **Notice:** CloudSales IQ is an independent educational software project developed exclusively for academic portfolio demonstration and technical interview presentation.  
> It is **not** an official product of, nor affiliated with or endorsed by, Real Time Data Services (RTDS) or any third-party cloud infrastructure provider. All company names, customer scenarios, financial figures, contact records, and software metrics depicted within the demo data are entirely fictional.
