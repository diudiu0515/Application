# PhD Application Intelligence System

A local-first decision workspace for a 2028 Fall US Computer Science / AI PhD application. It connects programs, faculty, candidate research, evidence, research fit, deadlines and application execution in one maintainable system.

## Why this architecture

The deployed MVP is a static GitHub Pages application. It needs no server and remains editable in the browser. Changes are saved in localStorage and every mutation creates an audit-history entry. JSON export/import provides portable backups.

This is the right first deployment model for a personal workspace, but browser data does not automatically sync between devices. Export a JSON backup regularly. A complete Prisma relational model is included for a later SQLite/PostgreSQL or authenticated cloud migration.

## Included MVP

- Editable candidate profile and research projects
- Five seeded PhD programs across three or more schools
- Ten seeded faculty profiles and consideration workflow
- Faculty × Project research-fit matrix with seven dimensions, explanation and pitch
- Research completion and high-fit investigation queue
- School priority list with faculty-depth risk
- Application tracker and status funnel
- Deadline timeline and tasks
- Source, confidence and verification layer
- Local change history, dark mode, global search, responsive layout
- JSON backup and restore
- GitHub Pages deployment workflow

Seed values are illustrative and explicitly marked for re-verification. They are not 2028 admissions facts.

## Run locally

No dependency installation is required.

```bash
npm start
```

Open <http://localhost:8080>. You may also use any static HTTP server.

Syntax validation:

```bash
npm run check
```

## How to use

- Add a school/program from **Programs → Add program**.
- Add a professor from **Faculty → Add faculty** and assign the program.
- Add or edit a project under **My Research → Projects**.
- Inspect fit at **Research Match**. Seeded matches include dimension scores and explanations. New pairs are intentionally unscored until assessed.
- Move schools into execution through **Application Tracker → Add application**.
- Change faculty consideration and contact states directly in their tables.
- Add official or community evidence in **Sources & Verification**.
- Export a full backup from the header or **Settings & Data**.

## Data and database design

Runtime data lives in `seed.js` initially and localStorage after the first edit. It is not embedded in rendering components. `prisma/schema.prisma` defines the normalized future database, including:

- CandidateProfile, ResearchProject, Publication and CvItem
- School, Program, Ranking, Faculty, Paper and LabMember
- FacultyProjectMatch, SchoolPriority and faculty research checklists
- Application, tasks, SOPs, recommenders, contacts, interviews, offers and costs
- Sources, verification records, evidence claims, notes and timeline events

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for information architecture and evidence rules.

## Deploy to GitHub Pages

Push `main`; `.github/workflows/pages.yml` deploys the repository root. In repository settings, set **Pages → Source** to **GitHub Actions** if it is not already selected. The expected URL is:

`https://diudiu0515.github.io/Application/`

## Roadmap

1. Paper CRUD, reading queue and project relevance gaps
2. SOP workspace, recommendation and personalized contact drafting
3. Lab-member/alumni intelligence and Tsinghua network visualization
4. Interviews, offer weighting, standardized tests and costs
5. Optional encrypted multi-device synchronization
6. Traceable AI assistant and official-site evidence ingestion
