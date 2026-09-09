# PhD Application Intelligence System

A local-first workspace for a 2028 Fall US Computer Science / AI PhD application, calibrated for a 3.3 GPA and prioritizing multimodal AI, robotics, embodied AI, video/spatial reasoning, benchmark and data work.

Live site: **https://diudiu0515.github.io/Application/**

## What is implemented

The application follows the complete workflow `School → Program → Faculty ↔ Research Project → Application` and implements all 48 product modules in the private specification:

- editable candidate profile, projects, publications, CV data and research outputs;
- Top 50 program research set with GPA-aware Dream/Reach/Target/Lower Risk strategy;
- recurring official-site faculty discovery, per-school coverage audit and human confirmation gate;
- complete program requirements, international rules, funding, rankings and admission-model fields;
- complete faculty profiles, weighted fit matrix, papers, lab members, Tsinghua network, decision notes and an 18-item research checklist;
- shortlist, application checklist, SOP, recommendations, professor contact, tests, calendar, interviews, offers and costs;
- summer-research eligibility and execution scoring for a Tsinghua undergraduate;
- official/community evidence separation, field-level verification, triangulation, faculty timeline and traceable generated-content registry;
- global search, requested filters, quick checks, bulk operations, JSON backup/restore and CSV exchange for every entity.

Automated faculty rows are candidate evidence, not confirmed facts. Recruiting, funding, deadlines and 2028 requirements remain visibly unverified until an official source is checked. See [Top 50 research methodology](docs/TOP50_RESEARCH.md) and the [48-module acceptance matrix](docs/REQUIREMENTS_MATRIX.md).

## No server required

The deployed app is static HTML/CSS/JavaScript on GitHub Pages. Edits are saved to browser `localStorage`; every mutation appends a timestamped audit event in **Change History**. No backend or account is required.

Browser storage is device/profile specific. Use **Settings & Data → Export JSON** for a complete portable snapshot. JSON import restores the workspace, and per-entity CSV import/export supports structured exchange. Clearing browser data without a backup will remove local edits.

## Faculty refresh

`scripts/collect_faculty.py` scans configured official university, department, research-area and faculty pages every Monday through GitHub Actions. The output includes all 50 schools, every discovered direction-related candidate, explicit zero-result schools, fetch errors and provenance. Only individually configured official professor pages may be used when a live profile fetch fails; these rows are labeled `official_roster_fallback`. Research-roster links alone are never promoted because rosters can contain students and staff. No automated row is marked confirmed.

Direction priority is:

1. multimodal / vision-language models;
2. robotics / embodied AI;
3. video, egocentric and ego-exo understanding;
4. spatial interaction and human-object reasoning;
5. affective/social intelligence as an adjacent direction.

Initial school priority weights discovered direction depth at 65%, the custom research-set rank proxy at 20%, and GPA 3.3 portfolio viability at 15%. Final decisions remain editable and should be based on verified advisor depth, research fit, funding and outcomes.

## Future evolution

- Re-verify every deadline, test rule, funding field and recruiting claim against the official 2028 cycle pages when published.
- Add authenticated cross-device sync only if needed; the validated Prisma model is the migration path to SQLite/PostgreSQL.
- Extend paper, lab-member and summer-opportunity collection while preserving the candidate-evidence and human-confirmation boundary.
- Add model-assisted summaries, SOP blocks and outreach drafts only when every output stores its source entity IDs in `AiTrace`.

## Local validation

The site itself has no runtime dependencies. To serve it locally:

```bash
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

Run the automated checks with:

```bash
python3 -m unittest tests/test_collector.py
PYTHONPATH=/tmp/application-jscheck python3 tests/runtime_smoke.py
python3 -m py_compile scripts/collect_faculty.py tests/runtime_smoke.py tests/test_collector.py
DATABASE_URL=file:./dev.db npx --yes prisma@6.19.0 validate --schema prisma/schema.prisma
DATABASE_URL=file:./dev.db npx --yes prisma@6.19.0 migrate deploy --schema prisma/schema.prisma
DATABASE_URL=file:./dev.db npx --yes prisma@6.19.0 migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --exit-code
```

GitHub Actions additionally runs Node syntax checks, installs QuickJS for the static runtime smoke test, and deploys `main` to Pages.

## Architecture

Runtime data is separated from rendering and merged from `seed.js`, the generated Top 50 evidence file and browser-local changes. The normalized future migration model is in `prisma/schema.prisma`; it does not require a database for the deployed local-first app. See [architecture and evidence rules](docs/ARCHITECTURE.md).
