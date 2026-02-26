"""
Versioned Question Set for AI Act Risk Scanner
Questions are domain-focused: General productivity + HR/hiring
"""

QUESTION_SET_VERSION = "1.0.0"

QUESTIONS = [
    {
        "id": "q1_company_role",
        "label": "What is your company's role with respect to the AI system?",
        "help_text": "This determines which AI Act obligations apply to you.",
        "type": "single",
        "options": [
            {"value": "developer", "label": "We develop the AI model/system"},
            {"value": "integrator", "label": "We integrate a third-party AI system into our product"},
            {"value": "internal_user", "label": "We use AI tools internally (no external customers)"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q2_deployment",
        "label": "Who uses this AI system?",
        "help_text": "Determines whether external-facing obligations apply.",
        "type": "single",
        "options": [
            {"value": "external", "label": "External customers/users"},
            {"value": "internal", "label": "Internal employees only"},
            {"value": "both", "label": "Both external and internal"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q3_domain",
        "label": "What domain does this AI system operate in?",
        "help_text": "Some domains have specific high-risk classifications under the AI Act.",
        "type": "single",
        "options": [
            {"value": "general_productivity", "label": "General productivity (writing, coding, analysis)"},
            {"value": "hiring_hr", "label": "Hiring/HR (recruitment, performance, workforce management)"},
            {"value": "finance", "label": "Finance/credit/insurance"},
            {"value": "healthcare", "label": "Healthcare"},
            {"value": "education", "label": "Education"},
            {"value": "public_sector", "label": "Public sector services"},
            {"value": "other", "label": "Other"}
        ],
        "required": True,
        "has_other": True
    },
    {
        "id": "q4_decision_impact",
        "label": "Does this AI make or support decisions about people with meaningful impact?",
        "help_text": "Consider: employment decisions, access to services, creditworthiness, etc.",
        "type": "single",
        "options": [
            {"value": "significant_impact", "label": "Yes, significant impact (hiring, firing, promotions, credit)"},
            {"value": "low_impact", "label": "Yes, but low impact (recommendations, suggestions)"},
            {"value": "no_impact", "label": "No, does not affect individuals directly"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q5_data_types",
        "label": "What types of personal data does the AI system process?",
        "help_text": "Sensitive data includes health, biometrics, race, political opinions, etc.",
        "type": "single",
        "options": [
            {"value": "no_personal", "label": "No personal data"},
            {"value": "personal_nonsensitive", "label": "Personal data (non-sensitive: name, email, job history)"},
            {"value": "sensitive", "label": "Sensitive/special categories (health, biometrics, ethnicity)"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q6_biometric",
        "label": "Does the system use biometric identification or categorization?",
        "help_text": "Face recognition, fingerprint scanning, emotion detection, etc.",
        "type": "single",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q7_safety_critical",
        "label": "Is the AI used in safety-critical or critical infrastructure contexts?",
        "help_text": "Medical devices, transport, energy, water, essential services.",
        "type": "single",
        "options": [
            {"value": "yes", "label": "Yes"},
            {"value": "no", "label": "No"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q8_human_oversight",
        "label": "What level of human oversight exists for AI decisions?",
        "help_text": "The AI Act requires appropriate human oversight for high-risk systems.",
        "type": "single",
        "options": [
            {"value": "fully_automated", "label": "Fully automated outcomes (no human review)"},
            {"value": "human_reviews", "label": "Human reviews before action is taken"},
            {"value": "advisory", "label": "Advisory only (human makes final decision)"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q9_behavior",
        "label": "What is the AI system's primary behavior?",
        "help_text": "Different behaviors trigger different transparency requirements.",
        "type": "single",
        "options": [
            {"value": "generates_content", "label": "Generates content/code"},
            {"value": "scores_ranks", "label": "Scores, ranks, or classifies people/items"},
            {"value": "recommends", "label": "Recommends actions"},
            {"value": "other", "label": "Other"}
        ],
        "required": True
    },
    {
        "id": "q10_logging",
        "label": "What logging and monitoring do you have in place?",
        "help_text": "High-risk systems require detailed logging of inputs, outputs, and decisions.",
        "type": "single",
        "options": [
            {"value": "full_logging", "label": "We log inputs/outputs and key decisions"},
            {"value": "partial_logging", "label": "Partial logging"},
            {"value": "no_logging", "label": "No logging"},
            {"value": "not_sure", "label": "Not sure"}
        ],
        "required": True
    },
    {
        "id": "q11_use_case",
        "label": "Describe your use case briefly (optional)",
        "help_text": "2-3 sentences about what the AI does.",
        "type": "text",
        "required": False,
        "placeholder": "e.g., We use an AI chatbot to answer employee HR questions about benefits and policies."
    },
    {
        "id": "q12_concern",
        "label": "What is your biggest compliance concern? (optional)",
        "help_text": "One sentence about what worries you most.",
        "type": "text",
        "required": False,
        "placeholder": "e.g., We're not sure if our resume screening tool needs special documentation."
    }
]

# Group questions for wizard steps
WIZARD_STEPS = [
    {
        "id": "role",
        "title": "Your Role",
        "description": "Help us understand how you interact with AI systems",
        "questions": ["q1_company_role", "q2_deployment"]
    },
    {
        "id": "domain",
        "title": "Domain & Impact",
        "description": "What area does your AI operate in?",
        "questions": ["q3_domain", "q4_decision_impact"]
    },
    {
        "id": "data",
        "title": "Data & Privacy",
        "description": "What data does your system process?",
        "questions": ["q5_data_types", "q6_biometric"]
    },
    {
        "id": "operations",
        "title": "Operations",
        "description": "How is the AI operated and monitored?",
        "questions": ["q7_safety_critical", "q8_human_oversight"]
    },
    {
        "id": "behavior",
        "title": "Behavior & Logging",
        "description": "What does the AI do and how is it tracked?",
        "questions": ["q9_behavior", "q10_logging"]
    },
    {
        "id": "context",
        "title": "Additional Context",
        "description": "Optional details to improve recommendations",
        "questions": ["q11_use_case", "q12_concern"]
    }
]
