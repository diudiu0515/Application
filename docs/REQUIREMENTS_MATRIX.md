# Full requirements acceptance matrix

Product source of truth: the private 48-module specification. This public document summarizes acceptance evidence without republishing private source material.

“Implemented” means the data model, usable UI, browser persistence, audit history and relevant add/edit workflow exist. Current admissions facts are a separate data-quality concern: unpublished 2028 requirements remain `needs_recheck` and automated faculty remain `needs_review`.

| # | Module | Status | Acceptance evidence |
|---:|---|---|---|
| 1 | Candidate background | Implemented | Editable profile, GPA 3.3, education, skills, keywords, experience, projects, outputs; signals feed faculty scoring. |
| 2 | Core decision questions | Implemented | Programs, requirements, faculty fit/recruiting, shortlist, materials, submission, interview and offer workflows answer the 21 questions. |
| 3 | Dashboard | Implemented | 10 exact statistics, three-part countdown, tasks, unified deadlines, full funnel, faculty progress, verification and recommendation queues. |
| 4 | School / Program database | Implemented | Full identity, dated rankings, application, requirements, international, funding, admission and environment fields in complete record modal. |
| 5 | Faculty database | Implemented | Full links, research assets, papers, recruiting evidence, decisions, checklist, network, contact and sources per faculty. |
| 6 | Research Fit | Implemented | Editable normalized weights; multimodal and robotics are highest; dimension values, explanation and pitch are preserved. |
| 7 | Faculty × Project matrix | Implemented | Every confirmed/curated faculty × every project; blank stays unassessed; click to create/edit evidence dimensions. |
| 8 | Paper tracking | Implemented | CRUD for metadata, abstract, relevance, gap, importance and reading state. |
| 9 | School shortlist | Implemented | Editable dimensions/weights, GPA risk, best/backup faculty, advisor depth, why-apply and risks. |
| 10 | Application tracker | Implemented | Full funnel and 17-item default checklist plus custom tasks, deadlines, completion dates and notes. |
| 11 | SOP management | Implemented | Master/school records, seven sections, versions and traceable project-block insertion. |
| 12 | Recommendations | Implemented | Recommenders, per-school requests, materials, submission/thanks, and 7/3/day reminder window. |
| 13 | Professor contact | Implemented | Evidence-based draft, faculty reference, own project, cited paper, send/reply/follow-up and response type. |
| 14 | Deadline calendar | Implemented | Applications, recommendations, tests, interviews, meetings, SOP/custom and summer events; month/timeline/school views and urgency. |
| 15 | Standardized tests | Implemented | TOEFL/IELTS/GRE records, sections, targets and program readiness comparison. |
| 16 | Research portfolio | Implemented | Projects include motivation, method, contribution, outputs, collaborators, advisor, venue, code, demo, dataset and presentation. |
| 17 | Publication tracker | Implemented | Working through resubmission lifecycle with authorship and submission/review/camera-ready dates. |
| 18 | CV builder data | Implemented | Eight structured sections and separate Academic/Application JSON exports. |
| 19 | Interview tracker | Implemented | Meeting metadata, six-part preparation, question/answer notes, faculty comments and follow-up. |
| 20 | Offer comparison | Implemented | All raw dimensions, per-offer JSON weights and transparent calculated score. |
| 21 | Application cost tracker | Implemented | Required categories, estimated/actual totals and per-application records. |
| 22 | Source credibility | Implemented | Source registry, field-level observations, authority precedence, last checked, confidence, status and conflicts. |
| 23 | Notes and tags | Implemented | Polymorphic notes CRUD, faculty quick notes and five requested seed tags. |
| 24 | Search and filters | Implemented | Global program/faculty/paper/project/note search; exact faculty and program filter dimensions. |
| 25 | Page structure | Implemented | Requested sidebar groups plus Sources, Summer Research, Lab/Tsinghua, Community, Timeline and History. |
| 26 | UI design | Implemented | Academic information-dense cards/tables, responsive layout, light/dark themes, funnel, timelines and calendar. |
| 27 | Database relations | Adapted / implemented | Normalized Prisma design and generated SQLite migration cover core and extended entities. Deployed runtime uses equivalent local collections to satisfy no-server editing. |
| 28 | Import / export | Implemented | Full JSON backup/restore and CSV import/export for all 25 operational entity collections. |
| 29 | Future AI | Implemented as extension contract | AiTrace requires output/source entity IDs; trace registry and SOP project-block generation demonstrate provenance. |
| 30 | Update mechanism | Implemented | Weekly official-source collector, dated sources, stale/unknown queues, per-field recheck and scheduled manual rechecks. |
| 31 | Technical implementation | Adapted / implemented | Static GitHub Pages + vanilla JS is deliberate for no-server use; localStorage and portable backups replace the recommended full-stack runtime. |
| 32 | Development phases | Implemented | All five phase scopes are present; automatic discovery and traceable AI foundation are included. |
| 33 | MVP workflow | Implemented | Add program → faculty → research → fit → application → deadline → status is usable and persistent. |
| 34 | Delivery requirements | Implemented | Seed data, architecture, validated Prisma schema/migration, docs, tests, CI, Pages deployment and operating instructions. |
| 35 | Lab member / alumni intelligence | Implemented | Full education, Tsinghua, public contact provenance, role, destination, score and rationale CRUD. |
| 36 | Faculty consideration | Implemented | All eight states, quick controls, 18-item checklist objects with completed/completedAt/notes, and dashboard totals. |
| 37 | Faculty decision notes | Implemented | Why Consider, Concerns and Decision Rationale are separate editable fields preserved through auto refresh. |
| 38 | Multi-channel intelligence | Implemented | Official/professional/community types remain separate; nonofficial claims never become confirmed fields automatically. |
| 39 | Community intelligence | Implemented | All requested categories, raw reports, aggregation, corroboration/contradiction and confidence display. |
| 40 | Source triangulation | Implemented | Multiple field observations are grouped; conflicts shown; official-source authority outranks community evidence. |
| 41 | Faculty evidence timeline | Implemented | CRUD timeline for research, recruiting, network and contact events with date and source URL. |
| 42 | Tsinghua network | Implemented | Member and network modes with school, faculty, department, year, role, Tsinghua and research filters. |
| 43 | Faculty shortlist workflow | Implemented | Derived visible stage from Discovered through decision/contact/application checkpoints. |
| 44 | Faculty completion score | Implemented | Exact 10/10/20/15/15/10/5/5/5/5 grouped weighting; explicitly separated from faculty quality. |
| 45 | Quick and bulk operations | Implemented | Six row checkboxes plus confirm/review/consider/not-consider/high/recruiting/papers/contact/tag/recheck bulk actions. |
| 46 | Search and confirmation principle | Implemented | Automated rows enter needs_review candidate evidence; confirmed/rejected/needs-more-evidence human gate is retained. |
| 47 | Faculty detail layout | Implemented | All 13 requested sections, header metrics and six quick actions, plus evidence timeline and full-profile editor. |
| 48 | Faculty research queue | Implemented | All specified missing-evidence rules, strategic sorting and Continue Research action. |

## Cross-cutting acceptance gates

- Static/no-server: GitHub Pages serves the application; editing uses browser localStorage.
- Modification history: every `persist()` mutation creates a timestamped Change History event; JSON backup contains history.
- Data portability: complete JSON snapshot plus CSV import/export for every operational collection.
- Top 50 visibility: the Faculty page exposes scanned schools, candidate counts, covered and zero-result schools and the full per-school audit.
- Evidence safety: an official URL is not the same as a confirmed claim; candidate discovery, 2028 deadlines, recruiting and funding require human verification.
- Candidate calibration: multimodal and robotics are primary; GPA 3.3 changes admission/portfolio priority, never the academic research-fit score; summer feasibility is scored separately.

## Automated checks

- `tests/test_collector.py`: parser noise controls, name validation, direction gate, 50 unique schools, one adapter per school and GPA-aware priority.
- `tests/runtime_smoke.py`: loads the browser scripts in production order, renders every route, checks schema version and opens a faculty detail workspace.
- GitHub Actions: JavaScript syntax, Python compile/tests, JSON validation, Prisma schema/migration/drift checks, QuickJS runtime smoke and Pages deployment.
