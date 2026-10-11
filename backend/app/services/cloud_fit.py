from typing import Dict, Any, List

DEMO_PRESETS = {
    "accounting_firm": {
        "customer_name": "Apex Tax & Accounting Advisory LLC",
        "industry": "Accounting & Financial Services",
        "company_size": "11-50",
        "existing_infra": "Aging On-Premise Windows Server in office closet",
        "business_problem": "Tax season remote access lags; partner concerns over data loss, ransomware risks, and lack of nightly encrypted offsite backups.",
        "workload_type": "Accounting & Tax Software (QuickBooks Enterprise, Drake, Lacerte)",
        "approx_monthly_budget": 1200.0,
        "data_sensitivity": "High (Financial records, SSNs, Client PII)",
        "expected_scalability": "Predictable seasonal surges (Jan-April) requiring flexible concurrent user licenses",
        "availability_requirements": "99.9% uptime during business hours with dedicated phone support",
        "migration_urgency": "Immediate (<30 days, prior to tax filing cycle)",
        "preferred_deployment": "Fully Managed Cloud Hosting"
    },
    "startup_aws": {
        "customer_name": "FinScale Technologies Inc.",
        "industry": "FinTech / SaaS",
        "company_size": "51-200",
        "existing_infra": "Single monolithic VPS with co-located MySQL database",
        "business_problem": "Frequent traffic spikes cause database lockups and API timeouts; engineers spending 30% of time firefighting server crashes instead of shipping features.",
        "workload_type": "Production Web App & High-Volume Transactional Database",
        "approx_monthly_budget": 4500.0,
        "data_sensitivity": "High (SOC 2 and PCI-DSS compliance required)",
        "expected_scalability": "Elastic auto-scaling with 5x peak surge tolerance",
        "availability_requirements": "99.99% Multi-AZ high availability with automated failover",
        "migration_urgency": "1-3 Months",
        "preferred_deployment": "Public Cloud (AWS)"
    },
    "ai_gpu": {
        "customer_name": "CognitiveVision Labs",
        "industry": "Artificial Intelligence / Healthcare Robotics",
        "company_size": "11-50",
        "existing_infra": "Consumer workstations and expensive on-demand cloud GPU spot instances",
        "business_problem": "Spot instance preemptions abort multi-day model training runs; lack of unified container orchestration slows down model deployment to edge devices.",
        "workload_type": "Distributed Deep Learning Model Training & Real-time Inference",
        "approx_monthly_budget": 8500.0,
        "data_sensitivity": "Confidential / HIPAA compliant clinical imagery",
        "expected_scalability": "High compute burstability with dedicated GPU cluster scheduling",
        "availability_requirements": "24/7 high-throughput job execution with low-latency networking",
        "migration_urgency": "1-3 Months",
        "preferred_deployment": "Dedicated GPU Compute & Kubernetes"
    }
}

def evaluate_cloud_fit(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transparent, rule-based consultative recommendation engine.
    Maps customer operational, technical, and budgetary requirements
    to appropriate cloud offerings with explainable trade-offs.
    """
    industry = str(data.get("industry", "")).lower()
    workload = str(data.get("workload_type", "")).lower()
    infra = str(data.get("existing_infra", "")).lower()
    problem = str(data.get("business_problem", "")).lower()
    deployment = str(data.get("preferred_deployment", "")).lower()
    budget = float(data.get("approx_monthly_budget", 0) or 0)
    sensitivity = str(data.get("data_sensitivity", "")).lower()
    urgency = str(data.get("migration_urgency", "")).lower()

    # Rule 1: High Compute / AI / GPU / Container workloads
    if any(k in workload or k in problem for k in ["gpu", "ai", "machine learning", "deep learning", "inference", "vision", "cuda", "model training"]):
        category = "Infrastructure & Compute"
        services = [
            "GPU Compute for Demanding AI/ML Workloads",
            "Kubernetes & Container Infrastructure",
            "Infrastructure as a Service (IaaS)"
        ]
        tier = "High-Performance Compute Tier ($5,000 - $12,000/mo)"
        rationale = (
            "The client workload demands high-density, uninterrupted hardware acceleration with fast NVMe storage "
            "and dedicated GPU allocation (NVIDIA A100/H100/L40S). Managed Kubernetes (EKS or isolated cluster) "
            "prevents spot-instance job eviction while automating containerized model serving."
        )
        benefits = [
            "Guaranteed compute availability eliminating catastrophic job preemptions",
            "Container orchestration allows seamless scale from single-node training to distributed inference",
            "Dedicated private networking avoids noisy-neighbor throughput degradation",
            "Predictable monthly spend compared to unpredictable spot pricing"
        ]
        assumptions = (
            "Client engineering team utilizes containerized environments (Docker/Kubernetes manifests); "
            "persistent model weights require attached S3-compatible or NVMe block storage."
        )
        trade_offs = (
            "Higher baseline fixed commitment than spot instances; requires upfront provisioning lead time for specialized GPU capacity."
        )
        questions = [
            "Which GPU architectures (e.g. NVIDIA H100, A100 80GB, L4) and CUDA libraries does your training stack require?",
            "What is the average dataset size per training epoch, and what are your inter-node throughput requirements?",
            "Do you require continuous 24/7 dedicated instances or scheduled batch cluster execution?",
            "What are your compliance and data residency constraints for proprietary training datasets?"
        ]
        missing_info = "Dataset ingress bandwidth requirements, distributed training framework details (PyTorch DDP / Ray / Slurm), and edge inference latencies."

    # Rule 2: Accounting / Tax / Legal / SMB Desktop & Application Hosting
    elif any(k in workload or k in problem or k in industry for k in ["accounting", "tax", "quickbooks", "drake", "lacerte", "cpa", "bookkeeping", "legal", "virtual desktop", "vdi"]):
        category = "Managed Hosting"
        services = [
            "Accounting & Tax Application Hosting",
            "Hosted Virtual Desktops (DaaS)",
            "Managed Security & Backup Services"
        ]
        tier = "Dedicated Managed SMB Tier ($800 - $2,500/mo)"
        rationale = (
            "Specialized accounting and tax desktop software (QuickBooks Enterprise, Drake, Lacerte, ProConnect) "
            "requires a high-availability Windows Server environment with multi-user concurrent access, low latency "
            "terminal services, and automated nightly SOC2/HIPAA-compliant backups, freeing partners from IT maintenance."
        )
        benefits = [
            "Anytime, anywhere remote access for remote staff and seasonal contractors",
            "Elimination of on-premise server hardware failures and ransomware vulnerability",
            "Automated daily snapshot backups with 30-day retention and rapid disaster recovery",
            "Turnkey application patching, license management, and 24/7 specialized technical support"
        ]
        assumptions = (
            "Client holds existing application software licenses (BYOL); user concurrency stays within planned tier with 10-25 seats."
        )
        trade_offs = (
            "Requires user transition from local workstation shortcuts to secure hosted virtual desktop or published application portal."
        )
        questions = [
            "How many full-time staff and seasonal tax contractors will need concurrent access at peak season?",
            "What specific tax, accounting, or document management software versions and third-party plugins are you running?",
            "What is your acceptable Recovery Point Objective (RPO) and Recovery Time Objective (RTO) in a disaster scenario?",
            "Who currently holds administrative control of your local Active Directory and network firewall?"
        ]
        missing_info = "Exact database size of current QuickBooks/Drake company files, printer/scanner redirection requirements, and multi-factor authentication (MFA) policy."

    # Rule 3: AWS Migration & Modernization (Startup / FinTech / Web Apps)
    elif "aws" in infra or "aws" in problem or "aws" in deployment or any(k in workload for k in ["saas", "fintech", "web app", "microservice", "database"]):
        category = "Public Cloud & AWS Services"
        services = [
            "AWS Migration & Cloud Assessment",
            "Application Modernization",
            "Database Modernization (Aurora / Managed RDS)",
            "Data Analytics & AI/ML Infrastructure"
        ]
        tier = "Cloud Modernization Tier ($3,000 - $8,000/mo)"
        rationale = (
            "Transitioning from single-server architecture to AWS Well-Architected Framework provides "
            "horizontal auto-scaling, managed Multi-AZ database clustering (AWS RDS/Aurora), and decoupled "
            "application services. This mitigates downtime risks and supports rapid user growth."
        )
        benefits = [
            "Achieve 99.99% availability with multi-availability-zone automated database failover",
            "Zero maintenance overhead for OS patching, storage replication, and database read replicas",
            "Enhanced security posture with AWS IAM, VPC segmentation, and SOC 2 / PCI-DSS compliance readiness",
            "Pay-for-what-you-use elasticity during marketing traffic surges"
        ]
        assumptions = (
            "Application codebase can be containerized or hosted on managed compute (ECS/EKS/EC2); "
            "client agrees to phased cutover plan with scheduled maintenance window."
        )
        trade_offs = (
            "Initial migration effort and DNS cutover required; monthly cloud spend will fluctuate dynamically with traffic."
        )
        questions = [
            "What is your current peak concurrent request volume and database write IOPS load?",
            "How is your continuous integration and deployment (CI/CD) pipeline currently structured?",
            "What are your target Recovery Time (RTO) and Recovery Point (RPO) goals for production data?",
            "Are there proprietary compliance frameworks (SOC 2, ISO 27001, HIPAA) required for your customers?"
        ]
        missing_info = "Current database storage volume in GB, static asset CDN consumption, and external third-party API dependencies."

    # Fallback / General Infrastructure & Managed IT
    else:
        category = "Infrastructure & Compute"
        services = [
            "Infrastructure as a Service (IaaS)",
            "Private Cloud Hosting",
            "Managed IT & Security Services"
        ]
        tier = "Standard Enterprise Cloud Tier ($1,500 - $4,000/mo)"
        rationale = (
            "A hybrid or dedicated private cloud infrastructure delivers predictable SLA guarantees, "
            "dedicated compute resources, and end-to-end managed monitoring without the unpredictable egress costs of public cloud."
        )
        benefits = [
            "Guaranteed resource allocation with no CPU throttling or noisy neighbor contention",
            "Proactive 24/7 infrastructure health monitoring and automated patching",
            "Predictable, transparent monthly billing with bundled bandwidth and storage"
        ]
        assumptions = "Workload requirements fit within standard x86 hypervisor resource allocations."
        trade_offs = "Less elastic than public hyperscalers for 10x sudden transient spikes."
        questions = [
            "What are your specific CPU, RAM, and SSD storage sizing targets?",
            "What operating systems and hypervisors does your technical staff currently support?",
            "Do you require managed backup, endpoint security, and disaster recovery replication?"
        ]
        missing_info = "Specific application architectural diagram and target network bandwidth consumption."

    return {
        "customer_name": data.get("customer_name", "Prospective Enterprise Client"),
        "industry": data.get("industry", "Technology"),
        "company_size": data.get("company_size", "11-50"),
        "existing_infra": data.get("existing_infra", "On-premise / Hybrid"),
        "business_problem": data.get("business_problem", ""),
        "workload_type": data.get("workload_type", ""),
        "approx_monthly_budget": budget,
        "data_sensitivity": data.get("data_sensitivity", "Standard Business Data"),
        "expected_scalability": data.get("expected_scalability", "Moderate Growth"),
        "availability_requirements": data.get("availability_requirements", "99.9%"),
        "migration_urgency": data.get("migration_urgency", "1-3 Months"),
        "preferred_deployment": data.get("preferred_deployment", category),
        "recommended_category": category,
        "recommended_services": services,
        "fit_rationale": rationale,
        "business_benefits": benefits,
        "assumptions": assumptions,
        "trade_offs": trade_offs,
        "next_questions": questions,
        "missing_info": missing_info,
        "estimated_tier": tier
    }
