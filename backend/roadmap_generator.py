"""
Roadmap Generator for AI Act Compliance
Generates SMB-executable tasks with concrete deliverables.
"""

from typing import Dict, Any, List

TASK_TEMPLATES = {
    # GOVERNANCE BASICS
    "gov_register": {
        "id": "gov_register",
        "title": "Create an AI Use-Case Register",
        "theme": "Governance basics",
        "why": "You need a single source of truth for all AI systems in your organization. This is foundational for any compliance effort and required for high-risk systems.",
        "checklist": [
            "List all AI tools and systems currently in use",
            "Document the purpose and owner for each system",
            "Note vendor names and contract details for third-party AI",
            "Record deployment dates and user counts",
            "Identify which systems process personal data"
        ],
        "deliverable": "AI Use-Case Register (spreadsheet or database)",
        "owner": "Product / Engineering",
        "effort": "S",
        "priority": "P0",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk", "Minimal risk", "Needs clarification"]
    },
    "gov_ownership": {
        "id": "gov_ownership",
        "title": "Assign AI Compliance Ownership",
        "theme": "Governance basics",
        "why": "Someone needs to be responsible for AI compliance. In SMBs, this is often a founder, CTO, or senior product manager—not necessarily a dedicated compliance hire.",
        "checklist": [
            "Designate a person accountable for AI compliance decisions",
            "Define escalation path for AI-related concerns",
            "Schedule quarterly AI review meetings",
            "Document decision-making authority and limits"
        ],
        "deliverable": "AI Governance RACI chart",
        "owner": "Founder",
        "effort": "S",
        "priority": "P0",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk", "Minimal risk", "Needs clarification"]
    },
    "gov_review_cadence": {
        "id": "gov_review_cadence",
        "title": "Establish Review Cadence",
        "theme": "Governance basics",
        "why": "AI systems change, and so do regulations. Regular reviews ensure you catch issues early and maintain compliance over time.",
        "checklist": [
            "Set quarterly review dates for AI register",
            "Define triggers for ad-hoc reviews (new AI tool, incident, regulation change)",
            "Create simple review checklist",
            "Assign review responsibilities"
        ],
        "deliverable": "AI Review Schedule (calendar entries + checklist template)",
        "owner": "Product",
        "effort": "S",
        "priority": "P1",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk", "Minimal risk"]
    },
    
    # DATA & PRIVACY
    "data_inventory": {
        "id": "data_inventory",
        "title": "Map Data Flows for AI Systems",
        "theme": "Data & privacy",
        "why": "Understanding what data your AI processes is essential for both AI Act and GDPR compliance. High-risk systems have specific data governance requirements.",
        "checklist": [
            "Document input data types for each AI system",
            "Identify personal data being processed",
            "Note data retention periods",
            "Map data flows (collection → processing → storage → deletion)",
            "Flag any sensitive/special category data"
        ],
        "deliverable": "AI Data Flow Diagram + Data Inventory",
        "owner": "Engineering",
        "effort": "M",
        "priority": "P0",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk"]
    },
    "data_lawful_basis": {
        "id": "data_lawful_basis",
        "title": "Confirm GDPR Lawful Basis for AI Processing",
        "theme": "Data & privacy",
        "why": "AI processing of personal data requires a valid GDPR lawful basis. This is foundational—without it, the AI use may be unlawful regardless of AI Act compliance.",
        "checklist": [
            "Identify lawful basis for each AI system processing personal data",
            "Document justification for chosen basis",
            "Update privacy notices if needed",
            "Review consent mechanisms if relying on consent",
            "Consider legitimate interest assessment if using that basis"
        ],
        "deliverable": "Lawful Basis Register (extension of AI Use-Case Register)",
        "owner": "Legal / Compliance",
        "effort": "M",
        "priority": "P0",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk"]
    },
    "data_dpia": {
        "id": "data_dpia",
        "title": "Conduct Data Protection Impact Assessment",
        "theme": "Data & privacy",
        "why": "High-risk AI processing likely requires a DPIA under GDPR Art. 35. This is a legal requirement, not just good practice.",
        "checklist": [
            "Identify if DPIA is required (high-risk processing, profiling, sensitive data)",
            "Describe the processing operations systematically",
            "Assess necessity and proportionality",
            "Identify and assess risks to individuals",
            "Document measures to mitigate risks",
            "Consult DPO if you have one"
        ],
        "deliverable": "DPIA Document",
        "owner": "Legal / Compliance",
        "effort": "L",
        "priority": "P0",
        "applicable_buckets": ["High-risk"]
    },
    
    # DOCUMENTATION
    "doc_technical": {
        "id": "doc_technical",
        "title": "Create Technical Documentation",
        "theme": "Documentation",
        "why": "High-risk systems require detailed technical documentation. Even for other systems, documentation helps demonstrate responsible AI practices.",
        "checklist": [
            "Document system architecture and components",
            "Describe training data sources and preparation",
            "Document model performance metrics and benchmarks",
            "Record known limitations and failure modes",
            "Include version history and change log"
        ],
        "deliverable": "Technical Documentation Package",
        "owner": "Engineering",
        "effort": "L",
        "priority": "P1",
        "applicable_buckets": ["High-risk"]
    },
    "doc_instructions": {
        "id": "doc_instructions",
        "title": "Prepare Instructions for Use",
        "theme": "Documentation",
        "why": "Deployers of high-risk AI need clear instructions. Even internal tools benefit from usage guidelines to prevent misuse.",
        "checklist": [
            "Write intended use cases and limitations",
            "Document required human oversight procedures",
            "Explain how to interpret AI outputs",
            "Describe error handling and escalation",
            "Include contact information for support"
        ],
        "deliverable": "AI Instructions for Use Document",
        "owner": "Product",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk", "Limited risk"]
    },
    "doc_risk_management": {
        "id": "doc_risk_management",
        "title": "Establish Risk Management System",
        "theme": "Documentation",
        "why": "High-risk AI systems require a documented risk management system. This is an ongoing process, not a one-time task.",
        "checklist": [
            "Identify and analyze known and foreseeable risks",
            "Estimate and evaluate risks",
            "Evaluate risks from intended use and reasonably foreseeable misuse",
            "Document risk mitigation measures",
            "Plan for residual risk management",
            "Establish testing procedures"
        ],
        "deliverable": "AI Risk Management Documentation",
        "owner": "Product / Engineering",
        "effort": "L",
        "priority": "P0",
        "applicable_buckets": ["High-risk"]
    },
    
    # HUMAN OVERSIGHT
    "oversight_design": {
        "id": "oversight_design",
        "title": "Design Human Oversight Mechanisms",
        "theme": "Human oversight",
        "why": "High-risk AI must enable effective human oversight. This means designing systems so humans can intervene, not just observe.",
        "checklist": [
            "Define what decisions require human review",
            "Design intervention points in AI workflow",
            "Create override/stop mechanisms",
            "Document how humans will be notified of AI decisions",
            "Train operators on oversight responsibilities"
        ],
        "deliverable": "Human Oversight Design Document + Training Materials",
        "owner": "Product / Engineering",
        "effort": "M",
        "priority": "P0",
        "applicable_buckets": ["High-risk"]
    },
    "oversight_training": {
        "id": "oversight_training",
        "title": "Train Staff on AI Oversight",
        "theme": "Human oversight",
        "why": "People overseeing AI need to understand the system, its limitations, and when to intervene. Untrained oversight is not effective oversight.",
        "checklist": [
            "Identify who needs AI oversight training",
            "Develop training content covering system capabilities and limits",
            "Include examples of when to override AI",
            "Document training completion",
            "Plan refresher training schedule"
        ],
        "deliverable": "AI Oversight Training Program",
        "owner": "Product",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk"]
    },
    
    # MONITORING
    "monitor_logging": {
        "id": "monitor_logging",
        "title": "Implement AI System Logging",
        "theme": "Monitoring",
        "why": "Logs enable accountability, debugging, and compliance verification. High-risk systems have specific logging requirements.",
        "checklist": [
            "Define what inputs/outputs to log",
            "Set appropriate retention periods (consider GDPR minimization)",
            "Implement secure log storage",
            "Create access controls for logs",
            "Document logging approach and justify scope"
        ],
        "deliverable": "Logging Implementation + Documentation",
        "owner": "Engineering",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk", "Limited risk"]
    },
    "monitor_performance": {
        "id": "monitor_performance",
        "title": "Set Up Performance Monitoring",
        "theme": "Monitoring",
        "why": "AI systems can degrade over time (model drift, data drift). Monitoring helps you catch issues before they become compliance problems.",
        "checklist": [
            "Define key performance metrics",
            "Set acceptable thresholds and alerts",
            "Establish monitoring dashboard or reports",
            "Create escalation process for metric breaches",
            "Schedule regular performance reviews"
        ],
        "deliverable": "AI Performance Monitoring Setup",
        "owner": "Engineering",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk"]
    },
    "monitor_incidents": {
        "id": "monitor_incidents",
        "title": "Create Incident Response Process",
        "theme": "Monitoring",
        "why": "When AI fails or causes harm, you need a clear process for response. High-risk system providers must report serious incidents.",
        "checklist": [
            "Define what constitutes an AI incident",
            "Create incident classification (severity levels)",
            "Document response procedures for each level",
            "Establish communication templates",
            "Identify regulatory reporting requirements"
        ],
        "deliverable": "AI Incident Response Plan",
        "owner": "Engineering / Compliance",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk"]
    },
    
    # VENDOR MANAGEMENT
    "vendor_inventory": {
        "id": "vendor_inventory",
        "title": "Create Third-Party AI Vendor Inventory",
        "theme": "Vendor management",
        "why": "If you use third-party AI (like OpenAI, cloud ML services), you're still responsible for compliance. You need to know what you're using.",
        "checklist": [
            "List all third-party AI services and APIs",
            "Document what each vendor provides",
            "Record contract terms and data processing agreements",
            "Note vendor compliance certifications",
            "Identify vendor contact for compliance questions"
        ],
        "deliverable": "Third-Party AI Vendor Register",
        "owner": "Product / Legal",
        "effort": "S",
        "priority": "P0",
        "applicable_buckets": ["Prohibited", "High-risk", "Limited risk", "Minimal risk"]
    },
    "vendor_assessment": {
        "id": "vendor_assessment",
        "title": "Assess Vendor AI Compliance",
        "theme": "Vendor management",
        "why": "Your compliance depends partly on your vendors. You need to verify they can support your compliance needs.",
        "checklist": [
            "Request vendor documentation on AI Act compliance",
            "Review vendor data processing terms",
            "Assess vendor's ability to provide required documentation",
            "Evaluate vendor incident response capabilities",
            "Document assessment results"
        ],
        "deliverable": "Vendor AI Compliance Assessment Report",
        "owner": "Legal / Product",
        "effort": "M",
        "priority": "P1",
        "applicable_buckets": ["High-risk"]
    },
    
    # TRANSPARENCY
    "transparency_disclosure": {
        "id": "transparency_disclosure",
        "title": "Implement AI Disclosure Mechanisms",
        "theme": "Transparency",
        "why": "Users must know when they're interacting with AI. AI-generated content must be marked. This is a direct legal requirement for limited-risk systems.",
        "checklist": [
            "Identify all user-facing AI interactions",
            "Design clear disclosure messaging",
            "Implement disclosure in UI/UX",
            "For generated content, implement marking mechanism",
            "Document disclosure approach"
        ],
        "deliverable": "AI Disclosure Implementation",
        "owner": "Product / Engineering",
        "effort": "S",
        "priority": "P0",
        "applicable_buckets": ["Limited risk", "High-risk"]
    },
    "transparency_explainability": {
        "id": "transparency_explainability",
        "title": "Provide Decision Explanations",
        "theme": "Transparency",
        "why": "For AI making decisions about people, those affected may have rights to explanation (GDPR Art. 22). Even without legal requirement, explanations build trust.",
        "checklist": [
            "Identify decisions requiring explanation",
            "Design explanation format (technical vs. plain language)",
            "Implement explanation generation",
            "Test explanations with target audience",
            "Document explanation approach"
        ],
        "deliverable": "AI Decision Explanation System",
        "owner": "Engineering / Product",
        "effort": "L",
        "priority": "P2",
        "applicable_buckets": ["High-risk"]
    }
}

# Task dependencies
DEPENDENCIES = {
    "data_dpia": ["data_inventory", "data_lawful_basis"],
    "doc_technical": ["gov_register", "data_inventory"],
    "doc_risk_management": ["gov_register", "data_inventory"],
    "oversight_training": ["oversight_design"],
    "monitor_logging": ["gov_register"],
    "vendor_assessment": ["vendor_inventory"],
    "transparency_explainability": ["transparency_disclosure"]
}


def get_applicable_tasks(bucket: str, answers: Dict[str, Any]) -> List[str]:
    """Determine which tasks apply based on classification and answers."""
    applicable = []
    
    for task_id, task in TASK_TEMPLATES.items():
        if bucket in task["applicable_buckets"]:
            applicable.append(task_id)
    
    # Add context-specific tasks
    if answers.get("q5_data_types") in ["personal_nonsensitive", "sensitive"]:
        if "data_lawful_basis" not in applicable:
            applicable.append("data_lawful_basis")
    
    if answers.get("q1_company_role") == "integrator":
        if "vendor_inventory" not in applicable:
            applicable.append("vendor_inventory")
    
    if answers.get("q9_behavior") == "generates_content":
        if "transparency_disclosure" not in applicable:
            applicable.append("transparency_disclosure")
    
    return applicable


def prioritize_tasks(tasks: List[Dict], bucket: str) -> List[Dict]:
    """Sort tasks by priority and importance for the given bucket."""
    priority_order = {"P0": 0, "P1": 1, "P2": 2}
    
    def sort_key(task):
        # High-risk gets documentation tasks prioritized
        if bucket == "High-risk" and task["theme"] == "Documentation":
            return (priority_order.get(task["priority"], 3) - 0.5, task["theme"])
        # Prohibited needs immediate governance
        if bucket == "Prohibited" and task["theme"] == "Governance basics":
            return (priority_order.get(task["priority"], 3) - 1, task["theme"])
        return (priority_order.get(task["priority"], 3), task["theme"])
    
    return sorted(tasks, key=sort_key)


def generate_roadmap(classification: Dict[str, Any], answers: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate prioritized compliance roadmap based on classification."""
    bucket = classification.get("bucket", "Minimal risk")
    
    # Get applicable task IDs
    applicable_ids = get_applicable_tasks(bucket, answers)
    
    # Build task list with dependencies
    tasks = []
    for task_id in applicable_ids:
        if task_id in TASK_TEMPLATES:
            task = TASK_TEMPLATES[task_id].copy()
            task["dependencies"] = DEPENDENCIES.get(task_id, [])
            tasks.append(task)
    
    # Prioritize
    prioritized = prioritize_tasks(tasks, bucket)
    
    # Mark top 5
    for i, task in enumerate(prioritized):
        task["is_top_5"] = i < 5
        task["order"] = i + 1
    
    return prioritized
