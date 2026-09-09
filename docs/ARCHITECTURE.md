# Product architecture

The core graph is:

`CandidateProfile → ResearchProject ↔ Faculty → Program → Application`

`Source → VerificationRecord / CommunityClaim → Faculty or Program` supplies the evidence layer. User decisions, completion state and change history remain separate from source claims so refreshes do not erase judgment.

## Runtime layers

1. `seed.js`, `modules-data.js` and `summer-data.js` provide editable initial records.
2. `data/generated-faculty.js` supplies recurring Top 50 candidate evidence.
3. `mergeAuto()` updates discovery evidence while preserving human review, consideration, contact, tags, checklists and decision rationale.
4. browser `localStorage` is the active no-server repository.
5. JSON backup/restore is the portable full snapshot; CSV handles entity-level exchange.
6. every mutation calls `persist()` and appends a timestamped history event.

This is a deliberate static/local-first deployment on GitHub Pages. `prisma/schema.prisma` is the normalized migration design for a future authenticated SQLite/PostgreSQL deployment, not a hidden server dependency.

## Information architecture

- Core: Dashboard, Programs, Faculty, Research Match.
- My Research: candidate profile/projects, papers, publications and CV data.
- Applications: school list, application checklist, SOP, recommendations and professor contact.
- Planning: summer research, unified calendar, tests, costs, sources/verification and notes.
- Faculty Intelligence: lab/Tsinghua network, community claims and evidence timeline.
- Results: interviews and offers.
- System: immutable-style audit history and data tools.

## Evidence precedence

1. official graduate school, department, university profile, faculty/lab and dated recruiting pages;
2. scholarly/professional pages such as DBLP, Semantic Scholar, OpenReview, GitHub or public member profiles;
3. community reports retained as anecdotes with raw wording and status.

A high-impact value (deadline, requirement, funding or recruiting) is confirmed only by a dated official field observation. Community claims never overwrite official fields. Conflicting active observations remain visible. Public contact data must retain a source; private contact details are never inferred.

## Faculty discovery and decisions

The collector scans the configured Top 50 official entry points and emits direction-related `needs_review` candidates. Live page keyword matches and conservative official-roster fallbacks are distinguishable. Per-school zero results and fetch errors are part of the product UI and report.

Research fit and research completion are intentionally different:

- fit measures topic/method/data/multimodal/robotics/LLM/recent work/collaboration alignment;
- completion measures how much evidence the applicant has investigated;
- GPA affects admission-risk and portfolio strategy, not faculty research quality;
- summer opportunities have separate academic-fit and executable-eligibility scores.

See [the full acceptance matrix](REQUIREMENTS_MATRIX.md) and [Top 50 methodology](TOP50_RESEARCH.md).
