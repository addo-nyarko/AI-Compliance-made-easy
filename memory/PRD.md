# KODEX - EU AI Act Risk Scanner MVP

## Original Problem Statement
Build an MVP SaaS web app for EU SMBs (<250 employees) to provide "clarity + prioritization in under 3 minutes" for EU AI Act + GDPR intersection. Berlin-first beta, developer-oriented but plain-language UX.

## Architecture
- **Frontend**: React 19 with TailwindCSS, Shadcn/UI components
- **Backend**: FastAPI (Python) with async MongoDB
- **Database**: MongoDB (motor async driver)
- **Auth**: JWT-based email/password authentication
- **Storage**: Hybrid local-first drafts + DB-backed persistence after sign-in

## User Personas
1. **SMB Founder/CEO**: Needs quick compliance overview without legal jargon
2. **Product Manager**: Needs actionable roadmap for compliance tasks
3. **Developer**: Needs technical documentation requirements clarity
4. **Compliance Officer**: Needs transparency on classification decisions

## Core Requirements (Static)
- 3-minute scan completion target
- 5 risk buckets: Prohibited, High-risk, Limited risk, Minimal risk, Needs clarification
- Deterministic rules engine (no opaque LLM classification)
- Full transparency: decisive factors, assumptions, missing info
- Educational only - NOT legal advice (disclaimer everywhere)
- GDPR + AI Act intersection focus

## What's Been Implemented (Jan 2026)
### Backend
- [x] JWT authentication (register/login)
- [x] Projects CRUD API
- [x] Assessments CRUD with classification
- [x] Deterministic rules engine (13 rules, 5 buckets)
- [x] Roadmap generator (17 task templates)
- [x] Fine exposure estimator (tier-based simulation)
- [x] Export API
- [x] Settings management

### Frontend
- [x] Landing page with KODEX branding
- [x] Auth flow (sign in/sign up)
- [x] 6-step scan wizard with draft persistence
- [x] Results page with tabs (Why, Roadmap, Exposure, Counsel)
- [x] Projects list with filter/search
- [x] Project detail with version history
- [x] Settings page (estimator assumptions)
- [x] Export/print view
- [x] Static example page

### Question Set (v1.0.0)
- 10 required questions + 2 optional
- Domains: General productivity, HR/Hiring (priority), Finance, Healthcare, Education, Public sector

## Prioritized Backlog

### P0 (Critical - Next Sprint)
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Rate limiting on auth endpoints

### P1 (High Priority)
- [ ] Dark mode toggle
- [ ] Assessment comparison view
- [ ] Bulk export (multiple assessments)
- [ ] Question branching logic improvements

### P2 (Medium Priority)
- [ ] Team collaboration (invite users to project)
- [ ] Assessment templates
- [ ] Custom question sets
- [ ] Audit log

### P3 (Future)
- [ ] Multi-language support (German, French)
- [ ] API access for integrations
- [ ] Webhook notifications
- [ ] White-label options

## Next Tasks
1. Add email verification on registration
2. Implement dark mode toggle
3. Add more domain-specific rules for Finance/Healthcare
4. Create onboarding tour for first-time users
