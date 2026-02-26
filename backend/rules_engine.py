"""
Deterministic Rules Engine for AI Act Classification
All rules are transparent, auditable, and conservative.
"""

from typing import Dict, Any, List

RULES_VERSION = "1.0.0"

# Rule definitions with priorities and conditions
RULES = [
    # PROHIBITED PRACTICES (highest priority)
    {
        "id": "R001",
        "priority": 1,
        "name": "Prohibited: Real-time biometric identification in public spaces",
        "bucket": "Prohibited",
        "conditions": [
            {"question": "q6_biometric", "values": ["yes"]},
            {"question": "q2_deployment", "values": ["external", "both"]}
        ],
        "reason": "Real-time biometric identification systems for law enforcement purposes in publicly accessible spaces are prohibited under Art. 5 of the AI Act."
    },
    {
        "id": "R002",
        "priority": 1,
        "name": "Prohibited: Social scoring by public authorities",
        "bucket": "Prohibited",
        "conditions": [
            {"question": "q3_domain", "values": ["public_sector"]},
            {"question": "q9_behavior", "values": ["scores_ranks"]},
            {"question": "q4_decision_impact", "values": ["significant_impact"]}
        ],
        "reason": "AI systems used by public authorities for social scoring that leads to detrimental treatment are prohibited under Art. 5."
    },
    
    # HIGH-RISK: Employment/HR domain
    {
        "id": "R003",
        "priority": 2,
        "name": "High-risk: HR recruitment and selection",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q3_domain", "values": ["hiring_hr"]},
            {"question": "q4_decision_impact", "values": ["significant_impact"]}
        ],
        "reason": "AI systems used in employment for recruitment, screening, filtering applications, or evaluating candidates are classified as high-risk under Annex III."
    },
    {
        "id": "R004",
        "priority": 2,
        "name": "High-risk: HR decisions affecting workers",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q3_domain", "values": ["hiring_hr"]},
            {"question": "q9_behavior", "values": ["scores_ranks"]},
            {"question": "q8_human_oversight", "values": ["fully_automated"]}
        ],
        "reason": "AI systems making decisions on promotion, termination, task allocation, or performance monitoring with significant impact are high-risk."
    },
    
    # HIGH-RISK: Other domains
    {
        "id": "R005",
        "priority": 2,
        "name": "High-risk: Credit/finance decisions",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q3_domain", "values": ["finance"]},
            {"question": "q4_decision_impact", "values": ["significant_impact"]}
        ],
        "reason": "AI systems evaluating creditworthiness or establishing credit scores are high-risk under Annex III."
    },
    {
        "id": "R006",
        "priority": 2,
        "name": "High-risk: Healthcare/medical context",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q3_domain", "values": ["healthcare"]},
            {"question": "q7_safety_critical", "values": ["yes"]}
        ],
        "reason": "AI systems intended to be used as safety components of medical devices are high-risk."
    },
    {
        "id": "R007",
        "priority": 2,
        "name": "High-risk: Education assessment",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q3_domain", "values": ["education"]},
            {"question": "q4_decision_impact", "values": ["significant_impact"]}
        ],
        "reason": "AI systems determining access to education or evaluating learning outcomes are high-risk."
    },
    {
        "id": "R008",
        "priority": 2,
        "name": "High-risk: Safety-critical infrastructure",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q7_safety_critical", "values": ["yes"]}
        ],
        "reason": "AI systems used in critical infrastructure management are classified as high-risk."
    },
    {
        "id": "R009",
        "priority": 2,
        "name": "High-risk: Biometric categorization",
        "bucket": "High-risk",
        "conditions": [
            {"question": "q6_biometric", "values": ["yes"]},
            {"question": "q5_data_types", "values": ["sensitive"]}
        ],
        "reason": "Biometric categorization systems using sensitive attributes are high-risk."
    },
    
    # LIMITED RISK
    {
        "id": "R010",
        "priority": 3,
        "name": "Limited risk: AI-generated content",
        "bucket": "Limited risk",
        "conditions": [
            {"question": "q9_behavior", "values": ["generates_content"]},
            {"question": "q2_deployment", "values": ["external", "both"]}
        ],
        "reason": "AI systems generating synthetic content must disclose that content is AI-generated (transparency obligation)."
    },
    {
        "id": "R011",
        "priority": 3,
        "name": "Limited risk: Chatbots/conversational AI",
        "bucket": "Limited risk",
        "conditions": [
            {"question": "q9_behavior", "values": ["generates_content", "recommends"]},
            {"question": "q2_deployment", "values": ["external", "both"]},
            {"question": "q4_decision_impact", "values": ["low_impact", "no_impact"]}
        ],
        "reason": "Chatbots and AI systems interacting with users must disclose they are AI (transparency obligation)."
    },
    
    # MINIMAL RISK (catch-all for productivity tools)
    {
        "id": "R012",
        "priority": 4,
        "name": "Minimal risk: Internal productivity tools",
        "bucket": "Minimal risk",
        "conditions": [
            {"question": "q2_deployment", "values": ["internal"]},
            {"question": "q4_decision_impact", "values": ["no_impact", "low_impact"]},
            {"question": "q3_domain", "values": ["general_productivity"]}
        ],
        "reason": "Internal AI tools for general productivity with no significant impact on individuals are minimal risk."
    },
    {
        "id": "R013",
        "priority": 4,
        "name": "Minimal risk: Low-impact advisory systems",
        "bucket": "Minimal risk",
        "conditions": [
            {"question": "q8_human_oversight", "values": ["advisory"]},
            {"question": "q4_decision_impact", "values": ["no_impact"]}
        ],
        "reason": "AI systems providing advisory information without direct impact are generally minimal risk."
    }
]

# Uncertainty triggers
UNCERTAINTY_QUESTIONS = ["q4_decision_impact", "q5_data_types", "q6_biometric", "q7_safety_critical", "q8_human_oversight"]


def evaluate_rule(rule: Dict, answers: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a single rule against answers."""
    conditions_met = 0
    conditions_total = len(rule["conditions"])
    uncertain = False
    
    for condition in rule["conditions"]:
        question_id = condition["question"]
        expected_values = condition["values"]
        answer = answers.get(question_id)
        
        if answer is None:
            uncertain = True
            continue
        
        if answer in expected_values:
            conditions_met += 1
        elif answer == "not_sure":
            uncertain = True
    
    fired = conditions_met == conditions_total and not uncertain
    partial = conditions_met > 0 and conditions_met < conditions_total
    
    return {
        "ruleId": rule["id"],
        "fired": fired,
        "partial": partial,
        "uncertain": uncertain,
        "conditions_met": conditions_met,
        "conditions_total": conditions_total,
        "note": rule["reason"] if fired else (f"Partially matched ({conditions_met}/{conditions_total})" if partial else "Not applicable")
    }


def classify_assessment(answers: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run deterministic classification rules against assessment answers.
    Returns classification with full transparency.
    """
    rule_trace = []
    decisive_factors = []
    assumptions = []
    missing_info = []
    what_changes = []
    
    # Track "not sure" answers
    not_sure_count = 0
    critical_not_sure = []
    
    for qid, answer in answers.items():
        if answer == "not_sure":
            not_sure_count += 1
            if qid in UNCERTAINTY_QUESTIONS:
                critical_not_sure.append(qid)
    
    # Evaluate all rules
    fired_rules = []
    partial_rules = []
    
    for rule in sorted(RULES, key=lambda r: r["priority"]):
        result = evaluate_rule(rule, answers)
        rule_trace.append(result)
        
        if result["fired"]:
            fired_rules.append(rule)
        elif result["partial"] or result["uncertain"]:
            partial_rules.append(rule)
    
    # Determine bucket based on fired rules (highest priority wins)
    bucket = "Minimal risk"  # Default
    confidence = "High"
    winning_rule = None
    
    if fired_rules:
        winning_rule = min(fired_rules, key=lambda r: r["priority"])
        bucket = winning_rule["bucket"]
    
    # Check if we should demote to "Needs clarification"
    needs_clarification = False
    
    if len(critical_not_sure) >= 2:
        needs_clarification = True
    elif len(critical_not_sure) == 1 and bucket in ["High-risk", "Prohibited"]:
        # If classification is severe but uncertainty exists, flag it
        confidence = "Low"
        needs_clarification = True
    elif partial_rules and not fired_rules:
        # No clear match, partial matches exist
        confidence = "Medium"
        if not_sure_count >= 2:
            needs_clarification = True
    
    if needs_clarification:
        bucket = "Needs clarification"
        confidence = "Low"
    
    # Build decisive factors
    if winning_rule:
        for condition in winning_rule["conditions"]:
            qid = condition["question"]
            answer = answers.get(qid, "not provided")
            decisive_factors.append({
                "questionId": qid,
                "answer": answer,
                "reason": f"Answer '{answer}' matched condition for {winning_rule['name']}",
                "ruleId": winning_rule["id"]
            })
    
    # Build assumptions
    if answers.get("q3_domain"):
        domain_labels = {
            "general_productivity": "General productivity domain",
            "hiring_hr": "HR/Hiring domain",
            "finance": "Finance domain",
            "healthcare": "Healthcare domain",
            "education": "Education domain",
            "public_sector": "Public sector domain"
        }
        assumptions.append(f"Domain: {domain_labels.get(answers['q3_domain'], answers['q3_domain'])}")
    
    if answers.get("q1_company_role"):
        role_labels = {
            "developer": "You develop the AI system (provider obligations may apply)",
            "integrator": "You integrate third-party AI (deployer obligations may apply)",
            "internal_user": "You use AI internally (user obligations may apply)"
        }
        assumptions.append(role_labels.get(answers["q1_company_role"], "Role not specified"))
    
    assumptions.append("Classification based on answers provided; actual classification may differ with more context")
    
    # Build missing info
    question_labels = {
        "q4_decision_impact": ("Impact on individuals", "This determines whether high-risk obligations apply", "Does this AI make decisions that significantly affect individuals' lives?"),
        "q5_data_types": ("Data sensitivity", "Sensitive data triggers additional requirements", "What types of personal data does the system process?"),
        "q6_biometric": ("Biometric data use", "Biometric processing is heavily regulated", "Does the system identify or categorize people using biometrics?"),
        "q7_safety_critical": ("Safety-critical context", "Safety-critical use cases are high-risk by default", "Is this AI used in contexts where failure could cause harm?"),
        "q8_human_oversight": ("Human oversight level", "Lack of oversight increases risk classification", "Is there human review before AI-driven actions take effect?")
    }
    
    for qid in critical_not_sure:
        if qid in question_labels:
            label, why, followup = question_labels[qid]
            missing_info.append({
                "questionId": qid,
                "label": label,
                "whyItMatters": why,
                "followUpQuestion": followup
            })
    
    # Build what would change outcome
    if bucket == "Minimal risk":
        what_changes.append("If this AI makes significant decisions about people, it may be classified as high-risk")
        what_changes.append("If deployed externally with content generation, transparency obligations may apply")
    elif bucket == "Limited risk":
        what_changes.append("If decisions significantly impact individuals, classification may elevate to high-risk")
        what_changes.append("If only used internally, may be reclassified as minimal risk")
    elif bucket == "High-risk":
        what_changes.append("If human oversight is added before all decisions, some obligations may be simplified")
        what_changes.append("If impact on individuals is reduced, may be reclassified as limited risk")
    elif bucket == "Needs clarification":
        what_changes.append("Answering the missing questions would allow definitive classification")
    
    # Generate plain language summary
    summary = generate_summary(bucket, confidence, winning_rule, answers, critical_not_sure)
    
    return {
        "bucket": bucket,
        "confidence": confidence,
        "decisive_factors": decisive_factors[:3],  # Top 3
        "assumptions": assumptions,
        "missing_info": missing_info,
        "what_changes_outcome": what_changes,
        "plain_language_summary": summary,
        "rule_trace": rule_trace
    }


def generate_summary(bucket: str, confidence: str, winning_rule: Dict, answers: Dict, uncertain_questions: List) -> str:
    """Generate a plain-language summary of the classification."""
    
    domain = answers.get("q3_domain", "your domain")
    domain_labels = {
        "general_productivity": "general productivity",
        "hiring_hr": "HR and hiring",
        "finance": "finance",
        "healthcare": "healthcare",
        "education": "education",
        "public_sector": "public sector"
    }
    domain_text = domain_labels.get(domain, domain)
    
    if bucket == "Prohibited":
        return f"Based on your inputs, this AI system may fall under prohibited practices in the EU AI Act. Prohibited systems cannot be placed on the EU market. This classification is driven by the combination of {domain_text} use case and the nature of decisions being made. Consult legal counsel immediately before proceeding."
    
    elif bucket == "High-risk":
        return f"Based on your inputs, this AI system likely falls into the high-risk category under the EU AI Act. High-risk systems in {domain_text} require conformity assessment, registration in the EU database, quality management systems, and ongoing monitoring. This does not mean you cannot use the system—it means specific compliance steps are required."
    
    elif bucket == "Limited risk":
        return f"Based on your inputs, this AI system likely falls into the limited risk category. The primary obligation is transparency: users must be informed they are interacting with AI, and AI-generated content must be disclosed. Beyond transparency requirements, limited-risk systems do not face the extensive compliance burdens of high-risk systems."
    
    elif bucket == "Minimal risk":
        return f"Based on your inputs, this AI system appears to be minimal risk under the EU AI Act. Minimal-risk systems (like spam filters, most productivity tools, and internal analytics) can be developed and used freely. However, general principles of responsible AI and existing laws (like GDPR for personal data) still apply."
    
    elif bucket == "Needs clarification":
        missing_count = len(uncertain_questions)
        return f"We cannot provide a definitive classification because {missing_count} key question(s) were answered with 'Not sure'. The classification could range from minimal to high-risk depending on these answers. Please review the missing information section and provide clarification, or consult with someone in your organization who can answer these questions."
    
    return "Classification could not be determined. Please review your answers and try again."
