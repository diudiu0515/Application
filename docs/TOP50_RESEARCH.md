# Top 50 faculty discovery research

> Snapshot: 2026-09-09 · 244 candidate faculty · 50/50 schools with at least one current or explicitly stale candidate set · 0 zero-result schools.

## Scope and interpretation

This is a user-defined 50-school US CS research set, not an official ranking. Coverage means the collector found at least one faculty candidate connected to multimodal AI or robotics/embodied AI; it does **not** mean recruiting, advising eligibility, funding or 2028 availability is confirmed.

Every automated record enters `needs_review`. A record becomes a confirmed faculty target only after human review, and recruiting becomes confirmed only through a dated official `VerificationRecord`. Fetch failures are retained in `data/collection-report.json` instead of being silently treated as negative evidence.

## Discovery method

- Sources are configured university, department, research-area, faculty, lab and official profile pages.
- A live profile must contain a faculty-role signal and a primary multimodal or robotics/embodied direction. A single generic word such as “robotics” is insufficient; one precise primary phrase or at least two direction signals are required.
- If a profile cannot be fetched, fallback is allowed only for a professor and official URL explicitly listed in the adapter configuration. A research roster alone is never promoted because it may include students, staff or section headings.
- If every current discovery route for a school fails, the prior candidate set is retained with `stale_previous_snapshot` mode and outdated/low-confidence source status. It remains visible for review but is never represented as a successful current fetch.
- Names are normalized and deduplicated per school. Navigation, UI labels, student-roster fallbacks and known section headings are rejected.
- The scheduled collector runs weekly. Refreshes update discovery evidence but preserve the applicant’s review status, consideration, checklists, contact state, tags and decision rationale.

Current family coverage is overlapping: `robotics_embodied` 144, `multimodal_vlm` 73, `llm_reasoning` 72, `benchmark_data` 67, `manual_primary_verification` 50, `spatial_interaction` 36, `affective_social` 25, `video_ego_exo` 21.

## GPA 3.3, school priority and summer research

GPA is used only for admissions-risk and portfolio planning; it never lowers a professor’s research-fit score. Initial program priority is 65% discovered direction depth, 20% the custom research-set rank proxy and 15% GPA-3.3 portfolio viability. The initial tier bands are Dream (1–8), Reach (9–22), Target (23–38) and Lower Risk (39–50), but no CS PhD is treated as a true safe option.

The editable shortlist then emphasizes verified faculty fit and advisor depth. Automated candidates do not count as confirmed advisor depth until reviewed. Summer research is a separate dimension: eligible/likely eligible routes receive execution credit, `needs_confirmation` receives only a small planning signal, and ineligible programs score zero regardless of academic prestige. The Summer Research page stores official source, eligibility, international-applicant status, deadline, funding, academic fit and executable priority separately.

2028 cycle requirements are generally not yet published. Generated deadlines are visibly labeled planning placeholders and must not be used as official submission dates.

## Per-school audit

Live, configured fallback and stale retained are reported separately. Stale rows come only from the previous snapshot after all current discovery routes failed, and their source status is downgraded. The link in every row is the configured official research entry used for recurring discovery.

| Set rank | School | Candidates | Live | Configured fallback | Stale retained | Fetch errors | Official research entry |
|---:|---|---:|---:|---:|---:|---:|---|
| 1 | Massachusetts Institute of Technology | 7 | 7 | 0 | 0 | 2 | [official page](https://www.eecs.mit.edu/) |
| 2 | Stanford University | 3 | 3 | 0 | 0 | 1 | [official page](https://www.cs.stanford.edu/) |
| 3 | Carnegie Mellon University | 11 | 11 | 0 | 0 | 3 | [official page](https://www.cs.cmu.edu/) |
| 4 | University of California, Berkeley | 4 | 0 | 4 | 0 | 5 | [official page](https://eecs.berkeley.edu/) |
| 5 | University of Illinois Urbana-Champaign | 28 | 28 | 0 | 0 | 2 | [official page](https://siebelschool.illinois.edu/) |
| 6 | Cornell University | 5 | 3 | 2 | 0 | 1 | [official page](https://www.cs.cornell.edu/) |
| 7 | University of Washington | 1 | 0 | 1 | 0 | 2 | [official page](https://www.cs.washington.edu/) |
| 8 | Georgia Institute of Technology | 1 | 1 | 0 | 0 | 2 | [official page](https://www.cc.gatech.edu/) |
| 9 | Princeton University | 9 | 9 | 0 | 0 | 3 | [official page](https://www.cs.princeton.edu/) |
| 10 | University of Texas at Austin | 11 | 10 | 1 | 0 | 3 | [official page](https://www.cs.utexas.edu/) |
| 11 | University of Michigan | 3 | 0 | 3 | 0 | 1 | [official page](https://cse.engin.umich.edu/) |
| 12 | University of California, San Diego | 2 | 0 | 2 | 0 | 3 | [official page](https://cse.ucsd.edu/) |
| 13 | University of California, Los Angeles | 3 | 1 | 2 | 0 | 2 | [official page](https://www.cs.ucla.edu/) |
| 14 | Columbia University | 5 | 5 | 0 | 0 | 0 | [official page](https://www.cs.columbia.edu/) |
| 15 | Harvard University | 1 | 1 | 0 | 0 | 2 | [official page](https://seas.harvard.edu/computer-science) |
| 16 | University of Pennsylvania | 3 | 1 | 2 | 0 | 1 | [official page](https://www.cis.upenn.edu/) |
| 17 | University of Wisconsin-Madison | 2 | 1 | 1 | 0 | 1 | [official page](https://www.cs.wisc.edu/) |
| 18 | University of Maryland, College Park | 10 | 10 | 0 | 0 | 1 | [official page](https://www.cs.umd.edu/) |
| 19 | Purdue University | 7 | 7 | 0 | 0 | 2 | [official page](https://www.cs.purdue.edu/) |
| 20 | University of Massachusetts Amherst | 1 | 0 | 1 | 0 | 4 | [official page](https://www.cics.umass.edu/) |
| 21 | University of Southern California | 12 | 12 | 0 | 0 | 0 | [official page](https://www.cs.usc.edu/) |
| 22 | Yale University | 2 | 2 | 0 | 0 | 0 | [official page](https://cpsc.yale.edu/) |
| 23 | Brown University | 3 | 0 | 3 | 0 | 2 | [official page](https://cs.brown.edu/) |
| 24 | Johns Hopkins University | 14 | 14 | 0 | 0 | 1 | [official page](https://www.cs.jhu.edu/) |
| 25 | New York University | 1 | 1 | 0 | 0 | 3 | [official page](https://cs.nyu.edu/) |
| 26 | Northwestern University | 8 | 8 | 0 | 0 | 2 | [official page](https://www.mccormick.northwestern.edu/computer-science/) |
| 27 | Duke University | 7 | 3 | 4 | 0 | 2 | [official page](https://cs.duke.edu/) |
| 28 | University of California, Irvine | 3 | 2 | 1 | 0 | 0 | [official page](https://ics.uci.edu/) |
| 29 | University of California, Santa Barbara | 7 | 7 | 0 | 0 | 3 | [official page](https://www.cs.ucsb.edu/) |
| 30 | University of North Carolina at Chapel Hill | 3 | 3 | 0 | 0 | 1 | [official page](https://cs.unc.edu/) |
| 31 | Rice University | 3 | 2 | 1 | 0 | 1 | [official page](https://csweb.rice.edu/) |
| 32 | University of Chicago | 3 | 1 | 2 | 0 | 2 | [official page](https://cs.uchicago.edu/) |
| 33 | University of Virginia | 2 | 0 | 2 | 0 | 1 | [official page](https://engineering.virginia.edu/department/computer-science) |
| 34 | Pennsylvania State University | 3 | 2 | 1 | 0 | 5 | [official page](https://www.eecs.psu.edu/) |
| 35 | Ohio State University | 1 | 0 | 1 | 0 | 3 | [official page](https://cse.osu.edu/) |
| 36 | Rutgers University | 3 | 0 | 3 | 0 | 1 | [official page](https://www.cs.rutgers.edu/) |
| 37 | Texas A&M University | 2 | 1 | 1 | 0 | 4 | [official page](https://engineering.tamu.edu/cse/) |
| 38 | University of Minnesota | 4 | 3 | 1 | 0 | 3 | [official page](https://cse.umn.edu/cs) |
| 39 | Virginia Tech | 3 | 2 | 1 | 0 | 2 | [official page](https://cs.vt.edu/) |
| 40 | Northeastern University | 19 | 19 | 0 | 0 | 2 | [official page](https://www.khoury.northeastern.edu/) |
| 41 | University of Colorado Boulder | 2 | 0 | 2 | 0 | 3 | [official page](https://www.colorado.edu/cs/) |
| 42 | Stony Brook University | 6 | 6 | 0 | 0 | 3 | [official page](https://www.cs.stonybrook.edu/) |
| 43 | University of California, Davis | 1 | 1 | 0 | 0 | 1 | [official page](https://cs.ucdavis.edu/) |
| 44 | University of Utah | 1 | 1 | 0 | 0 | 1 | [official page](https://www.cs.utah.edu/) |
| 45 | Washington University in St. Louis | 3 | 1 | 2 | 0 | 1 | [official page](https://engineering.wustl.edu/academics/programs/computer-science-engineering/) |
| 46 | University of Arizona | 2 | 0 | 2 | 0 | 3 | [official page](https://www.cs.arizona.edu/) |
| 47 | University of California, Santa Cruz | 2 | 2 | 0 | 0 | 1 | [official page](https://engineering.ucsc.edu/departments/computer-science-and-engineering/) |
| 48 | Boston University | 3 | 2 | 1 | 0 | 1 | [official page](https://www.bu.edu/cs/) |
| 49 | Arizona State University | 2 | 1 | 1 | 0 | 1 | [official page](https://scai.engineering.asu.edu/) |
| 50 | University of Rochester | 2 | 0 | 2 | 0 | 1 | [official page](https://www.cs.rochester.edu/department/) |
## Acceptance gates

- exactly 50 unique programs and 50 unique per-school audit rows;
- every program represented by at least one candidate in this snapshot;
- no duplicate faculty IDs or duplicate normalized names within a school;
- every automated faculty record remains `needs_review`;
- no research-roster-only fallback and no known non-person headings;
- all routes render in the static runtime test; browser persistence appends to Change History;
- Prisma schema validates, the SQLite migration deploys to a fresh database, and migration/schema drift is checked in CI.

## Recommended human review order

1. Review the highest multimodal + robotics overlap candidates and confirm that they can advise CS PhD students.
2. Read recent three-year papers and create explicit Faculty × Project matches for EmoTree-Bench and LIMO4SI.
3. Verify 2028 recruiting, funding and admission model from dated official sources.
4. Check current lab members, Tsinghua connections and placement before assigning High Priority or Backup.
5. Treat community reports as anecdotes until corroborated; they never override an official field observation.
