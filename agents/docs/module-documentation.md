# Module Documentation

This document describes each product module. All four AI agents must use this when a module is listed as involved in a new project — understand what it does, its configuration complexity, and the risks or watchouts that commonly arise during delivery.

---

## 1. Appointments

Handles end-to-end booking, scheduling, and configuration of client appointments.

**Key areas:**
- Booking & Client View — create appointments, view all client appointments, export data
- My Appointments & Working Schedule — personal diary, per-user working schedules, one-off ad-hoc bookings
- Settings: Schedules & Reminder Rules — appointment schedule templates, reminder cadences, global blocked dates, surveyor user/type/region management
- Settings: Integrations — Microsoft Outlook/Teams integration (Tenant ID, Client ID, Secret), timezone selector, email confirmation templates (User Confirmation, Client Confirmation, Reschedule)

**Key risks:**
- Outlook integration requires Azure App Registration — client IT involvement needed early
- Teams links only work when integration is fully configured
- No conflict detection on one-off appointments
- No test-send on confirmation templates

**Dependencies:** Appointment Schedules, Survey Types, Microsoft Teams/Outlook, Client Hub, Client Requests, Lead Sources

---

## 2. Campaigns

Defines client journey context — groups clients, workflow automation, status routing, user allocation, and client portal supporting documents.

**Key areas:**
- Create/View Campaigns — campaign name, client facing name, spend, status assignment, workflow triggers (IF/THEN rules), supporting document attachments
- Campaign Statuses — internal and client-facing status labels
- User Allocation — daily/weekly/monthly client intake limits per user per campaign; active/inactive toggle
- My Working Hours — per-user working hour schedules governing when automated actions fire
- API Actions — configure outbound API calls triggered by campaign workflow; supports POST/GET/DELETE/PATCH; body/header/variable mapping from Client Hub, Campaign, Form Builder Pro, Appointments; error handling alerts
- API Action Logs — audit log of all API calls triggered by campaign workflow

**Key workflow trigger conditions:** new client assigned, status changes, client at status for time, journey completed, day of month, client updated, opts out on journey, transfer status changes, client created less than, client assigned/unassigned, anniversary date, time is

**Key workflow actions:** start/complete/cancel journey, change client status, send message, assign/reassign user, call API, create task from template, auto book appointment, change transfer status, run PCP credit search, generate/email case documents, update all case statuses

**Key risks:**
- Workflow triggers require individual Save per row — unsaved triggers lost on navigation
- No visual workflow diagram
- Campaigns go live immediately on Create
- No campaign duplication feature

**Dependencies:** Client Journeys, Task Manager, Appointments, Supporting Documents, Message Templates, Client Hub, Form Builder Pro, external APIs

---

## 3. Case Hub

Manages the full lifecycle of a case (financial/legal claim e.g. PCP mis-selling, personal injury).

**Key areas:**
- Create A New Case — link to existing client, select lender, case category, funder, email status, financial metadata; "Documents need to be generated" checkbox
- View All Cases — filter by lender, status, lead source, email status, category, date, funder; row actions: edit, view client, delete, resend case
- Bulk Import — CSV/Excel upload (max 10MB, 10,000 rows); creates or updates cases based on Case Hub ID presence; strict validation rules
- Bulk Download — retrieval page for async export jobs
- Custom Reports — scheduled report builder combining case, client and form data; email delivery; password protection option
- Case Categories — reference list (e.g. PCP, Personal Injury)
- Case Statuses — dual internal/client-facing labels with hex colour per status
- Case Workflows — IF/THEN automation: triggers (case created, status changed, status duration, sent to lender); actions (update status, generate document, send email to lender/client, resend, generate and email related documents)
- Funders — reference list of funder organisations

**Key risks:**
- Case Reference is free text (no auto-generation)
- No bulk status change from list view
- Delete has no confirmation modal
- Case Workflows have no execution log — test all IF/THEN rules end-to-end
- Time-based triggers use minutes only

**Dependencies:** Client Hub, Lenders module, Form Builder Pro, Fast Sign/Document Templates, Email Templates

---

## 4. Client Hub

Central client record management.

**Key areas:**
- View Existing Clients — paginated list, 9 filter dimensions, bulk status change, bulk assign, per-row actions (edit, delete, create appointment, client request, add note, create task)
- Add A Client — multi-tab form: client details, forms, document uploads, vehicles, DVLA check; email or mobile required
- Client Record (Edit Client) — 22+ tabbed sections: Client Details, Additional Info, Partner Info, Applicant Two, Searches, Lenders, Assets, Income, Expenditure, Cases, Forms, Document Uploads, AI Document Scanner, Chat, Email, WhatsApp, Initial Contact, Credit Searches, DVLA Check, Transfer, Received Items, Companies House, Ascend Form; right-hand panel: Notes, Contact Log, Tasks, Campaigns, Client Requests, Appointments, Connected Clients, Generate Documents, Audit Trails, Duplicates
- Bulk Import — XLSX upload to create client records in bulk
- Bulk Status Updater — XLSX upload to update campaign statuses in bulk
- Bulk Download — export job retrieval
- Deleted Clients — log of deleted records with export
- Exit Dispositions — configure exit reason labels used when clients exit a process
- Exit Disposition Report — export of exit disposition data

**Key risks:**
- Income/Expenditure tabs have very large number of line items — complex to configure and train
- 22+ tabs can overwhelm new users — training plan essential
- No inline duplicate detection at Add A Client
- Anniversary date is free text

**Dependencies:** Lead Sources, Case Hub, Form Builder Pro, Client Requests, Appointments, Campaigns, Fast Sign, Email/WhatsApp Templates, Ascend, Credit Search/AML, DVLA, Companies House

---

## 5. Client Requests

Handles outbound document and information requests sent to clients.

**Key areas:**
- Create New — link existing client, select reminder rule, lead source, document types, Form Builder Pro form, Is Journey toggle, Is Joint toggle, supporting document upload, signature document, information feed, message template, custom email/SMS, save as draft or send
- View Existing — filter by date type, URL opened, downloaded, user, status, lead source, remaining reminders, journey, reminder rule, appointments type; bulk assign, bulk delete, bulk archive
- Bulk Client Request — XLSX bulk sender with Incremental Delivery option (paces sends to avoid spam filters)
- Export Download — retrieval queue for async export jobs

**Key risks:**
- Message templates not retained on Draft save
- Special characters in email/SMS body increase SMS character count
- No preview before sending
- Bulk sends cannot be recalled once triggered

**Dependencies:** Client Hub, Reminder Rules, Lead Sources, Client Journeys, Document module, Form Builder Pro, Message Templates, Fast Sign/ESign, SMS/Email gateway

---

## 6. Fast Sign (E-Sign)

Electronic signature module for document templates.

**Key areas:**
- Manage Templates — upload PDF/Word/Excel/XML/RTF; place merge fields (Signing Date, Text Fields A/B/C, Signature Fields, Form Builder Pro Fields, Creditors Fields, Case Hub Fields); supports up to 6 signers and 6 witnesses; Forward After Completion option links to Form Builder Pro form post-signing
- Slug Tags Reference — lists all merge tag syntax (standard and dynamic); Form Builder Pro question selector for generating field tags
- Template Folders — organise templates into a drag-and-drop folder hierarchy
- Dynamic Fields — create custom data fields usable as additional merge tags; configure data type, size, mandatory flag, visibility (Client Hub, Bulk Template, E-Sign Merge Fields)
- E-Sign Settings — signature input methods (finger, upload, typing); behaviour toggles (quick completion, start popup, audit trail, sign all, jump to mandatory only, information feed); Agree Button label; global font for merged document output

**Key risks:**
- Template must be prepared outside FastDox with merge tag placeholders already inserted before upload
- Disabling audit trail removes legally significant evidence
- No version control for templates
- No test-signing preview — every template must be manually tested

**Configuration best practices:**
- Use dynamic Word documents with slug tags (not merge tags) where client name/address appears inline — prevents text overlap for long values
- Not available for PCP module documents
- Match font/size to original document

**Dependencies:** Form Builder Pro, Client Hub, Creditors module, Case Hub

---

## 7. Form Builder Pro

Drag-and-drop custom data-capture form builder.

**Key areas:**
- Build A New Form — form name; Show This Form In (Client Hub, Case Hub, Client Hub tab, Client Portal); Answers Options (don't save against client, hide from roles, read only for roles, historical data)
- Components — Basic (Text Field, Text Area, Number, Password, Checkbox, Select Boxes, Select, Address Lookup, Company Finder, Radio, Button); Advanced (Day, Hidden, Datagrid, Creditor List, Email, Client Hub Details Input/Dates/Selections, URL, Phone Number, Tags, Address, Date/Time, Time, Currency, Survey, Signature); Layout (Container, HTML Element, Content, Columns, Field Set, Panel, Table, Tabs, Well); Pre-Define Keys for audit fields (IP Address, Date Time, Device Type, Device Platform)
- View Existing Forms — list, search, edit, copy/embed code, reorder, delete

**Key risks:**
- No form preview mode — all forms must be tested in target context (Client Hub, Case Hub, Client Portal)
- No version history
- Client Hub Details components require correct field keys or data won't save
- No confirmation on delete
- No indication of where a form is currently in use

**Dependencies:** Client Hub, Case Hub, Client Portal, Lenders/Creditors module, Campaign module

---

## 8. Journeys (Client Journeys)

Guides clients through structured multi-step sequences.

**Key areas:**
- Create A New Journey — Journey Name, Description; Allow Opt Out of Reminders; Enable Welcome Text Pop Up; step-based builder (each step has: Information Feed with CKEditor rich text, Require Authentication toggle, Message Template, Reminder Rule); Add New Step button; right-panel journey-level attachments (Document, Inline Document, Form Builder Pro form, Hard Form, Scenario, Supporting Documents)
- View Existing Journeys — listing with step count, created/updated dates; view, edit, delete actions
- Journey Scenarios — conditional question sets tied to a Form Builder Pro form; define Question/Query/Value/Client Request Type/Optional rows for branching logic; attached to journeys via right panel
- Information Feed Salutations — merge tags from Client Hub, Case Hub, Client Requests for personalisation

**Key risks:**
- Right-panel attachments are journey-level not step-level
- No client-facing preview
- No step re-ordering
- No duplicate/clone functionality
- No delete confirmation
- Scenarios only attach at journey level, not step level
- Mobile compatibility must be verified for all journey content

**Dependencies:** Message Templates, Reminder Rules, Form Builder Pro, Scenarios, Client Hub, Case Hub, Client Requests, Campaigns, Supporting Documents module

---

## 9. Lead Management

Manages the inbound lead funnel.

**Key areas:**
- Lead Pool / Lead Maximiser — six summary tiles (Complete, Incomplete Active, Opened, Partially Complete, Incomplete Ended, Unsubscribed); rich filter bar; bulk assign; Excel export
- View Leads — raw table of API/imported leads
- Bulk Import — XLSX-based bulk lead import
- Settings – General (Lead Maximiser) — welcome text; initial/secondary/final information feeds; feature toggles (opt-out, dynamic form, I&E step, contact step, live chat, expiry emails); document type multi-select; E-Sign Template; completion notification email; screen order drag-and-drop
- Settings – Lead Sources — name, cost per lead, total cost, branding, colour, logo, SMS/email sender name, message header/footer/email footer, message salutations; Lead Users sub-section
- Settings – Lead Status — simple name-only status library for tracking lead progression

**Key risks:**
- Global Lead Maximiser settings with no per-source override
- No preview mode
- Cost tracking is informational only — no automated alerts
- Lead Users is separate from system Users module

**Dependencies:** Form Builder Pro, Fast Sign, Client Hub, Campaigns, Reports

---

## 10. Lenders

Reference data module for lender/creditor records. Lenders are selected at Case Hub case creation and referenced in Case Hub workflows, bulk imports, and custom reports. The Lenders module populates the Lender Name dropdown across the platform. Configuration is simple: Name and any associated metadata. Creditor ID is used in Case Hub bulk imports.

**Dependencies:** Case Hub, Case Workflows, Bulk Import

---

## 11. Location Zone

Module for defining geographical coverage zones. Used in conjunction with the Appointments module (Survey Regions) for assigning surveyors to geographic areas. Enables location-based routing of appointment bookings and surveyor assignment.

**Dependencies:** Appointments module

---

## 12. Other

Catch-all module area covering miscellaneous platform features and settings not covered by named modules. May include system-wide configuration, notification settings, integrations not covered elsewhere, or platform-level administration features.

---

## 13. Payment Module

Handles payment collection and processing. Key capabilities include payment plan configuration, payment link generation to clients, and tracking of payment statuses. Integrated with the client record and campaign workflows to trigger payment-related journeys. Supports direct debit and card payment collection depending on configuration.

**Dependencies:** Client Hub, Campaigns

---

## 14. Reports

Reporting and analytics module.

**Key areas:**
- Campaign reports, lead admin reports, lead conversion reports, campaign spending reports
- Status reports across campaigns and cases
- Custom report builder (also available within Case Hub) combining case, client, and form data with scheduled email delivery
- Exit Disposition Report
- All reports support filtering by Lead Source, Campaign, Status, Date Range, and other configured dimensions

**Dependencies:** Campaigns, Case Hub, Client Hub, Form Builder Pro

---

## 15. Settings

Platform-wide system settings covering: user management, role and permission configuration, notification preferences, system integrations (beyond those in specific modules), branding/white-labelling, API credentials management, and global defaults. The Settings module is the administrative backbone of the platform — changes here can affect behaviour across all other modules.

---

## 16. Task Manager

Manages tasks created for and assigned to team members, linked to client records.

**Key areas:**
- Task creation from client records or from campaign workflow automation ("create new task from template")
- Task templates for common repeatable task types
- Task board with status tracking (To Do, In Progress, Done, Blocked)
- Priority, assigned resource, duration, due date, and completion date tracking
- The Task Management Board provides visibility of smaller activities that fall outside full project scope

**Dependencies:** Client Hub, Campaigns (workflow action "create task from template"), User management
