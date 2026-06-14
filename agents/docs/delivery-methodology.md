# Delivery Methodology

This document describes how our team delivers projects. All four AI agents must use this as context when assessing risks, watchouts, and suggested tasks for a new project.

---

## Project Delivery Lifecycle (9 Phases)

### Phase 1 — Handover Initiation
Commercial Team submits a Scope of Works (SoW) document marking the official project start date. SoW must include: high-level overview of client and their business, project objectives and key requirements, agreed modules/features in scope, known constraints or delivery deadlines.

### Phase 2 — Assignment of Project Manager
Project Owner acknowledges handover, validates documentation, reviews backlog and assigns PM. PM assumes ownership of delivery timelines.

### Phase 3 — Client Engagement & Requirements Gathering (3–5 working days)
PM reaches out to client, provides introductions, arranges a requirements workshop. Covers:
- Identification of pain points in current processes
- Gathering input from key stakeholders and end-users
- Mapping existing workflows and areas for improvement
- Prioritising needs using MoSCoW framework
- Feasibility review of all requirements
- GAP analysis and workarounds for non-supported items
- Identification of project dependencies (third parties)
- Defining project deliverables and success criteria

### Phase 4 — Scope Validation
Any scope, feasibility, or GAP concerns fed back to Commercial Team for review and potential re-scoping before documentation begins.

### Phase 5 — Documentation & Sign-Off
PM drafts: finalised Statement of Works (SOW) outlining deliverables, timescales, and post-project support; High-Level Design (HLD) visualising workflows and relevant modules. Both shared with client for formal sign-off before build begins.

### Phase 6 — Build Phase
Implementation Team begins system configuration per agreed deliverables using an iterative approach with regular demonstrations and feedback sessions. Strict scope control enforced: any new or out-of-scope items recorded via Change Request (CR). CRs include description, reason, and must be escalated to Commercial Team for approval. Approved CRs may impact the project plan.

### Phase 7 — Testing Phase
On completion of build: client training on relevant modules and features, bug fixes and minor adjustments based on client feedback, documentation created or shared, final sign-off confirming all SOW deliverables met.

### Phase 8 — Handhold Phase (2–3 weeks)
Support period for minor issues, questions, or bugs. No new functionality delivered. Any new requirements submitted as Change Request and follow formal review and approval.

### Phase 9 — Project Closure
Handover to Account Manager for BAU support. Post-Project Review conducted to capture lessons learned.

---

## Project Statuses (Monday.com)

- **New Client** — handed over from Sales
- **Requirements** — gathering requirements
- **Build in Progress** — configuration and development underway
- **Pending Sign-Off** — awaiting client testing and approval
- **Handhold** — post-project grace period
- **Blocked** — cannot proceed (client-side issues)
- **Complete** — project closed

---

## RAG Status

- **Green** — on target
- **Amber** — at risk of delay
- **Red** — delivery date will not be met

---

## Key Documents & Templates

- **Scope of Works (SoW)** — commercial handover document
- **Statement of Works (SOW)** — always produced, outlines deliverables and timescales
- **High Level Project Plan (HLP)** — always produced
- **High Level Design (HLD)** — produced depending on scope and complexity
- **RAID Log** — issues, risks, assumptions, dependencies
- **Change Request Template** — for any out-of-scope items
- **Project Delivery Breakdown** — task-level deliverable breakdown

---

## Development Lifecycle (for feature/change requests within a project)

1. **Request Intake** — logged in Jira, added to Inbox column, source identified
2. **Inbox Triage** — reviewed weekly at Change Review Board, high-level requirements captured
3. **Decision: Proceed or Reject** — PM or Product Team decides; rejections communicated to client
4. **Scoping Backlog** — approved requests queued and prioritised for detailed scoping
5. **Scoping** — detailed requirements, dependencies, assumptions, client impact confirmed, lead assigned
6. **Development Refinement** — dev team reviews scoped requirements, creates technical tasks, estimates added as Original Estimates
7. **Playback Meeting** — delivery approach explained to stakeholders, decisions made, sign-off obtained
8. **Ready for Development** — feature prioritised in development backlog via Change Review Board
9. **Squad/Development Backlog** — engineer picks up item; PM maintains priority order
10. **Build** — developer implements, records time spent, provides regular updates on ticket

---

## BA Agent — Additional Context

### Requirements & Scoping Focus
- Requirements gathered using MoSCoW framework (Must, Should, Could, Won't)
- GAP analysis performed to identify non-supported items and workarounds
- Third-party dependencies must be identified early
- Client pain points and existing workflow mapping are key inputs
- Feasibility review required before scoping is complete
- All requirements must be documented and communicated back to client

### Form Builder Best Practices
- Mandatory fields must have "show validations" enabled
- Custom error messages required for mandatory fields where appropriate
- Mobile compatibility must be assessed based on client requirements

### Scope Control
- Any new or out-of-scope items MUST go through Change Request process
- CRs require: description, reason, impact assessment
- Escalated to Commercial Team for approval before any work begins

---

## PO Agent — Additional Context

### Prioritisation & Backlog Management
- MoSCoW framework used for requirements prioritisation
- Change Review Board meets weekly to review and prioritise items
- Items in Scoping Backlog prioritised by urgency
- PM responsible for maintaining priority order in development backlog
- Internal requests may enter directly at Scoping Backlog stage

### Stakeholder Management
- Commercial Team owns client relationship pre-handover
- PM responsible for client communication post-handover
- Regular progress updates provided at agreed intervals
- All client interactions and decisions must be logged
- Communication cadence established at start of project

### Change Control
- All scope changes go through formal Change Request process
- CRs escalated to Commercial/Sales Team for approval
- Approved CRs must be communicated to client and project plan updated
- Handhold phase: no new functionality — new requirements must follow CR process

### Campaign & Journey Considerations
- Status changes should be on completion of journey unless client specifies otherwise
- Avoid over-complicating workflows with excessive statuses
- Consider delays in campaign triggers to avoid data timing issues

---

## Dev Agent — Additional Context

### Development Process
- Development Refinement phase: dev team reviews scoped requirements in detail
- Technical tasks created to deliver requirements
- Estimates provided for development, testing, and code review
- Estimates recorded as "Original Estimates" on tickets
- Build start date, forecasted delivery date, and time remaining tracked on ticket
- Regular updates required on each ticket throughout build

### Technical Best Practices
- **Fast Sign / Document generation:** Use dynamic Word documents with slug tags (not merge tags) where client name, address etc. appears inline with text — prevents text overlap for long values. Not available for documents containing creditor information (PCP module). Ensure font/size matches original document.
- **Campaigns:** Status change should occur on completion of journey. Avoid excessive statuses in workflows. Consider trigger delays where form data needs time to record before journey fires.
- **Journeys:** Consistency across steps required. Mobile compatibility must be verified.
- **Forms:** Mobile compatibility required. Mandatory fields need validation enabled.

### Scope & Delivery
- Any new items during build phase go through Change Request — no exceptions
- Playback meeting required before build starts — delivery approach must be signed off
- Iterative build with regular client demonstrations

---

## QA Agent — Additional Context

### Testing Phase Coverage
- Client training on relevant modules and features
- Bug fixes and minor adjustments based on client feedback
- Documentation created or shared as needed
- Final sign-off required confirming ALL SOW deliverables have been met

### Quality Standards
- Peer review process: team members review and test each other's work before client presentation
- Second reviewer catches issues not apparent during self-testing
- Applies to all configuration, forms, journeys, campaigns, and documents

### Mobile Compatibility Checks
- Forms must be tested for mobile compatibility
- Journey content must render correctly on mobile
- All questions must be presented correctly and completable on mobile

### Message Template QA
- SMS message length must be calculated including all reminders
- Worst-case scenario (all reminders triggered) must be communicated to client
- Client confirmation of SMS volume required before go-live

### Sign-Off Process
- Formal written sign-off required from client before build begins (post SOW)
- Final sign-off required at end of testing confirming all deliverables met
- Playback sign-off required before development starts
