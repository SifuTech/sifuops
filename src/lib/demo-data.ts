import type { LessonGroup } from '@/app/api/onboarding/lessons/route'
import type { AnalyseResponse } from '@/app/api/onboarding/analyse/route'

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const DEMO_PROJECTS = [
  { board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build' },
  { board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module' },
  { board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement' },
  { board_id: 'demo-004', board_name: 'Meridian Insurance — ID Verification' },
]

export const DEMO_BOARDS = DEMO_PROJECTS.map((p) => ({
  board_id: p.board_id,
  board_name: p.board_name,
  group_id: `${p.board_id}-discovery`,
  group_name: 'Discovery / Scoping',
  active: true,
  last_synced_at: new Date().toISOString(),
  lessons_count: 12,
}))

export const DEMO_LESSONS_COUNT = 47

// ---------------------------------------------------------------------------
// Work items — shapes must match RawWorkItem in the dashboard page
// ---------------------------------------------------------------------------

type DemoWorkItem = {
  item_id: string
  board_id: string
  board_name: string | null
  group_name: string | null
  phase_key: string | null
  name: string
  owner: string | null
  status: string | null
  priority: string
  target_date: string | null
  planned_date: string | null
  effort: string | null
}

export const DEMO_WORK_ITEMS: DemoWorkItem[] = [
  // ── Apex Financial Services — New Client Build ──────────────────────────
  // Discovery (all done)
  { item_id: 'a-d-1', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'Requirements Workshop', owner: 'Emma T', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-05-20', effort: '8' },
  { item_id: 'a-d-2', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'Stakeholder Interviews', owner: 'Emma T', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-05-22', effort: '4' },
  { item_id: 'a-d-3', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'GAP Analysis & SOW Sign-off', owner: 'Sarah M', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-06-02', effort: '6' },
  // Build (in progress — mix of due this week and future)
  { item_id: 'a-b-1', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Configure Client Hub', owner: 'Sarah M', status: 'In Progress', priority: 'P1', target_date: '2026-06-20', planned_date: '2026-06-16', effort: '12' },
  { item_id: 'a-b-2', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Campaign Workflow Setup', owner: 'James K', status: 'In Progress', priority: 'High', target_date: '2026-06-22', planned_date: '2026-06-18', effort: '16' },
  { item_id: 'a-b-3', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'KYC Form Builder Configuration', owner: 'Sarah M', status: 'In Progress', priority: 'High', target_date: '2026-06-20', planned_date: '2026-06-17', effort: '8' },
  { item_id: 'a-b-4', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Fast Sign Document Templates', owner: 'Tom R', status: 'Not Started', priority: 'Medium', target_date: '2026-06-27', planned_date: '2026-06-25', effort: '6' },
  { item_id: 'a-b-5', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'User Roles & Permissions', owner: null, status: 'Not Started', priority: 'Medium', target_date: null, planned_date: '2026-06-25', effort: '3' },
  // Test (not started)
  { item_id: 'a-t-1', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Test', phase_key: 'test', name: 'Internal QA & Peer Review', owner: 'Emma T', status: 'Not Started', priority: 'High', target_date: '2026-07-05', planned_date: '2026-07-02', effort: '8' },
  { item_id: 'a-t-2', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Test', phase_key: 'test', name: 'UAT Session', owner: 'Emma T', status: 'Not Started', priority: 'High', target_date: '2026-07-10', planned_date: '2026-07-08', effort: '4' },
  { item_id: 'a-t-3', board_id: 'demo-001', board_name: 'Apex Financial Services — New Client Build', group_name: 'Test', phase_key: 'test', name: 'Final Sign-off', owner: null, status: 'Not Started', priority: 'Medium', target_date: '2026-07-14', planned_date: '2026-07-12', effort: '2' },

  // ── Sterling Claims Management — Campaigns Module ────────────────────────
  // Discovery (in progress, one overdue)
  { item_id: 's-d-1', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'Initial Requirements Capture', owner: 'Emma T', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-06-03', effort: '6' },
  { item_id: 's-d-2', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'Pain Point Analysis & Workflow Mapping', owner: 'Emma T', status: 'In Progress', priority: 'P1', target_date: '2026-06-12', planned_date: '2026-06-10', effort: '8' },
  { item_id: 's-d-3', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'Campaign Trigger Specification', owner: 'Tom R', status: 'In Progress', priority: 'High', target_date: '2026-06-20', planned_date: '2026-06-18', effort: '6' },
  { item_id: 's-d-4', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'GAP Analysis', owner: 'Tom R', status: 'Not Started', priority: 'High', target_date: '2026-06-22', planned_date: '2026-06-20', effort: '4' },
  { item_id: 's-d-5', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Discovery / Scoping', phase_key: 'discovery', name: 'HLD Draft & SOW Sign-off', owner: 'Emma T', status: 'Not Started', priority: 'Medium', target_date: '2026-07-01', planned_date: '2026-06-28', effort: '6' },
  // Build (not started)
  { item_id: 's-b-1', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Campaign & Status Configuration', owner: 'James K', status: 'Not Started', priority: 'High', target_date: '2026-07-18', planned_date: '2026-07-15', effort: '12' },
  { item_id: 's-b-2', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Journey & Reminder Rule Setup', owner: 'James K', status: 'Not Started', priority: 'High', target_date: '2026-07-24', planned_date: '2026-07-22', effort: '16' },
  { item_id: 's-b-3', board_id: 'demo-002', board_name: 'Sterling Claims Management — Campaigns Module', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Form Builder — Claim Submission Form', owner: null, status: 'Not Started', priority: 'Medium', target_date: '2026-07-28', planned_date: '2026-07-25', effort: '8' },

  // ── Harrison Legal — Case Hub Enhancement ───────────────────────────────
  // Build (done)
  { item_id: 'h-b-1', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Case Workflow Configuration', owner: 'James K', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-06-03', effort: '10' },
  { item_id: 'h-b-2', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Case Status Configuration', owner: 'Tom R', status: 'Done', priority: 'Medium', target_date: null, planned_date: '2026-06-05', effort: '4' },
  { item_id: 'h-b-3', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Build / Demo / Refine', phase_key: 'build', name: 'Bulk Import Template Setup', owner: 'Sarah M', status: 'Done', priority: 'Medium', target_date: null, planned_date: '2026-06-06', effort: '6' },
  // Test (overdue + in progress)
  { item_id: 'h-t-1', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Test', phase_key: 'test', name: 'Internal QA & Peer Review', owner: 'Tom R', status: 'In Progress', priority: 'P1', target_date: '2026-06-12', planned_date: '2026-06-10', effort: '8' },
  { item_id: 'h-t-2', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Test', phase_key: 'test', name: 'Bug Fixes Round 1', owner: 'Sarah M', status: 'In Progress', priority: 'High', target_date: '2026-06-14', planned_date: '2026-06-12', effort: '6' },
  { item_id: 'h-t-3', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Test', phase_key: 'test', name: 'UAT Session', owner: 'Emma T', status: 'Awaiting Client', priority: 'High', target_date: '2026-06-20', planned_date: '2026-06-19', effort: '4' },
  { item_id: 'h-t-4', board_id: 'demo-003', board_name: 'Harrison Legal — Case Hub Enhancement', group_name: 'Test', phase_key: 'test', name: 'Final Sign-off', owner: 'Emma T', status: 'Not Started', priority: 'High', target_date: '2026-06-24', planned_date: '2026-06-23', effort: '2' },

  // ── Meridian Insurance — ID Verification ────────────────────────────────
  // Test (done)
  { item_id: 'm-t-1', board_id: 'demo-004', board_name: 'Meridian Insurance — ID Verification', group_name: 'Test', phase_key: 'test', name: 'UAT & Sign-off', owner: 'Sarah M', status: 'Done', priority: 'High', target_date: null, planned_date: '2026-06-08', effort: '8' },
  // Handhold (in progress)
  { item_id: 'm-h-1', board_id: 'demo-004', board_name: 'Meridian Insurance — ID Verification', group_name: 'Handhold / Go Live', phase_key: 'handhold', name: 'Post Go-Live Support', owner: 'Sarah M', status: 'In Progress', priority: 'High', target_date: '2026-06-20', planned_date: '2026-06-18', effort: '4' },
  { item_id: 'm-h-2', board_id: 'demo-004', board_name: 'Meridian Insurance — ID Verification', group_name: 'Handhold / Go Live', phase_key: 'handhold', name: 'Client Portal Rendering Bug', owner: 'Tom R', status: 'Blocked', priority: 'High', target_date: '2026-06-18', planned_date: '2026-06-16', effort: '3' },
  { item_id: 'm-h-3', board_id: 'demo-004', board_name: 'Meridian Insurance — ID Verification', group_name: 'Handhold / Go Live', phase_key: 'handhold', name: 'Training Materials Update', owner: 'Emma T', status: 'Done', priority: 'Medium', target_date: null, planned_date: '2026-06-11', effort: '4' },
]

// ---------------------------------------------------------------------------
// Lessons (for the onboarding flow)
// ---------------------------------------------------------------------------

export const DEMO_LESSONS: LessonGroup[] = [
  {
    projectName: 'Apex Financial Services — New Client Build',
    boardId: 'demo-001',
    lessons: [
      'Campaign triggers must each be saved individually — batch configuration causes silent data loss on navigation',
      'Agree User Allocation limits (daily/weekly/monthly) with client before go-live to prevent post-launch complaints',
      'Form Builder Pro fields for Client Hub data binding require exact field keys — incorrect keys cause silent save failures',
      'Test all Form Builder Pro forms in the Client Portal context, not just in the builder — rendering differs',
    ],
  },
  {
    projectName: 'Harrison Legal — Case Hub Enhancement',
    boardId: 'demo-003',
    lessons: [
      'Case Workflows have no execution log — test every IF/THEN rule end-to-end with a live test case',
      'Bulk import CSV must match the exact column schema — partial uploads fail silently without error messaging',
      'UAT sign-off must explicitly reference the SOW deliverables list — a general approval email is not sufficient',
    ],
  },
]

// ---------------------------------------------------------------------------
// Pre-canned agent results (shown in demo mode on the new project results page)
// ---------------------------------------------------------------------------

export const DEMO_AGENT_RESULTS: AnalyseResponse = {
  ba: {
    risks: [
      'Campaign trigger logic is ambiguous in the brief — specific journey completion conditions are not defined. Without explicit trigger mapping before the HLD is drafted, the team risks configuring incorrect automation that requires rework post-build.',
      'No GAP analysis has been completed for the Journeys module — brief assumes all required steps can be met natively, but multi-step authentication and scenario branching may require workarounds not yet identified.',
      'Form Builder Pro field keys for Client Hub data binding are not specified. Incorrect keys cause silent save failures that are difficult to diagnose mid-build and costly to unpick during testing.',
      'Third-party dependencies (SMS gateway, email provider) are not named or confirmed in the brief. Campaign reminder delivery relies on these — any delay in confirming provider configuration will block testing.',
      'Acceptance criteria are not defined per campaign trigger/action combination. Without these documented before build begins, the client will raise items at UAT that were never formally agreed as in-scope.',
    ],
    watchouts: [
      'If discovery workshops run beyond the 3–5 day target without a scope freeze, requirements will continue expanding and the SOW will be invalidated before it is signed.',
      'The brief contains phrases such as "standard journey setup" — these imply client assumptions about out-of-box behaviour that may not match the platform\'s actual defaults. Surface these assumptions during discovery.',
      'Watch for form field requirements growing after the HLD is signed — each new field requires validation, mapping, and re-test. Enforce the Change Request process from day one.',
    ],
    suggested_tasks: [
      { title: 'Run Discovery Workshop', description: 'Facilitate 3–5 day requirements workshop covering all campaign trigger conditions, action sequences, journey step definitions, and form field mappings. Use MoSCoW to prioritise. This is mandatory before the HLD can be drafted.', agent: 'BA' },
      { title: 'Complete GAP Analysis — Campaigns & Journeys', description: 'Identify any gaps between the brief requirements and native platform capability. Define workarounds for multi-step authentication and branching logic limitations. Must be completed before scoping closes.', agent: 'BA' },
      { title: 'Document Acceptance Criteria per Trigger', description: 'Write explicit acceptance criteria for every campaign trigger/action combination. These must be client-approved before build begins to prevent UAT scope disputes.', agent: 'BA' },
      { title: 'Confirm Third-Party Integration Details', description: 'Name and confirm SMS gateway and email provider with client. Obtain credentials and verify configuration in a test environment before journey reminder rules are built.', agent: 'BA' },
      { title: 'Draft HLD for Client Sign-off', description: 'Produce the High Level Design visualising all journey flows, campaign statuses, form placements, and trigger logic. Issue to client for formal sign-off before build begins.', agent: 'BA' },
    ],
  },
  po: {
    risks: [
      'Campaigns module scope is highly susceptible to expansion. Clients frequently add statuses, trigger conditions, and journey steps mid-build when they see the system in action. Without a locked MoSCoW prioritisation signed off before the SOW is issued, Change Requests will proliferate.',
      'No confirmation in the brief that the client understands User Allocation settings (daily/weekly/monthly limits per user per campaign). Misconfigured limits at go-live are a common post-launch complaint on Campaigns projects.',
      'The brief does not distinguish must-have from nice-to-have journey steps. Gold-plating a journey with optional steps that the client "would like" increases configuration time and creates unnecessary test cases that dilute focus.',
      'Stakeholder alignment is unclear — the brief names a single point of contact but Campaigns projects typically involve both operational and compliance stakeholders whose requirements often conflict during discovery.',
    ],
    watchouts: [
      'If the client begins reviewing the live system mid-build and requesting changes outside the Change Review Board process, scope will drift without formal control. Establish the CR process and communication cadence at project kickoff.',
      'Watch for campaign statuses being added mid-build — this is a common pattern that cascades into journey rework, form changes, and additional testing cycles. All statuses must be signed off in the HLD.',
      'If MoSCoW priorities are not re-confirmed after the GAP analysis, requirements rated "Could" during discovery may be treated as "Must" during build. Revalidate priorities after any GAP findings.',
    ],
    suggested_tasks: [
      { title: 'MoSCoW Prioritisation Workshop', description: 'Facilitate a prioritisation session with all client stakeholders to rank campaign triggers, journey steps, and form requirements. Output must be signed off before documentation begins. Prevents gold-plating and scope drift.', agent: 'PO' },
      { title: 'Confirm User Allocation Limits', description: 'Agree and document daily/weekly/monthly user allocation limits per campaign with the client before build begins. Misconfigured limits have caused post-go-live issues on similar Campaigns projects.', agent: 'PO' },
      { title: 'Define MVP Scope for Go-Live', description: 'Agree the minimum viable scope with the client. Defer non-critical journeys and additional campaign statuses to a Phase 2 Change Request to protect the delivery timeline.', agent: 'PO' },
      { title: 'Establish Change Request Process at Kickoff', description: 'Brief the client on the CR process at project kickoff. Any requirements not in the signed SOW must follow formal CR. Set expectations on turnaround time and commercial impact upfront.', agent: 'PO' },
      { title: 'Stakeholder Map & Communication Plan', description: 'Identify all client stakeholders (operational, compliance, IT) and their decision-making authority. Establish communication cadence. Misaligned stakeholders are a leading cause of late requirement changes on Campaigns builds.', agent: 'PO' },
    ],
  },
  dev: {
    risks: [
      'Campaign workflow triggers must each be saved individually — if the team configures multiple triggers in a single session without saving each row, triggers are silently lost on navigation. This is a known platform behaviour that surfaces as hard-to-diagnose defects late in testing.',
      'Journey reminder rules and message templates must be fully configured before journeys are linked to campaigns. If a campaign goes live before reminder rules are attached, clients receive no communications — a critical defect that is invisible until tested end-to-end.',
      'Form Builder Pro forms embedded in journeys cannot be previewed during configuration. Every form must be tested with a live test client in the Client Portal context to confirm field rendering and data saving against the client record.',
      'If Fast Sign slug tags are not used for inline client name/address fields in document templates, long values will cause text overlap on generated documents. Merge tags are not suitable for inline text — the technical approach must specify slug tags before any templates are built.',
    ],
    watchouts: [
      'Campaigns go live immediately on creation — ensure all triggers, statuses, and journey links are fully configured and verified in a non-production environment before the campaign is created in the live system.',
      'Watch for trigger delay requirements being missed during build. If a form submission triggers a campaign status change, the form data must be fully recorded before the journey fires — insufficient delay will launch journeys with incomplete client data.',
    ],
    suggested_tasks: [
      { title: 'Development Refinement Session', description: 'Dev team to review all scoped requirements in detail, create technical tasks, and record Original Estimates before build begins. Mandatory per the development lifecycle — no build should start without estimates on all tickets.', agent: 'Dev' },
      { title: 'Playback Meeting — Delivery Approach Sign-off', description: 'Prepare delivery approach documentation covering campaign architecture, journey structure, form placement, and document generation approach. Schedule Playback Meeting with stakeholders. Build cannot begin until this is signed off.', agent: 'Dev' },
      { title: 'Configure Campaign Triggers Sequentially', description: 'Implement each campaign trigger individually, saving each row before moving to the next. Do not batch-configure triggers in a single session — unsaved triggers are silently discarded on navigation. Verify each trigger is saved before continuing.', agent: 'Dev' },
      { title: 'End-to-End Journey Trigger Testing', description: 'Test each campaign trigger by creating a test client, assigning to the campaign, and verifying the full automation chain fires correctly with appropriate delay. No execution log exists — manual end-to-end testing is the only verification method.', agent: 'Dev' },
      { title: 'Form Builder Testing in Client Portal', description: 'Test all Form Builder Pro forms in the Client Portal with a live test client. Verify all field keys save correctly against the client record. No preview mode exists — forms must be tested in the target context.', agent: 'Dev' },
    ],
  },
  qa: {
    risks: [
      'No execution log exists for campaign workflows — if a trigger fires incorrectly or fails to fire, there is no system log to diagnose the failure. QA must test every trigger/action combination explicitly with a test client, documenting expected vs actual outcome for each.',
      'Journey content must render correctly on mobile devices. If mobile testing is deferred until late in the test cycle, rendering defects will surface during client UAT and cannot be resolved without rework and re-test.',
      'SMS message character counts for all journey reminders must be calculated at worst-case (all reminders triggered for one client). Special characters and long client names increase character count beyond the 160-character standard limit. Volume must be confirmed with the client before go-live.',
      'No test-signing preview exists in Fast Sign — every document template must be manually signed through the complete signing workflow to verify merge tag output, field positioning, and font rendering before client training.',
    ],
    watchouts: [
      'If peer review is skipped on campaign configuration and journey setup, defects that are only visible in the end-to-end flow will be missed and surface at client UAT — causing delays and eroding client confidence.',
      'Watch for client UAT being treated as a discovery session — if the client is still defining requirements during UAT, the testing phase will extend indefinitely. Confirm acceptance criteria are agreed before UAT begins.',
      'Ensure final written sign-off explicitly references the SOW deliverables list. A general approval email is not sufficient for project closure and creates disputes when post-project issues are raised.',
    ],
    suggested_tasks: [
      { title: 'Create Test Strategy Document', description: 'Document the test approach covering the campaign trigger test matrix, journey mobile testing plan, form testing in Client Portal, and Fast Sign manual signing checks. Required before any testing activity begins.', agent: 'QA' },
      { title: 'Build Campaign Trigger Test Matrix', description: 'Create a test matrix covering every trigger/action combination in every campaign. No execution log exists — manual testing with a live test client is the only verification method. Every combination must be tested and signed off.', agent: 'QA' },
      { title: 'Mobile Compatibility Testing — Journeys & Forms', description: 'Test all journey steps and Form Builder Pro forms on mobile devices (iOS and Android). Verify all content renders correctly and forms are completable on mobile before UAT is scheduled.', agent: 'QA' },
      { title: 'SMS Character Count Verification', description: 'Calculate worst-case SMS character count for all message templates including all reminder instances for a single client. Confirm total volume and any character overrun with the client before go-live sign-off.', agent: 'QA' },
      { title: 'Fast Sign Manual Signing Test', description: 'Manually sign each document template through the complete Fast Sign workflow using a test client. Verify slug tag output, confirm no text overlap on long client names, check field positioning and font consistency against the original document.', agent: 'QA' },
      { title: 'Peer Review Session Before UAT', description: 'Schedule peer review session before client UAT. Team members must test each other\'s campaign configuration, journey setup, and form fields. A second reviewer is required to surface integration defects not visible during self-testing.', agent: 'QA' },
    ],
  },
}

// ---------------------------------------------------------------------------
// Pre-canned SOW sections (shown in demo mode on the SOW generator page)
// ---------------------------------------------------------------------------

export const DEMO_SOW_SECTIONS = {
  goals_and_objectives:
    'The primary objective of this engagement is to implement and configure the Campaigns and Client Journeys modules within the FastDox platform for Sterling Claims Management. This will enable the client to automate client communication workflows, route clients through structured journey sequences, and manage campaign-level status tracking. The project aims to reduce manual outreach effort, improve client engagement rates, and provide full auditability of client interactions from initial contact through to claim resolution.',

  scope_of_work:
    'The scope of this engagement covers the full configuration of the Campaigns module including campaign creation, status definitions, User Allocation settings, and IF/THEN workflow trigger and action rules. It also covers the configuration of Client Journeys including multi-step journey sequences, reminder rules, message templates, and Form Builder Pro integration. All configuration will be delivered to agreed acceptance criteria and supported through internal testing, client UAT, and a formal sign-off process. Any requirements identified after SOW sign-off will be submitted as Change Requests and subject to separate commercial approval.',

  required_modules:
    'Campaigns, Client Journeys, Form Builder Pro, Client Hub, Message Templates, Reminder Rules',

  deliverables_by_fastdox:
    '1. Campaign configuration including status labels, User Allocation limits, and workflow trigger/action rules\n2. Client Journey sequences with step-level information feeds, reminder rules, and message templates\n3. Form Builder Pro forms configured for Client Portal delivery\n4. Internal testing and peer review of all configuration\n5. Client training on the Campaigns and Journeys modules\n6. Documentation of all campaign triggers, journey steps, and form fields delivered\n7. UAT support and defect resolution\n8. Formal sign-off confirming all SOW deliverables met',

  third_party_deliverables:
    'The client is responsible for providing confirmed SMS gateway and email provider credentials prior to the build phase. Any delays in providing these credentials will impact the project timeline and may result in a Change Request to adjust delivery dates. The client is also responsible for providing all content for message templates, information feed text, and journey step copy prior to configuration beginning.',

  systems_and_integrations:
    'This engagement operates within the FastDox platform and does not require external system integrations. All configuration is native to the platform. The SMS and email message delivery utilises the client\'s configured gateway credentials within the platform settings. No API integrations are in scope for this engagement.',

  acceptance_criteria:
    '1. All campaign triggers fire correctly when tested with a live test client assigned to each campaign\n2. All journey steps render correctly on both desktop and mobile devices\n3. All Form Builder Pro forms save responses correctly against the client record in Client Hub\n4. SMS character counts have been calculated and confirmed with the client for all reminder combinations\n5. All document templates have been manually signed through the full Fast Sign workflow and verified\n6. Peer review has been completed by a second team member before client UAT\n7. Client has completed UAT and provided written sign-off referencing the SOW deliverables list',

  training:
    'FastDox will deliver training sessions covering the Campaigns module (campaign creation, status management, user allocation, and workflow monitoring) and the Client Journeys module (journey management, reminder rules, and form submission review). Training will be delivered via video call and will include a demonstration of the full end-to-end client journey. Training documentation and recorded session links will be provided to the client following the training session.',
}
