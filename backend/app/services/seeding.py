import json
import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    Lead, Account, Opportunity, OpportunityStageHistory,
    Activity, CloudService, Assessment, Proposal, Renewal, SalesTarget
)
from app.services.scoring import calculate_lead_score
from app.services.account_health import calculate_account_health
from app.services.cloud_fit import evaluate_cloud_fit, DEMO_PRESETS

def seed_database(db: Session, force: bool = False):
    """
    Seeds comprehensive, realistic demonstration data.
    If force=True, clears existing demo records first.
    """
    if not force:
        # Check if already seeded
        if db.query(Lead).count() >= 10:
            return {"status": "already_seeded", "message": "Demo data already exists."}

    # Clean existing data safely
    db.query(Activity).delete()
    db.query(OpportunityStageHistory).delete()
    db.query(Proposal).delete()
    db.query(Renewal).delete()
    db.query(Opportunity).delete()
    db.query(Assessment).delete()
    db.query(Lead).delete()
    db.query(Account).delete()
    db.query(CloudService).delete()
    db.query(SalesTarget).delete()
    db.commit()

    # 1. Cloud Services Catalog
    services_data = [
        # Public Cloud & AWS Services
        {
            "category": "Public Cloud & AWS Services",
            "name": "AWS Migration & Cloud Assessment",
            "summary": "Full-lifecycle cloud migration assessment, TCO calculation, landing zone architecture, and wave-based workload cutover.",
            "typical_use_cases": "Legacy on-premise datacenter exit, co-location cost reduction, AWS foundational architecture.",
            "min_monthly_budget": 2500.0,
            "key_benefits": json.dumps(["Up to 35% infrastructure TCO savings", "Zero-data-loss database cutover", "AWS Well-Architected Framework compliance"]),
            "questions_to_ask": json.dumps(["How many physical/virtual servers are in scope?", "What are your RPO and RTO thresholds?", "What is your target cutover timeline?"]),
            "active": True
        },
        {
            "category": "Public Cloud & AWS Services",
            "name": "Application Modernization",
            "summary": "Refactoring monolithic codebases into containerized microservices running on AWS ECS/EKS with serverless automation.",
            "typical_use_cases": "Slow deployment cycles, monolithic scaling bottlenecks, microservices transformation.",
            "min_monthly_budget": 3500.0,
            "key_benefits": json.dumps(["Continuous delivery with zero-downtime blue/green deployments", "Granular auto-scaling per service", "Modern cloud-native observability"]),
            "questions_to_ask": json.dumps(["What framework and runtime versions are in production?", "Are your services stateful or stateless?", "Do you have automated integration tests?"]),
            "active": True
        },
        {
            "category": "Public Cloud & AWS Services",
            "name": "Database Modernization",
            "summary": "Migration of legacy proprietary databases (Oracle, MS SQL) to cloud-native managed engines (Amazon Aurora, PostgreSQL, DynamoDB).",
            "typical_use_cases": "Costly database licensing renewal, database crash under peak write IOPS, read replica bottlenecks.",
            "min_monthly_budget": 2000.0,
            "key_benefits": json.dumps(["Elimination of expensive per-core database licenses", "Multi-AZ automated failover under 30 seconds", "Up to 5x throughput of standard MySQL/PostgreSQL"]),
            "questions_to_ask": json.dumps(["What is your active database size and transaction volume?", "Are you utilizing stored procedures or database triggers?", "What downtime window is acceptable?"]),
            "active": True
        },
        {
            "category": "Public Cloud & AWS Services",
            "name": "Data Analytics & AI/ML Infrastructure",
            "summary": "Managed data lakes, streaming ETL pipelines with AWS Glue/Kinesis, and machine learning model training/inference endpoints.",
            "typical_use_cases": "Real-time fraud detection, customer 360 data warehousing, LLM deployment.",
            "min_monthly_budget": 4000.0,
            "key_benefits": json.dumps(["Scalable serverless analytics querying Petabytes of data", "Unified governance and automated data cataloging", "Optimized inference hosting"]),
            "questions_to_ask": json.dumps(["What are your data ingestion sources and daily ingestion volumes?", "Which BI tools (Tableau/PowerBI/QuickSight) need direct access?"]),
            "active": True
        },

        # Infrastructure & Compute
        {
            "category": "Infrastructure & Compute",
            "name": "Infrastructure as a Service (IaaS)",
            "summary": "High-performance virtual machines with enterprise NVMe storage, custom vCPU/RAM ratios, and dedicated 10Gbps networking.",
            "typical_use_cases": "Core enterprise IT hosting, ERP/CRM deployments, high-throughput web clusters.",
            "min_monthly_budget": 1200.0,
            "key_benefits": json.dumps(["99.99% guaranteed infrastructure uptime SLA", "No noisy-neighbor CPU contention", "Predictable all-inclusive egress bandwidth"]),
            "questions_to_ask": json.dumps(["What CPU and RAM allocations are needed per VM?", "What are your storage IOPS requirements?"]),
            "active": True
        },
        {
            "category": "Infrastructure & Compute",
            "name": "Private Cloud Hosting",
            "summary": "Dedicated single-tenant hardware hypervisors isolated in Tier-III/IV datacenter facilities with compliance attestation.",
            "typical_use_cases": "Strict regulatory isolation (HIPAA, PCI-DSS Level 1, FINRA), predictable high-compute loads.",
            "min_monthly_budget": 3000.0,
            "key_benefits": json.dumps(["Complete physical server isolation", "Customizable security perimeter and hardware firewall", "Fixed predictable OPEX billing"]),
            "questions_to_ask": json.dumps(["Do compliance auditors require dedicated bare-metal separation?", "What are your specific hardware firewall policies?"]),
            "active": True
        },
        {
            "category": "Infrastructure & Compute",
            "name": "GPU Compute for AI Workloads",
            "summary": "High-density clusters equipped with NVIDIA A100, H100, and L40S Tensor Core GPUs with low-latency InfiniBand interconnects.",
            "typical_use_cases": "Large Language Model training, generative AI fine-tuning, computer vision model inferencing.",
            "min_monthly_budget": 6000.0,
            "key_benefits": json.dumps(["Guaranteed reserved GPU hardware with zero preemption", "High-speed NVMe scratch storage", "Pre-configured PyTorch and CUDA runtime images"]),
            "questions_to_ask": json.dumps(["Which GPU chipsets and VRAM capacities are required?", "Are you running distributed multi-node training?"]),
            "active": True
        },
        {
            "category": "Infrastructure & Compute",
            "name": "Kubernetes & Container Infrastructure",
            "summary": "Production-grade managed Kubernetes clusters with automated worker autoscaling, ingress control, and integrated CI/CD pipelines.",
            "typical_use_cases": "Microservices orchestration, multi-tenant SaaS backends, DevOps pipelines.",
            "min_monthly_budget": 2500.0,
            "key_benefits": json.dumps(["Automated pod healing and zero-downtime rolling upgrades", "Built-in cluster monitoring with Prometheus and Grafana", "GitOps deployment integration"]),
            "questions_to_ask": json.dumps(["How many microservices or containers will run across the cluster?", "Do your developers already use Helm or Kustomize?"]),
            "active": True
        },

        # Managed Hosting
        {
            "category": "Managed Hosting",
            "name": "Accounting & Tax Application Hosting",
            "summary": "Secure, multi-user cloud hosting for QuickBooks Enterprise, Drake, Lacerte, ProSeries, and UltraTax with automated nightly backups.",
            "typical_use_cases": "CPA firms, accounting practices, remote tax season staffing, multi-branch access.",
            "min_monthly_budget": 800.0,
            "key_benefits": json.dumps(["Anywhere remote access from PC, Mac, or tablet", "SOC 2 Type II certified cloud infrastructure", "Automated daily snapshot backups with instant recovery", "24/7 dedicated tax application support"]),
            "questions_to_ask": json.dumps(["How many users need simultaneous access to tax and accounting software?", "Which exact versions of QuickBooks or Drake are you running?", "Do you require MS Office or Adobe Acrobat inside the hosted desktop?"]),
            "active": True
        },
        {
            "category": "Managed Hosting",
            "name": "Hosted Virtual Desktops (DaaS)",
            "summary": "Turnkey Windows virtual desktops accessible from any browser or thin client, isolated from employee endpoint risks.",
            "typical_use_cases": "Remote and hybrid workforce enablement, contractor workstations, BYOD security.",
            "min_monthly_budget": 1000.0,
            "key_benefits": json.dumps(["Consistent desktop user experience regardless of client hardware", "Centralized data storage eliminating data loss on lost laptops", "Rapid onboarding of contractors in minutes"]),
            "questions_to_ask": json.dumps(["How many total desktop seats are needed?", "What graphic or processing capabilities are required for daily apps?"]),
            "active": True
        },
        {
            "category": "Managed Hosting",
            "name": "Managed IT & Security Services",
            "summary": "24/7 proactive system monitoring, managed EDR antivirus, patch automation, vulnerability scanning, and dark web monitoring.",
            "typical_use_cases": "Mid-sized firms without an internal 24/7 Security Operations Center (SOC).",
            "min_monthly_budget": 1500.0,
            "key_benefits": json.dumps(["24/7 SOC detection and response against ransomware", "Automated Windows and third-party software patching", "Quarterly executive security vulnerability reporting"]),
            "questions_to_ask": json.dumps(["Do you have cyber insurance requirements for managed EDR and MFA?", "How many total endpoints and servers need 24/7 coverage?"]),
            "active": True
        }
    ]

    for svc in services_data:
        db.add(CloudService(**svc))
    db.commit()

    # 2. Seed Sales Target ($150,000 / month)
    db.add(SalesTarget(period="Current Month", target_amount=150000.0, fiscal_quarter="Q4"))
    db.commit()

    # 3. Seed Accounts (10 accounts)
    accounts_data = [
        {
            "company_name": "Vanguard Financial Partners",
            "primary_contact": "Robert Sterling",
            "email": "rsterling@vanguardfp-demo.com",
            "phone": "+1 (555) 234-5678",
            "industry": "Accounting & Wealth Management",
            "company_size": "51-200",
            "location": "Chicago, IL",
            "current_services": "Accounting & Tax Application Hosting, Hosted Virtual Desktops",
            "estimated_contract_value": 48000.0,
            "contract_start_date": "2025-11-01",
            "contract_end_date": "2026-11-01",
            "account_status": "Active",
            "renewal_status": "Renewing Soon",
            "expansion_opportunities": "Managed Security & EDR, Additional 15 Tax Season Seats",
            "last_contacted_date": "2026-10-02",
            "notes": "Highly satisfied with tax season uptime. Renewal contract sent for 2-year lock."
        },
        {
            "company_name": "HealthPulse Analytics",
            "primary_contact": "Dr. Sarah Chen",
            "email": "schen@healthpulse-demo.org",
            "phone": "+1 (555) 345-6789",
            "industry": "Healthcare & Biotech",
            "company_size": "51-200",
            "location": "Boston, MA",
            "current_services": "Private Cloud Hosting, GPU Compute for AI Workloads",
            "estimated_contract_value": 96000.0,
            "contract_start_date": "2025-12-15",
            "contract_end_date": "2026-12-15",
            "account_status": "Active",
            "renewal_status": "Up to date",
            "expansion_opportunities": "Expanding from 4x A100 GPUs to 8x H100 cluster for clinical trials",
            "last_contacted_date": "2026-09-28",
            "notes": "Fast growing healthcare AI account. CTO expressed interest in dedicated InfiniBand cluster."
        },
        {
            "company_name": "LogisticsOne Global",
            "primary_contact": "Marcus Vance",
            "email": "mvance@logisticsone-demo.com",
            "phone": "+1 (555) 456-7890",
            "industry": "Supply Chain & Logistics",
            "company_size": "201-500",
            "location": "Dallas, TX",
            "current_services": "AWS Migration & Cloud Assessment, Application Modernization",
            "estimated_contract_value": 72000.0,
            "contract_start_date": "2026-01-10",
            "contract_end_date": "2027-01-10",
            "account_status": "Active",
            "renewal_status": "Up to date",
            "expansion_opportunities": "Database Modernization (Aurora MySQL cluster)",
            "last_contacted_date": "2026-10-05",
            "notes": "Completed initial EC2 migration. Scheduled QBR to discuss database refactoring."
        },
        {
            "company_name": "Meridian Law Group",
            "primary_contact": "Eleanor Vance",
            "email": "evance@meridianlaw-demo.com",
            "phone": "+1 (555) 567-8901",
            "industry": "Legal Services",
            "company_size": "11-50",
            "location": "New York, NY",
            "current_services": "Hosted Virtual Desktops (DaaS), Managed IT & Security",
            "estimated_contract_value": 32000.0,
            "contract_start_date": "2025-10-20",
            "contract_end_date": "2026-10-25",
            "account_status": "At Risk",
            "renewal_status": "Overdue",
            "expansion_opportunities": "Needs executive call to retain; reported VPN latency issues last month",
            "last_contacted_date": "2026-09-12",
            "notes": "Managing Partner dissatisfied with bandwidth throttling. Priority escalation required."
        },
        {
            "company_name": "CloudNine SaaS Corp",
            "primary_contact": "Kevin O'Connor",
            "email": "koconnor@cloudnine-demo.io",
            "phone": "+1 (555) 678-9012",
            "industry": "FinTech / SaaS",
            "company_size": "51-200",
            "location": "San Francisco, CA",
            "current_services": "Kubernetes & Container Infrastructure, Database Modernization",
            "estimated_contract_value": 84000.0,
            "contract_start_date": "2026-03-01",
            "contract_end_date": "2027-03-01",
            "account_status": "Active",
            "renewal_status": "Up to date",
            "expansion_opportunities": "Multi-region AWS DR failover pipeline",
            "last_contacted_date": "2026-10-08",
            "notes": "SaaS platform grew 40% QoQ. Added 6 worker nodes last month."
        },
        {
            "company_name": "Apex Manufacturing Solutions",
            "primary_contact": "David Miller",
            "email": "dmiller@apexmanuf-demo.com",
            "phone": "+1 (555) 789-0123",
            "industry": "Manufacturing",
            "company_size": "201-500",
            "location": "Cleveland, OH",
            "current_services": "Infrastructure as a Service (IaaS)",
            "estimated_contract_value": 42000.0,
            "contract_start_date": "2025-11-15",
            "contract_end_date": "2026-11-15",
            "account_status": "Active",
            "renewal_status": "In Discussion",
            "expansion_opportunities": "Disaster Recovery as a Service (DRaaS)",
            "last_contacted_date": "2026-10-01",
            "notes": "Renewal discussion scheduled for next Thursday. Competitor pitched Azure direct."
        },
        {
            "company_name": "Summit CPA & Business Advisors",
            "primary_contact": "Patricia Jenkins",
            "email": "pjenkins@summitcpa-demo.com",
            "phone": "+1 (555) 890-1234",
            "industry": "Accounting & Financial Services",
            "company_size": "11-50",
            "location": "Denver, CO",
            "current_services": "Accounting & Tax Application Hosting",
            "estimated_contract_value": 24000.0,
            "contract_start_date": "2025-09-01",
            "contract_end_date": "2026-09-01",
            "account_status": "Active",
            "renewal_status": "Renewed",
            "expansion_opportunities": "Adding Drake Tax cloud module + 8 seasonal licenses",
            "last_contacted_date": "2026-10-07",
            "notes": "Renewed 12-month agreement with 10% expansion for tax season."
        },
        {
            "company_name": "RetailWave E-Commerce",
            "primary_contact": "Jessica Taylor",
            "email": "jtaylor@retailwave-demo.com",
            "phone": "+1 (555) 901-2345",
            "industry": "Retail & E-Commerce",
            "company_size": "51-200",
            "location": "Seattle, WA",
            "current_services": "AWS Migration & Cloud Assessment",
            "estimated_contract_value": 54000.0,
            "contract_start_date": "2026-02-01",
            "contract_end_date": "2027-02-01",
            "account_status": "Active",
            "renewal_status": "Up to date",
            "expansion_opportunities": "Holiday Black Friday auto-scaling optimization",
            "last_contacted_date": "2026-09-25",
            "notes": "Preparing for holiday traffic surge. Planning cloud architecture review."
        },
        {
            "company_name": "Nexora BioSciences",
            "primary_contact": "Dr. Alan Grant",
            "email": "agrant@nexorabio-demo.com",
            "phone": "+1 (555) 012-3456",
            "industry": "Life Sciences",
            "company_size": "51-200",
            "location": "San Diego, CA",
            "current_services": "GPU Compute for AI Workloads, Private Cloud",
            "estimated_contract_value": 110000.0,
            "contract_start_date": "2026-01-01",
            "contract_end_date": "2027-01-01",
            "account_status": "Active",
            "renewal_status": "Up to date",
            "expansion_opportunities": "Dedicated multi-node Slurm GPU cluster",
            "last_contacted_date": "2026-10-09",
            "notes": "Flagship research client. Zero hardware complaints since onboarding."
        },
        {
            "company_name": "Beacon Freight Solutions",
            "primary_contact": "Thomas Wright",
            "email": "twright@beaconfreight-demo.com",
            "phone": "+1 (555) 123-7890",
            "industry": "Transportation",
            "company_size": "11-50",
            "location": "Atlanta, GA",
            "current_services": "Hosted Virtual Desktops",
            "estimated_contract_value": 18000.0,
            "contract_start_date": "2025-11-20",
            "contract_end_date": "2026-11-20",
            "account_status": "Active",
            "renewal_status": "In Discussion",
            "expansion_opportunities": "Migrating dispatch servers to IaaS",
            "last_contacted_date": "2026-09-18",
            "notes": "Reviewing annual cost vs internal hardware replacement."
        }
    ]

    account_objs = []
    for acc_data in accounts_data:
        h_score, h_label, h_breakdown, _ = calculate_account_health(acc_data)
        acc_data["health_score"] = h_score
        acc_data["health_breakdown"] = h_breakdown
        obj = Account(**acc_data)
        db.add(obj)
        account_objs.append(obj)
    db.commit()

    # 4. Seed Leads (16 diverse leads with scores, requirements, sources)
    leads_data = [
        {
            "company_name": "Pinnacle Accounting Partners LLP",
            "contact_name": "Gregory Ross",
            "email": "gross@pinnacle-acct-demo.com",
            "phone": "+1 (555) 234-8891",
            "industry": "Accounting & Financial Services",
            "company_size": "11-50",
            "location": "Charlotte, NC",
            "lead_source": "Referral",
            "required_services": "Accounting & Tax Application Hosting, Hosted Virtual Desktops",
            "estimated_monthly_budget": 1600.0,
            "current_infra": "Local Windows 2012 Server in office with recurring crashes",
            "pain_points": "Server keeps freezing during peak tax filing hours; remote staff cannot access QuickBooks without VPN dropping.",
            "purchase_timeline": "Immediate (<30 days)",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Looking to switch before the upcoming tax rush. Sent introductory proposal."
        },
        {
            "company_name": "QuantaBio Therapeutics",
            "contact_name": "Dr. Elena Rostova",
            "email": "erostova@quantabio-demo.ai",
            "phone": "+1 (555) 345-9922",
            "industry": "Biotechnology / AI",
            "company_size": "51-200",
            "location": "Cambridge, MA",
            "lead_source": "LinkedIn",
            "required_services": "GPU Compute for AI Workloads, Kubernetes & Container Infrastructure",
            "estimated_monthly_budget": 9500.0,
            "current_infra": "Ad-hoc cloud GPU spot instances with frequent eviction interruptions",
            "pain_points": "Losing 14 hours of training checkpoints whenever spot instances get terminated; need guaranteed reserved A100/H100 clusters.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Tech Evaluator / VP Engineering",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "High priority AI prospect. Scheduled technical discovery call."
        },
        {
            "company_name": "StreamPay FinTech",
            "contact_name": "Vikram Sethi",
            "email": "vsethi@streampay-demo.com",
            "phone": "+1 (555) 456-1133",
            "industry": "FinTech / SaaS",
            "company_size": "51-200",
            "location": "Austin, TX",
            "lead_source": "Inbound Email",
            "required_services": "AWS Migration & Cloud Assessment, Database Modernization",
            "estimated_monthly_budget": 5200.0,
            "current_infra": "Colocated rack server with single MySQL master database",
            "pain_points": "PCI-DSS audit compliance requires Multi-AZ database failover and automated encrypted backups which current colocation lacks.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Strong intent. Cloud Fit Advisor assessment generated."
        },
        {
            "company_name": "Heritage Law Associates",
            "contact_name": "Sarah Jenkins",
            "email": "sjenkins@heritagelaw-demo.com",
            "phone": "+1 (555) 567-2244",
            "industry": "Legal Services",
            "company_size": "11-50",
            "location": "Philadelphia, PA",
            "lead_source": "Website",
            "required_services": "Hosted Virtual Desktops (DaaS), Managed Security",
            "estimated_monthly_budget": 1400.0,
            "current_infra": "Unmanaged laptops with local file storage and Dropbox",
            "pain_points": "Managing Partner worried about client data confidentiality on lost laptops; needs centralized cloud desktop.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Contacted",
            "notes": "Sent security Whitepaper and DaaS feature sheet."
        },
        {
            "company_name": "OmniRetail Global",
            "contact_name": "Daniel Carter",
            "email": "dcarter@omniretail-demo.com",
            "phone": "+1 (555) 678-3355",
            "industry": "Retail & E-Commerce",
            "company_size": "201-500",
            "location": "Chicago, IL",
            "lead_source": "Partner Network",
            "required_services": "Infrastructure as a Service (IaaS), Application Modernization",
            "estimated_monthly_budget": 6500.0,
            "current_infra": "Traditional dedicated hosting on legacy CentOS 7 servers",
            "pain_points": "CentOS 7 reached End of Life; need managed migration to modern Linux architecture with auto-scaling.",
            "purchase_timeline": "Immediate (<30 days)",
            "decision_maker_authority": "Tech Evaluator / IT Director",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "EOL deadline creates strong urgency. Solution Proposed."
        },
        {
            "company_name": "Precision CPA Advisors",
            "contact_name": "Rachel Adams",
            "email": "radams@precisioncpa-demo.com",
            "phone": "+1 (555) 789-4466",
            "industry": "Accounting & Financial Services",
            "company_size": "1-10",
            "location": "Orlando, FL",
            "lead_source": "Cold Outreach",
            "required_services": "Accounting & Tax Application Hosting",
            "estimated_monthly_budget": 850.0,
            "current_infra": "QuickBooks on desktop PC with external USB drive backups",
            "pain_points": "Backup drive failed twice; dreading ransomware attack or hardware failure.",
            "purchase_timeline": "Immediate (<30 days)",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "High fit for QuickBooks multi-user hosting tier."
        },
        {
            "company_name": "Nexus MedTech Systems",
            "contact_name": "Dr. Kevin Huang",
            "email": "khuang@nexusmed-demo.com",
            "phone": "+1 (555) 890-5577",
            "industry": "Healthcare & Biotech",
            "company_size": "51-200",
            "location": "San Jose, CA",
            "lead_source": "LinkedIn",
            "required_services": "Private Cloud Hosting, Managed Security & Backup",
            "estimated_monthly_budget": 4800.0,
            "current_infra": "Hybrid on-prem storage with public cloud API",
            "pain_points": "Need dedicated isolated hypervisor to satisfy healthcare compliance review.",
            "purchase_timeline": "3-6 Months",
            "decision_maker_authority": "Tech Evaluator / IT Director",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Contacted",
            "notes": "Awaiting compliance team approval on requirements."
        },
        {
            "company_name": "Velocity Logistics Tech",
            "contact_name": "Amanda Cruz",
            "email": "acruz@velocitylog-demo.com",
            "phone": "+1 (555) 901-6688",
            "industry": "Supply Chain & Logistics",
            "company_size": "51-200",
            "location": "Miami, FL",
            "lead_source": "Website",
            "required_services": "AWS Migration & Cloud Assessment",
            "estimated_monthly_budget": 3200.0,
            "current_infra": "Shared hosting and fragmented third-party APIs",
            "pain_points": "Website slows down during dispatch peaks; no automated monitoring or alerting.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Influencer / Operations Lead",
            "sales_owner": "Priya Sharma",
            "qualification_status": "New",
            "notes": "Downloaded whitepaper. Follow-up email queued."
        },
        {
            "company_name": "Horizon Insurance Group",
            "contact_name": "Bradley Cooper",
            "email": "bcooper@horizonins-demo.com",
            "phone": "+1 (555) 012-7799",
            "industry": "Insurance",
            "company_size": "201-500",
            "location": "Columbus, OH",
            "lead_source": "Referral",
            "required_services": "Database Modernization, Managed Security",
            "estimated_monthly_budget": 7800.0,
            "current_infra": "On-premise SQL Server 2014 enterprise cluster",
            "pain_points": "Maintenance renewal quotes from current hardware vendor are skyrocketing; exploring managed cloud alternative.",
            "purchase_timeline": "3-6 Months",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Contacted",
            "notes": "Had discovery call. Next step: detailed database sizing questionnaire."
        },
        {
            "company_name": "Cognitive Robotics Inc.",
            "contact_name": "Siddharth Verma",
            "email": "sverma@cognitiverobot-demo.ai",
            "phone": "+1 (555) 123-8800",
            "industry": "Artificial Intelligence",
            "company_size": "11-50",
            "lead_source": "LinkedIn",
            "location": "Seattle, WA",
            "required_services": "GPU Compute for AI Workloads",
            "estimated_monthly_budget": 11000.0,
            "current_infra": "Local gaming GPU rigs under engineers' desks overheating office",
            "pain_points": "Deskside GPU rigs tripping circuit breakers; inability to schedule batch training runs across team.",
            "purchase_timeline": "Immediate (<30 days)",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Urgent compute requirement. Converting to opportunity."
        },
        {
            "company_name": "BlueRidge Accounting LLC",
            "contact_name": "Donna Martin",
            "email": "dmartin@blueridge-acct-demo.com",
            "phone": "+1 (555) 234-9911",
            "industry": "Accounting & Financial Services",
            "company_size": "11-50",
            "location": "Richmond, VA",
            "lead_source": "Referral",
            "required_services": "Accounting & Tax Application Hosting",
            "estimated_monthly_budget": 1100.0,
            "current_infra": "Aging Dell PowerEdge T320 in back office",
            "pain_points": "Server hard drive throwing SMART errors; partner terrified of data loss during annual filing.",
            "purchase_timeline": "Immediate (<30 days)",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Urgent timeline. Demo scheduled for Monday."
        },
        {
            "company_name": "UrbanCraft Apparel",
            "contact_name": "Chloe Bennett",
            "email": "cbennett@urbancraft-demo.com",
            "phone": "+1 (555) 345-0022",
            "industry": "Retail & E-Commerce",
            "company_size": "11-50",
            "location": "Portland, OR",
            "lead_source": "Cold Outreach",
            "required_services": "Infrastructure as a Service (IaaS)",
            "estimated_monthly_budget": 600.0,
            "current_infra": "Basic cPanel shared hosting",
            "pain_points": "Store went down during flash sale; lost $15k in potential sales.",
            "purchase_timeline": "Exploratory (>6 months)",
            "decision_maker_authority": "Gatekeeper / Unknown",
            "sales_owner": "Priya Sharma",
            "qualification_status": "New",
            "notes": "Budget low for custom enterprise cluster. Evaluating entry tier."
        },
        {
            "company_name": "Apex CleanTech Labs",
            "contact_name": "Harrison Forde",
            "email": "hforde@apexcleantech-demo.com",
            "phone": "+1 (555) 456-1133",
            "industry": "CleanTech / Energy",
            "company_size": "51-200",
            "location": "Denver, CO",
            "lead_source": "Partner Network",
            "required_services": "Kubernetes & Container Infrastructure, Data Analytics",
            "estimated_monthly_budget": 4200.0,
            "current_infra": "Fragmented Docker containers on standalone VMs",
            "pain_points": "Lack of centralized container telemetry and autoscaling for IoT sensor streams.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Tech Evaluator / IT Director",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Contacted",
            "notes": "Technical review scheduled for next week."
        },
        {
            "company_name": "Metro Dispatch Fleet",
            "contact_name": "Frank Castle",
            "email": "fcastle@metrodispatch-demo.com",
            "phone": "+1 (555) 567-2244",
            "industry": "Transportation",
            "company_size": "11-50",
            "location": "Phoenix, AZ",
            "lead_source": "Inbound Email",
            "required_services": "Hosted Virtual Desktops (DaaS)",
            "estimated_monthly_budget": 1200.0,
            "current_infra": "On-premise terminal server with outdated licensing",
            "pain_points": "Microsoft RDS CAL licensing renewal quote too high; looking for managed desktop alternative.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Sent competitive pricing matrix."
        },
        {
            "company_name": "SwiftEd EdTech",
            "contact_name": "Tara Knowles",
            "email": "tknowles@swifted-demo.com",
            "phone": "+1 (555) 678-3355",
            "industry": "Education / EdTech",
            "company_size": "1-10",
            "location": "Minneapolis, MN",
            "lead_source": "Website",
            "required_services": "Public Cloud & AWS Services",
            "estimated_monthly_budget": 350.0,
            "current_infra": "Free tier AWS and Heroku",
            "pain_points": "Free credits expiring; exploring minimal cost production hosting.",
            "purchase_timeline": "Exploratory (>6 months)",
            "decision_maker_authority": "Influencer / Tech Lead",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Disqualified",
            "notes": "Budget below minimum commercial threshold ($500/mo). Disqualified for now."
        },
        {
            "company_name": "Delta Security Consulting",
            "contact_name": "Nathan Drake",
            "email": "ndrake@deltasec-demo.com",
            "phone": "+1 (555) 789-4466",
            "industry": "Cybersecurity",
            "company_size": "11-50",
            "location": "Washington, DC",
            "lead_source": "Referral",
            "required_services": "Private Cloud Hosting, Managed Security",
            "estimated_monthly_budget": 2800.0,
            "current_infra": "Self-managed co-location in Northern Virginia",
            "pain_points": "Datacenter raising colocation rack fees by 40%; need managed private cloud hosting.",
            "purchase_timeline": "1-3 Months",
            "decision_maker_authority": "Final Decision Maker",
            "sales_owner": "Priya Sharma",
            "qualification_status": "Qualified",
            "notes": "Good prospect. Requesting private cloud specs."
        }
    ]

    lead_objs = []
    for l_data in leads_data:
        score, prio, breakdown, next_action = calculate_lead_score(l_data)
        l_data["lead_score"] = score
        l_data["priority"] = prio
        l_data["scoring_breakdown"] = breakdown
        l_data["recommended_next_action"] = next_action
        lead_obj = Lead(**l_data)
        db.add(lead_obj)
        lead_objs.append(lead_obj)
    db.commit()

    # 5. Seed Opportunities (12 opportunities across all 8 stages)
    # Stages: New, Contacted, Discovery, Qualified, Solution Proposed, Negotiation, Closed Won, Closed Lost
    opps_data = [
        {
            "name": "Pinnacle Accounting - Tax Season Cloud Hosting",
            "lead_id": lead_objs[0].id,
            "account_id": None,
            "expected_deal_value": 19200.0,
            "mrr": 1600.0,
            "one_time_value": 1500.0,
            "probability": 75,
            "expected_close_date": "2026-10-31",
            "stage": "Negotiation",
            "proposed_service": "Accounting & Tax Application Hosting",
            "competitor": "Right Networks / Local MSP",
            "next_action": "Review final MSA contract and schedule onboarding kickoff call",
            "win_loss_reason": None,
            "notes": "Decision maker approved pricing; requested custom SLA clause for 99.9% uptime during tax season.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "QuantaBio - Dedicated AI GPU Cluster",
            "lead_id": lead_objs[1].id,
            "account_id": None,
            "expected_deal_value": 114000.0,
            "mrr": 9500.0,
            "one_time_value": 5000.0,
            "probability": 60,
            "expected_close_date": "2026-11-15",
            "stage": "Solution Proposed",
            "proposed_service": "GPU Compute for AI Workloads",
            "competitor": "Lambda Labs / AWS EC2 P4d",
            "next_action": "Present benchmarking comparison and reservation terms to VP of Engineering",
            "win_loss_reason": None,
            "notes": "Customer excited about zero preemption and dedicated InfiniBand networking.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "StreamPay - AWS Cloud & Database Modernization",
            "lead_id": lead_objs[2].id,
            "account_id": None,
            "expected_deal_value": 62400.0,
            "mrr": 5200.0,
            "one_time_value": 8000.0,
            "probability": 50,
            "expected_close_date": "2026-11-30",
            "stage": "Qualified",
            "proposed_service": "AWS Migration & Cloud Assessment",
            "competitor": "In-house DevOps team",
            "next_action": "Run Cloud Fit Assessment and prepare architectural migration roadmap",
            "win_loss_reason": None,
            "notes": "PCI-DSS audit target driving deadline. Need database sizing verification.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "OmniRetail - EOL CentOS Infrastructure Migration",
            "lead_id": lead_objs[4].id,
            "account_id": None,
            "expected_deal_value": 78000.0,
            "mrr": 6500.0,
            "one_time_value": 6000.0,
            "probability": 70,
            "expected_close_date": "2026-10-28",
            "stage": "Negotiation",
            "proposed_service": "Infrastructure as a Service (IaaS)",
            "competitor": "Rackspace",
            "next_action": "Send revised proposal with complimentary 1-month staging environment",
            "win_loss_reason": None,
            "notes": "Client requested payment terms net-30.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Vanguard FP - Expansion 15 Tax Seats & Security",
            "lead_id": None,
            "account_id": account_objs[0].id,
            "expected_deal_value": 24000.0,
            "mrr": 2000.0,
            "one_time_value": 1000.0,
            "probability": 90,
            "expected_close_date": "2026-10-25",
            "stage": "Negotiation",
            "proposed_service": "Accounting & Tax Application Hosting",
            "competitor": "None (Existing Account)",
            "next_action": "Execute addendum for 15 seasonal seats and EDR bundle",
            "win_loss_reason": None,
            "notes": "Existing happy account expanding for Q4.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "HealthPulse - 8x H100 Cluster Expansion",
            "lead_id": None,
            "account_id": account_objs[1].id,
            "expected_deal_value": 144000.0,
            "mrr": 12000.0,
            "one_time_value": 10000.0,
            "probability": 100,
            "expected_close_date": "2026-10-05",
            "stage": "Closed Won",
            "proposed_service": "GPU Compute for AI Workloads",
            "competitor": "CoreWeave",
            "next_action": "Provision hardware and verify Slurm scheduler deployment",
            "win_loss_reason": "Won on dedicated customer support, HIPAA compliance attestation, and transparent pricing without hidden egress fees.",
            "notes": "Signed 24-month contract expansion! Booked into Closed Won revenue.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Summit CPA - Annual 12-Month Renewal & Drake Add-on",
            "lead_id": None,
            "account_id": account_objs[6].id,
            "expected_deal_value": 26400.0,
            "mrr": 2200.0,
            "one_time_value": 500.0,
            "probability": 100,
            "expected_close_date": "2026-09-01",
            "stage": "Closed Won",
            "proposed_service": "Accounting & Tax Application Hosting",
            "competitor": "None",
            "next_action": "Completed onboarding of new Drake module",
            "win_loss_reason": "Won on flawless tax season uptime in prior year.",
            "notes": "Successfully renewed and expanded.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Legacy Manufacturing - Cloud Lift & Shift",
            "lead_id": None,
            "account_id": None,
            "expected_deal_value": 36000.0,
            "mrr": 3000.0,
            "one_time_value": 4000.0,
            "probability": 0,
            "expected_close_date": "2026-09-15",
            "stage": "Closed Lost",
            "proposed_service": "Private Cloud Hosting",
            "competitor": "Internal On-Premise Refurbishment",
            "next_action": "Archive lead; re-contact in 12 months when hardware reaches end of support",
            "win_loss_reason": "Lost to status quo: Client CFO chose to buy refurbished on-prem servers due to CapEx depreciation preferences.",
            "notes": "Valuable learning on emphasizing ongoing operational risk vs upfront hardware cost.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Precision CPA - Multi-User QuickBooks Hosting",
            "lead_id": lead_objs[5].id,
            "account_id": None,
            "expected_deal_value": 10200.0,
            "mrr": 850.0,
            "one_time_value": 600.0,
            "probability": 40,
            "expected_close_date": "2026-11-10",
            "stage": "Discovery",
            "proposed_service": "Accounting & Tax Application Hosting",
            "competitor": "Swizznet",
            "next_action": "Conduct remote software walkthrough with Managing Partner",
            "win_loss_reason": None,
            "notes": "Discovered need for SmartVault document storage integration.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Cognitive Robotics - Dedicated GPU Acceleration",
            "lead_id": lead_objs[9].id,
            "account_id": None,
            "expected_deal_value": 132000.0,
            "mrr": 11000.0,
            "one_time_value": 6000.0,
            "probability": 45,
            "expected_close_date": "2026-11-20",
            "stage": "Discovery",
            "proposed_service": "GPU Compute for AI Workloads",
            "competitor": "RunPod / Paperspace",
            "next_action": "Deliver sample benchmark data and hardware reservation agreement",
            "win_loss_reason": None,
            "notes": "Engineering team impressed with low-latency NVMe scratch volumes.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Horizon Insurance - Database Modernization Migration",
            "lead_id": lead_objs[8].id,
            "account_id": None,
            "expected_deal_value": 93600.0,
            "mrr": 7800.0,
            "one_time_value": 12000.0,
            "probability": 25,
            "expected_close_date": "2026-12-15",
            "stage": "Contacted",
            "proposed_service": "Database Modernization",
            "competitor": "Microsoft Azure Direct",
            "next_action": "Schedule consultative discovery with VP of IT",
            "win_loss_reason": None,
            "notes": "Large potential deal. Need to highlight TCO savings vs Azure.",
            "sales_owner": "Priya Sharma"
        },
        {
            "name": "Delta Security - Private Cloud Colocation Exit",
            "lead_id": lead_objs[15].id,
            "account_id": None,
            "expected_deal_value": 33600.0,
            "mrr": 2800.0,
            "one_time_value": 3000.0,
            "probability": 30,
            "expected_close_date": "2026-11-30",
            "stage": "Contacted",
            "proposed_service": "Private Cloud Hosting",
            "competitor": "Equinix",
            "next_action": "Send technical datacenter specification sheet and compliance certifications",
            "win_loss_reason": None,
            "notes": "Customer needs to exit current datacenter lease by end of year.",
            "sales_owner": "Priya Sharma"
        }
    ]

    opp_objs = []
    for o_data in opps_data:
        opp = Opportunity(**o_data)
        db.add(opp)
        opp_objs.append(opp)
    db.commit()

    # Add stage history for opportunities
    for opp in opp_objs:
        db.add(OpportunityStageHistory(
            opportunity_id=opp.id,
            from_stage="New",
            to_stage=opp.stage,
            probability=opp.probability,
            changed_at=datetime.datetime.utcnow() - datetime.timedelta(days=7),
            notes="Initial stage progression recorded during qualification"
        ))
    db.commit()

    # 6. Seed Activities (25 activities: calls, emails, demos, meetings, follow-ups)
    activities_data = [
        {
            "related_type": "lead",
            "related_id": lead_objs[0].id,
            "related_title": "Pinnacle Accounting Partners LLP",
            "activity_type": "Call",
            "subject": "Introductory Discovery Call with Gregory Ross",
            "date_time": "2026-10-08 14:00",
            "due_date": "2026-10-08",
            "outcome": "Discussed current server lockups during tax season. Gregory confirmed budget of $1,600/mo and immediate timeline.",
            "status": "Completed",
            "next_action": "Send formal Cloud Fit Assessment and proposal by Friday.",
            "notes": "Very receptive to managed backups and multi-user remote desktop."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[1].id,
            "related_title": "QuantaBio Therapeutics",
            "activity_type": "Meeting",
            "subject": "Deep-Dive Technical Architecture Review",
            "date_time": "2026-10-10 11:00",
            "due_date": "2026-10-10",
            "outcome": "Reviewed PyTorch training pipeline requirements with Dr. Rostova. Confirmed requirement for 4x A100 80GB reserved nodes.",
            "status": "Completed",
            "next_action": "Submit detailed quote with guaranteed 99.99% compute SLA.",
            "notes": "Competitor Lambda Labs has 6-week waitlist for instances."
        },
        {
            "related_type": "opportunity",
            "related_id": opp_objs[0].id,
            "related_title": "Pinnacle Accounting - Tax Season Cloud Hosting",
            "activity_type": "Proposal Follow-up",
            "subject": "Proposal Review & SLA Clause Clarification",
            "date_time": "2026-10-12 15:30",
            "due_date": "2026-10-12",
            "outcome": None,
            "status": "Pending",
            "next_action": "Walk through revised Section 4 (tax season emergency hotline guarantee)",
            "notes": "Key milestone to secure contract signature before month-end."
        },
        {
            "related_type": "opportunity",
            "related_id": opp_objs[1].id,
            "related_title": "QuantaBio - Dedicated AI GPU Cluster",
            "activity_type": "Product Demonstration",
            "subject": "Live GPU Benchmarking & Kubernetes Dashboard Demo",
            "date_time": "2026-10-14 10:00",
            "due_date": "2026-10-14",
            "outcome": None,
            "status": "Pending",
            "next_action": "Demonstrate automated pod restart and NVMe scratch read IOPS performance",
            "notes": "Invite lead machine learning engineer to the demonstration session."
        },
        {
            "related_type": "account",
            "related_id": account_objs[3].id,
            "related_title": "Meridian Law Group",
            "activity_type": "Call",
            "subject": "URGENT: Executive Escalation on VPN Latency & Renewal",
            "date_time": "2026-10-09 09:00",
            "due_date": "2026-10-09",
            "outcome": "Client voicemail left. No callback received yet. Escalated to technical support manager.",
            "status": "Overdue",
            "next_action": "Have VP of Customer Success call Eleanor Vance directly today.",
            "notes": "At-risk account requiring immediate attention."
        },
        {
            "related_type": "account",
            "related_id": account_objs[0].id,
            "related_title": "Vanguard Financial Partners",
            "activity_type": "Renewal Discussion",
            "subject": "2-Year Contract Lock & 15 Seasonal Seats Addendum",
            "date_time": "2026-10-13 14:00",
            "due_date": "2026-10-13",
            "outcome": None,
            "status": "Pending",
            "next_action": "Finalize multi-year discount matrix (5% off for 2-year prepayment)",
            "notes": "Client champion Robert Sterling expressed strong support."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[2].id,
            "related_title": "StreamPay FinTech",
            "activity_type": "Email",
            "subject": "AWS Well-Architected Framework Case Study Sent",
            "date_time": "2026-10-07 16:20",
            "due_date": "2026-10-07",
            "outcome": "Email delivered and opened. Vikram replied requesting call for next Tuesday.",
            "status": "Completed",
            "next_action": "Send calendar invite for 45-minute consultative session.",
            "notes": "Highlighted PCI-DSS Level 1 compliance architecture."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[4].id,
            "related_title": "OmniRetail Global",
            "activity_type": "Meeting",
            "subject": "Executive Presentation: CentOS 7 EOL Cutover Strategy",
            "date_time": "2026-10-09 15:00",
            "due_date": "2026-10-09",
            "outcome": "Presented zero-downtime phased migration plan. IT Director approved proposed staging window.",
            "status": "Completed",
            "next_action": "Finalize commercial contract by Oct 20.",
            "notes": "Client was relieved we handle OS patching and database replication."
        },
        {
            "related_type": "account",
            "related_id": account_objs[5].id,
            "related_title": "Apex Manufacturing Solutions",
            "activity_type": "Renewal Discussion",
            "subject": "Annual Contract Renewal & DRaaS Pitch",
            "date_time": "2026-10-11 11:00",
            "due_date": "2026-10-11",
            "outcome": None,
            "status": "Overdue",
            "next_action": "Reschedule call with David Miller; present competitive pricing against Azure proposal",
            "notes": "Competitor pitched lower upfront price but excluded bandwidth and backup licensing."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[5].id,
            "related_title": "Precision CPA Advisors",
            "activity_type": "Call",
            "subject": "Discovery Call: Multi-User QuickBooks Desktop Hosting",
            "date_time": "2026-10-15 13:00",
            "due_date": "2026-10-15",
            "outcome": None,
            "status": "Pending",
            "next_action": "Explain automated snapshot backup process and show sample desktop portal",
            "notes": "Small deal ($850/mo) but quick sales cycle expected."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[3].id,
            "related_title": "Heritage Law Associates",
            "activity_type": "Email",
            "subject": "Follow-up with Legal Cloud Security Brochure",
            "date_time": "2026-10-06 10:30",
            "due_date": "2026-10-06",
            "outcome": "Sent security specs and sample SLA document.",
            "status": "Completed",
            "next_action": "Follow up via telephone if no reply within 4 business days.",
            "notes": "Focus on data retention and SOC 2 Type II attestation."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[7].id,
            "related_title": "Velocity Logistics Tech",
            "activity_type": "LinkedIn",
            "subject": "Connect & Message Amanda Cruz",
            "date_time": "2026-10-11 14:00",
            "due_date": "2026-10-11",
            "outcome": "Connection request accepted. Sent copy of Cloud Migration Assessment Guide.",
            "status": "Completed",
            "next_action": "Queue follow-up note in 3 days.",
            "notes": "Noticed company just posted 3 openings for AWS DevOps engineers."
        },
        {
            "related_type": "account",
            "related_id": account_objs[4].id,
            "related_title": "CloudNine SaaS Corp",
            "activity_type": "Meeting",
            "subject": "Quarterly Business Review (QBR)",
            "date_time": "2026-10-08 11:00",
            "due_date": "2026-10-08",
            "outcome": "Confirmed 99.995% uptime over past 90 days. Discussed plans for upcoming Multi-Region DR setup.",
            "status": "Completed",
            "next_action": "Draft engineering scope for AWS Cross-Region replication.",
            "notes": "Champion Kevin O'Connor volunteered to serve as a customer case study reference."
        },
        {
            "related_type": "opportunity",
            "related_id": opp_objs[3].id,
            "related_title": "OmniRetail - EOL CentOS Infrastructure Migration",
            "activity_type": "Call",
            "subject": "Pre-Contract Commercial Alignment",
            "date_time": "2026-10-16 16:00",
            "due_date": "2026-10-16",
            "outcome": None,
            "status": "Pending",
            "next_action": "Confirm signature date before October 28 cutover freeze",
            "notes": "Deal value $78,000 / year."
        },
        {
            "related_type": "opportunity",
            "related_id": opp_objs[2].id,
            "related_title": "StreamPay - AWS Cloud & Database Modernization",
            "activity_type": "Meeting",
            "subject": "Database Modernization Discovery & Sizing Review",
            "date_time": "2026-10-17 11:30",
            "due_date": "2026-10-17",
            "outcome": None,
            "status": "Pending",
            "next_action": "Review current MySQL schema and evaluate Amazon Aurora Multi-AZ migration path",
            "notes": "Involve Senior Cloud Architect on the call."
        },
        {
            "related_type": "account",
            "related_id": account_objs[1].id,
            "related_title": "HealthPulse Analytics",
            "activity_type": "Call",
            "subject": "Check-in on Newly Provisioned H100 Cluster",
            "date_time": "2026-10-07 15:00",
            "due_date": "2026-10-07",
            "outcome": "Dr. Chen reported model training times reduced by 62%. Client extremely pleased.",
            "status": "Completed",
            "next_action": "Schedule monthly usage and IOPS review.",
            "notes": "Great validation of GPU compute tier value proposition."
        },
        {
            "related_type": "account",
            "related_id": account_objs[2].id,
            "related_title": "LogisticsOne Global",
            "activity_type": "Meeting",
            "subject": "Post-Migration Check-in & Aurora Database Pitch",
            "date_time": "2026-10-18 14:00",
            "due_date": "2026-10-18",
            "outcome": None,
            "status": "Pending",
            "next_action": "Present TCO comparison between current MySQL replica setup and Aurora Serverless",
            "notes": "Expansion opportunity estimated at $2,000 MRR."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[9].id,
            "related_title": "Cognitive Robotics Inc.",
            "activity_type": "Meeting",
            "subject": "GPU Workstation vs Cloud Cluster Consultation",
            "date_time": "2026-10-19 13:00",
            "due_date": "2026-10-19",
            "outcome": None,
            "status": "Pending",
            "next_action": "Demonstrate cost per FLOP comparison between on-prem gaming rigs and enterprise cloud GPUs",
            "notes": "Show how avoiding office power outages accelerates their seed fundraising demo."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[10].id,
            "related_title": "BlueRidge Accounting LLC",
            "activity_type": "Product Demonstration",
            "subject": "QuickBooks Multi-User Remote Access Walkthrough",
            "date_time": "2026-10-13 10:00",
            "due_date": "2026-10-13",
            "outcome": None,
            "status": "Pending",
            "next_action": "Show Donna Martin how easily remote accountants can open company files simultaneously",
            "notes": "Target close within 14 days."
        },
        {
            "related_type": "account",
            "related_id": account_objs[6].id,
            "related_title": "Summit CPA & Business Advisors",
            "activity_type": "Email",
            "subject": "Confirmation of Drake Tax Module Activation",
            "date_time": "2026-10-04 09:30",
            "due_date": "2026-10-04",
            "outcome": "Sent license activation keys and scheduled user training webinar.",
            "status": "Completed",
            "next_action": "Ensure all 8 seasonal users are logged in by Friday.",
            "notes": "Expansion revenue activated."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[8].id,
            "related_title": "Horizon Insurance Group",
            "activity_type": "Call",
            "subject": "Initial SQL Server Migration Assessment Call",
            "date_time": "2026-10-05 11:00",
            "due_date": "2026-10-05",
            "outcome": "Bradley Cooper confirmed SQL Server 2014 end-of-support is primary concern. Sent questionnaire.",
            "status": "Completed",
            "next_action": "Review questionnaire results once returned.",
            "notes": "Large enterprise account ($7,800/mo budget)."
        },
        {
            "related_type": "account",
            "related_id": account_objs[9].id,
            "related_title": "Beacon Freight Solutions",
            "activity_type": "Call",
            "subject": "Annual Contract Review & Desktop Experience Feedback",
            "date_time": "2026-09-22 14:00",
            "due_date": "2026-09-22",
            "outcome": "Thomas Wright shared feedback that remote desktop performance is solid. Interested in dispatch server migration.",
            "status": "Completed",
            "next_action": "Prepare renewal quote with bundled IaaS server discount.",
            "notes": "Renewal due in November."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[13].id,
            "related_title": "Metro Dispatch Fleet",
            "activity_type": "Email",
            "subject": "Microsoft RDS vs Hosted Virtual Desktop Cost Analysis",
            "date_time": "2026-10-09 11:45",
            "due_date": "2026-10-09",
            "outcome": "Sent comprehensive TCO spreadsheet comparing RDS CAL renewals to our managed per-user model.",
            "status": "Completed",
            "next_action": "Follow up with phone call on Monday.",
            "notes": "Savings demonstrated: 22% over 3-year term."
        },
        {
            "related_type": "lead",
            "related_id": lead_objs[6].id,
            "related_title": "Nexus MedTech Systems",
            "activity_type": "LinkedIn",
            "subject": "Shared Healthcare Cloud Compliance Whitepaper",
            "date_time": "2026-10-03 16:00",
            "due_date": "2026-10-03",
            "outcome": "Dr. Kevin Huang acknowledged receipt and shared document with their compliance officer.",
            "status": "Completed",
            "next_action": "Check in after their bi-weekly compliance committee meeting.",
            "notes": "Longer sales cycle expected (healthcare sector)."
        },
        {
            "related_type": "opportunity",
            "related_id": opp_objs[4].id,
            "related_title": "Vanguard FP - Expansion 15 Tax Seats & Security",
            "activity_type": "Call",
            "subject": "Addendum Final Sign-off Discussion",
            "date_time": "2026-10-15 15:00",
            "due_date": "2026-10-15",
            "outcome": None,
            "status": "Pending",
            "next_action": "Obtain DocuSign execution from Robert Sterling",
            "notes": "Closing probability 90%."
        }
    ]

    for act_data in activities_data:
        db.add(Activity(**act_data))
    db.commit()

    # 7. Seed Renewals (6 renewals across 30d, 60d, 90d, overdue, at-risk)
    renewals_data = [
        {
            "account_id": account_objs[3].id,  # Meridian Law
            "contract_name": "Hosted Desktops & Security Agreement - 35 Seats",
            "renewal_date": "2026-10-25",  # Overdue / due within 15 days
            "estimated_value": 32000.0,
            "status": "At Risk",
            "risk_category": "Critical",
            "last_contact_date": "2026-09-12",
            "next_follow_up": "2026-10-12",
            "renewal_owner": "Priya Sharma",
            "notes": "Client complained about latency. Urgent executive intervention needed before contract lapses."
        },
        {
            "account_id": account_objs[0].id,  # Vanguard Financial
            "contract_name": "Accounting Cloud & Tax Software Enterprise Suite",
            "renewal_date": "2026-11-01",  # Due within 30 days
            "estimated_value": 48000.0,
            "status": "In Negotiation",
            "risk_category": "Low",
            "last_contact_date": "2026-10-02",
            "next_follow_up": "2026-10-13",
            "renewal_owner": "Priya Sharma",
            "notes": "2-year renewal proposal presented with 15 seasonal seats expansion."
        },
        {
            "account_id": account_objs[5].id,  # Apex Manufacturing
            "contract_name": "Dedicated IaaS ERP Production Cluster",
            "renewal_date": "2026-11-15",  # Due within 60 days
            "estimated_value": 42000.0,
            "status": "In Negotiation",
            "risk_category": "Medium",
            "last_contact_date": "2026-10-01",
            "next_follow_up": "2026-10-16",
            "renewal_owner": "Priya Sharma",
            "notes": "Competitor pitched Azure. Need to demonstrate our managed backup and 24/7 patching value."
        },
        {
            "account_id": account_objs[9].id,  # Beacon Freight
            "contract_name": "Hosted Virtual Desktops Fleet License",
            "renewal_date": "2026-11-20",  # Due within 60 days
            "estimated_value": 18000.0,
            "status": "Upcoming",
            "risk_category": "Low",
            "last_contact_date": "2026-09-18",
            "next_follow_up": "2026-10-22",
            "renewal_owner": "Priya Sharma",
            "notes": "Reviewing annual cost vs internal hardware replacement. High probability of renewal."
        },
        {
            "account_id": account_objs[1].id,  # HealthPulse
            "contract_name": "Private Cloud & AI GPU Compute Infrastructure",
            "renewal_date": "2026-12-15",  # Due within 90 days
            "estimated_value": 96000.0,
            "status": "Upcoming",
            "risk_category": "Low",
            "last_contact_date": "2026-09-28",
            "next_follow_up": "2026-11-10",
            "renewal_owner": "Priya Sharma",
            "notes": "Customer expanding with additional H100 nodes. Early renewal expected."
        },
        {
            "account_id": account_objs[6].id,  # Summit CPA
            "contract_name": "Accounting & Tax Software Annual Cloud License",
            "renewal_date": "2027-09-01",  # Renewed
            "estimated_value": 26400.0,
            "status": "Renewed",
            "risk_category": "Low",
            "last_contact_date": "2026-10-07",
            "next_follow_up": "2027-01-15",
            "renewal_owner": "Priya Sharma",
            "notes": "Successfully renewed for another full year with Drake expansion module."
        }
    ]

    for ren_data in renewals_data:
        db.add(Renewal(**ren_data))
    db.commit()

    # 8. Seed Proposals (4 realistic proposals)
    proposals_data = [
        {
            "reference": "CSP-2026-001",
            "customer_name": "Pinnacle Accounting Partners LLP",
            "contact_name": "Gregory Ross",
            "contact_email": "gross@pinnacle-acct-demo.com",
            "lead_id": lead_objs[0].id,
            "opportunity_id": opp_objs[0].id,
            "account_id": None,
            "recommended_services": "Accounting & Tax Application Hosting, Hosted Virtual Desktops",
            "scope_and_assumptions": "Migration of QuickBooks Enterprise 2024 and Drake Tax 2023/2024 multi-user environments. Provisioning 25 concurrent hosted desktops with automated nightly snapshot backups and SOC2 compliance monitoring. Client provides valid software licenses.",
            "business_benefits": "Guaranteed 99.9% uptime during tax season, anytime-anywhere remote access for staff, elimination of on-premise hardware failure risks, and 24/7 dedicated tax support.",
            "one_time_charges": 1500.0,
            "recurring_monthly_charges": 1600.0,
            "contract_duration_months": 12,
            "important_exclusions": "Software application licensing fees (client brings own QuickBooks/Drake licenses); local printer hardware repair.",
            "status": "Ready for Review",
            "expiry_date": "2026-11-15",
            "disclaimer": "All sample pricing is illustrative demonstration data and requires final technical validation.",
            "notes": "Awaiting final sign-off on tax season uptime SLA rider."
        },
        {
            "reference": "CSP-2026-002",
            "customer_name": "QuantaBio Therapeutics",
            "contact_name": "Dr. Elena Rostova",
            "contact_email": "erostova@quantabio-demo.ai",
            "lead_id": lead_objs[1].id,
            "opportunity_id": opp_objs[1].id,
            "account_id": None,
            "recommended_services": "GPU Compute for AI Workloads, Kubernetes & Container Infrastructure",
            "scope_and_assumptions": "Dedicated reservation of 4x NVIDIA A100 (80GB VRAM) instances with InfiniBand 200Gbps interconnect and 10TB NVMe scratch storage. Includes managed Kubernetes control plane and pre-configured CUDA runtime.",
            "business_benefits": "Zero preemption interruption during multi-day model training, 4x faster inter-node synchronization, predictable flat monthly billing, and HIPAA compliant isolated network perimeter.",
            "one_time_charges": 5000.0,
            "recurring_monthly_charges": 9500.0,
            "contract_duration_months": 12,
            "important_exclusions": "Third-party proprietary AI model weights; custom machine learning algorithmic debugging.",
            "status": "Sent",
            "expiry_date": "2026-11-20",
            "disclaimer": "All sample pricing is illustrative demonstration data and requires final technical validation.",
            "notes": "Sent to VP of Engineering and CFO for signature."
        },
        {
            "reference": "CSP-2026-003",
            "customer_name": "OmniRetail Global",
            "contact_name": "Daniel Carter",
            "contact_email": "dcarter@omniretail-demo.com",
            "lead_id": lead_objs[4].id,
            "opportunity_id": opp_objs[3].id,
            "account_id": None,
            "recommended_services": "Infrastructure as a Service (IaaS), Application Modernization",
            "scope_and_assumptions": "Phased migration of 14 legacy CentOS 7 servers to enterprise Rocky Linux IaaS cluster with automated horizontal auto-scaling and 10Gbps private network backplane. Includes 30-day staging sandbox.",
            "business_benefits": "Resolution of CentOS 7 EOL security vulnerabilities, 40% reduction in web latency during holiday sales peaks, and 24/7 infrastructure health monitoring.",
            "one_time_charges": 6000.0,
            "recurring_monthly_charges": 6500.0,
            "contract_duration_months": 12,
            "important_exclusions": "Application-level database redesign or third-party payment gateway integration code.",
            "status": "Ready for Review",
            "expiry_date": "2026-10-31",
            "disclaimer": "All sample pricing is illustrative demonstration data and requires final technical validation.",
            "notes": "Client requested Net-30 payment terms."
        },
        {
            "reference": "CSP-2026-004",
            "customer_name": "HealthPulse Analytics",
            "contact_name": "Dr. Sarah Chen",
            "contact_email": "schen@healthpulse-demo.org",
            "lead_id": None,
            "opportunity_id": opp_objs[5].id,
            "account_id": account_objs[1].id,
            "recommended_services": "GPU Compute for AI Workloads (8x H100 Cluster Expansion)",
            "scope_and_assumptions": "Expansion addendum for 8x NVIDIA H100 GPU cluster with 400Gbps Quantum-2 InfiniBand and 30TB NVMe storage. Multi-year lock at preferred client tier.",
            "business_benefits": "Up to 3.2x faster training throughput for generative biomedical models, continuous reserved capacity, and SOC 2 Type II audit report provided.",
            "one_time_charges": 10000.0,
            "recurring_monthly_charges": 12000.0,
            "contract_duration_months": 24,
            "important_exclusions": "End-user clinical diagnostics application code.",
            "status": "Accepted",
            "expiry_date": "2026-10-05",
            "disclaimer": "All sample pricing is illustrative demonstration data and requires final technical validation.",
            "notes": "Executed contract! Transitioned to onboarding."
        }
    ]

    for p_data in proposals_data:
        db.add(Proposal(**p_data))
    db.commit()

    # 9. Seed Assessments (the 3 Signature Scenarios)
    for preset_key in ["accounting_firm", "startup_aws", "ai_gpu"]:
        preset = DEMO_PRESETS[preset_key]
        eval_result = evaluate_cloud_fit(preset)
        assessment_record = Assessment(
            customer_name=eval_result["customer_name"],
            industry=eval_result["industry"],
            company_size=eval_result["company_size"],
            existing_infra=eval_result["existing_infra"],
            business_problem=eval_result["business_problem"],
            workload_type=eval_result["workload_type"],
            approx_monthly_budget=eval_result["approx_monthly_budget"],
            data_sensitivity=eval_result["data_sensitivity"],
            expected_scalability=eval_result["expected_scalability"],
            availability_requirements=eval_result["availability_requirements"],
            migration_urgency=eval_result["migration_urgency"],
            preferred_deployment=eval_result["preferred_deployment"],
            recommended_category=eval_result["recommended_category"],
            recommended_services=json.dumps(eval_result["recommended_services"]),
            fit_rationale=eval_result["fit_rationale"],
            business_benefits=json.dumps(eval_result["business_benefits"]),
            assumptions=eval_result["assumptions"],
            trade_offs=eval_result["trade_offs"],
            next_questions=json.dumps(eval_result["next_questions"]),
            missing_info=eval_result["missing_info"],
            estimated_tier=eval_result["estimated_tier"]
        )
        db.add(assessment_record)
    db.commit()

    return {
        "status": "success",
        "message": "Demo database successfully seeded with 16 leads, 10 accounts, 12 opportunities, 25 activities, 6 renewals, 4 proposals, and 3 consultative scenarios.",
        "counts": {
            "leads": len(leads_data),
            "accounts": len(accounts_data),
            "opportunities": len(opps_data),
            "activities": len(activities_data),
            "renewals": len(renewals_data),
            "proposals": len(proposals_data),
            "services": len(services_data)
        }
    }
