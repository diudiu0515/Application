# Full requirements acceptance matrix

Source of truth: `requirements/command.md`. A module is **done** only when its data model, usable UI, persistence, validation, source handling, and relevant CRUD workflow are implemented.

| # | Module | Current status | Acceptance gap |
|---:|---|---|---|
| 1 | Candidate background | Partial | GPA and focus exist; education, skills, experience, papers and keyword CRUD incomplete |
| 2 | Core decision questions | Partial | Core path exists; tests, recommendations, interviews and offers missing |
| 3 | Dashboard | Partial | Basic stats/queue exist; full deadline and verification analytics incomplete |
| 4 | School / Program database | Partial | Core fields only; international, detailed funding, placement and ranking history missing |
| 5 | Faculty database | Partial | Core profile exists; papers, models, datasets, labs and recruiting evidence incomplete |
| 6 | Research Fit | Partial | Seeded dimensions exist; editable weights and evidence-derived recalculation incomplete |
| 7 | Faculty × Project matrix | Partial | Matrix exists; score editing and full explanation CRUD incomplete |
| 8 | Paper tracking | Missing | Implement full paper CRUD, relevance, gaps and reading workflow |
| 9 | School shortlist | Partial | Strategy score exists; editable dimensions, weights and rationale incomplete |
| 10 | Application tracker | Partial | Status exists; complete checklist item CRUD and dates missing |
| 11 | SOP management | Missing | Master/school documents, sections, versions and project reuse |
| 12 | Recommendations | Missing | Recommenders, per-school state, materials and reminders |
| 13 | Professor contact | Partial | Status exists; personalized draft, citations, replies and follow-ups missing |
| 14 | Deadline calendar | Partial | Timeline exists; monthly/school views and all event types missing |
| 15 | Standardized tests | Missing | TOEFL/IELTS/GRE scores and requirement comparison |
| 16 | Research portfolio | Partial | Projects exist; artifacts, collaborators, advisor and outputs incomplete |
| 17 | Publication tracker | Missing | Full publication lifecycle and dates |
| 18 | CV builder data | Missing | Structured sections and exports |
| 19 | Interview tracker | Missing | Preparation, notes and follow-up |
| 20 | Offer comparison | Missing | Raw dimensions, custom weights and calculated score |
| 21 | Cost tracker | Missing | Estimated/actual costs by category |
| 22 | Source credibility | Partial | Sources exist; field-level verification and precedence incomplete |
| 23 | Notes and tags | Missing | Polymorphic notes, tags and quick capture |
| 24 | Search and filters | Partial | Search exists; specified multi-dimensional filters incomplete |
| 25 | Page structure | Partial | MVP navigation only |
| 26 | UI design | Partial | Theme/responsive/table/card exist; charts and calendar incomplete |
| 27 | Database relations | Design only | Prisma schema exists; runtime still local JSON repository |
| 28 | Import/export | Partial | JSON works; CSV imports and entity exports missing |
| 29 | Future AI | Schema-ready only | Traceable assistant actions not implemented |
| 30 | Update mechanism | Partial | Weekly faculty run exists; per-field recheck policies incomplete |
| 31 | Technical implementation | Adapted | Static local-first deployment chosen; migration schema retained |
| 32 | Development phases | In progress | MVP partially complete; later phases missing |
| 33 | MVP | Partial | Core flow exists but CRUD depth and data quality incomplete |
| 34 | Delivery requirements | Partial | README exists; complete verification and CRUD acceptance missing |
| 35 | Lab member / alumni intelligence | Missing | Members, public contacts, Tsinghua flags and scores |
| 36 | Faculty consideration | Partial | Status exists; full progress checklist and metrics missing |
| 37 | Faculty decision notes | Partial | Why/concerns exist; decision history/rationale workflow incomplete |
| 38 | Multi-channel intelligence | Missing | Tiered source ingestion and claim separation |
| 39 | Community intelligence | Missing | Categories, aggregation and uncertainty views |
| 40 | Source triangulation | Missing | Multiple evidence items per claim and precedence engine |
| 41 | Faculty evidence timeline | Missing | Evidence/research/contact event timeline |
| 42 | Tsinghua network | Missing | Dedicated network data and filters |
| 43 | Faculty shortlist workflow | Partial | Status exists; explicit stage pipeline incomplete |
| 44 | Faculty completion score | Partial | Stored percentage exists; weighted checklist calculation missing |
| 45 | Quick and bulk operations | Missing | Selection, bulk tags/status/recheck actions |
| 46 | Search and confirmation principle | Partial | Auto records unverified; review/reject/confirm queue incomplete |
| 47 | Faculty detail layout | Partial | Only a small detail modal exists |
| 48 | Faculty research queue | Partial | Basic high-fit queue exists; all rule types/actions incomplete |

## Data-quality acceptance gate

Automated faculty data is not accepted merely because a crawler emitted a row. A record must pass:

1. person-name and faculty-role validation;
2. official department/profile URL validation;
3. CS PhD advising-eligibility review;
4. primary multimodal/robotics or secondary research-family evidence;
5. duplicate and stale-profile checks;
6. human status of confirmed, rejected, or needs-more-evidence;
7. no recruiting claim without a dated source.

Current automated run: 50 schools scanned, 24 with candidates, 26 with zero candidates, 87 fetch/structure errors. This run is discovery evidence, not accepted faculty coverage.
