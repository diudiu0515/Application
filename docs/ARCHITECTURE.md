# Product architecture

The product is organized around the core relationship:

`School → Program → Faculty ↔ ResearchProject → Application`

Supporting evidence is attached through `Source`, `VerificationRecord`, and `EvidenceClaim`. User decisions are preserved separately from source facts so a status never destroys its rationale.

## Information architecture

- Dashboard: deadlines, funnel, research queue, tasks, evidence health
- Programs: requirements, funding, admission model, faculty depth
- Faculty: research fit, consideration, recruiting, completion, network and contact
- Research Match: dimension-level Faculty × Project scores and explanations
- Research: editable candidate profile and projects
- Applications: shortlist, checklist progress and status
- Planning: timeline, sources and verification
- System: audit history and portable backups

## Runtime decision

The deployed MVP is deliberately local-first: static HTML/CSS/JavaScript on GitHub Pages with browser localStorage. This satisfies serverless access and in-browser editing. JSON backup/restore provides portability; every mutation adds an audit event.

The complete relational design lives in `prisma/schema.prisma` for a later authenticated, multi-device deployment. Migrating means replacing the local repository adapter with an API-backed adapter while keeping the entities and UI workflow.

## Evidence rules

1. Official department, graduate school, faculty and lab sources have highest priority.
2. Professional sources can enrich but do not silently overwrite official facts.
3. Community statements remain claims and display uncertainty.
4. Recruiting, funding, deadlines and requirements require official confirmation.
5. Public contact details retain their source; private addresses are never inferred.
