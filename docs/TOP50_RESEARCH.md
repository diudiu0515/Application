# Top 50 faculty discovery research

> Snapshot: 2026-09-09 · 250 candidate faculty · 50/50 schools with at least one candidate · 0 zero-result schools.

## Scope and interpretation

This is a user-defined 50-school US CS research set, not an official ranking. Coverage means the collector found at least one faculty candidate connected to multimodal AI or robotics/embodied AI; it does **not** mean recruiting, advising eligibility, funding or 2028 availability is confirmed.

Every automated record enters `needs_review`. A record becomes a confirmed faculty target only after human review, and recruiting becomes confirmed only through a dated official `VerificationRecord`. Fetch failures are retained in `data/collection-report.json` instead of being silently treated as negative evidence.

## Discovery method

- Sources are configured university, department, research-area, faculty, lab and official profile pages.
- A live profile must contain a faculty-role signal and a primary multimodal or robotics/embodied direction. A single generic word such as “robotics” is insufficient; one precise primary phrase or at least two direction signals are required.
- If a profile cannot be fetched, fallback is allowed only for a professor and official URL explicitly listed in the adapter configuration. A research roster alone is never promoted because it may include students, staff or section headings.
- Names are normalized and deduplicated per school. Navigation, UI labels, student-roster fallbacks and known section headings are rejected.
- The scheduled collector runs weekly. Refreshes update discovery evidence but preserve the applicant’s review status, consideration, checklists, contact state, tags and decision rationale.

Current family coverage is overlapping: `robotics_embodied` 148, `llm_reasoning` 77, `multimodal_vlm` 76, `benchmark_data` 70, `manual_primary_verification` 50, `spatial_interaction` 38, `affective_social` 25, `video_ego_exo` 21.

## GPA 3.3, school priority and summer research

GPA is used only for admissions-risk and portfolio planning; it never lowers a professor’s research-fit score. Initial program priority is 65% discovered direction depth, 20% the custom research-set rank proxy and 15% GPA-3.3 portfolio viability. The initial tier bands are Dream (1–8), Reach (9–22), Target (23–38) and Lower Risk (39–50), but no CS PhD is treated as a true safe option.

The editable shortlist then emphasizes verified faculty fit and advisor depth. Automated candidates do not count as confirmed advisor depth until reviewed. Summer research is a separate dimension: eligible/likely eligible routes receive execution credit, `needs_confirmation` receives only a small planning signal, and ineligible programs score zero regardless of academic prestige. The Summer Research page stores official source, eligibility, international-applicant status, deadline, funding, academic fit and executable priority separately.

2028 cycle requirements are generally not yet published. Generated deadlines are visibly labeled planning placeholders and must not be used as official submission dates.

## Per-school audit

“Live / fallback” distinguishes successful role-and-keyword profile matches from individually configured official-profile fallbacks. The link in every row is the configured official research entry used for recurring discovery.

| Set rank | School | Candidates | Live / fallback | Fetch errors | Official research entry |
|---:|---|---:|---:|---:|---|
| 1 | Massachusetts Institute of Technology | 7 | 7 / 0 | 2 | [official page](https://www.eecs.mit.edu/role/faculty/?fwp_research=robotics) |
| 2 | Stanford University | 3 | 3 / 0 | 1 | [official page](https://www.cs.stanford.edu/people-cs/faculty-research/robotics) |
| 3 | Carnegie Mellon University | 11 | 11 / 0 | 3 | [official page](https://www.ri.cmu.edu/people/all-ri-people/) |
| 4 | University of California, Berkeley | 4 | 0 / 4 | 5 | [official page](https://www2.eecs.berkeley.edu/Faculty/Lists/faculty.html) |
| 5 | University of Illinois Urbana-Champaign | 28 | 28 / 0 | 2 | [official page](https://cs.illinois.edu/research/areas/artificial-intelligence) |
| 6 | Cornell University | 5 | 3 / 2 | 1 | [official page](https://www.cs.cornell.edu/people/faculty) |
| 7 | University of Washington | 1 | 0 / 1 | 2 | [official page](https://www.cs.washington.edu/research/artificial-intelligence/ai-faculty-members/) |
| 8 | Georgia Institute of Technology | 1 | 1 / 0 | 2 | [official page](https://www.cc.gatech.edu/people/faculty) |
| 9 | Princeton University | 9 | 9 / 0 | 3 | [official page](https://www.cs.princeton.edu/research/areas/robotics) |
| 10 | University of Texas at Austin | 11 | 10 / 1 | 3 | [official page](https://www.cs.utexas.edu/research/computer-vision) |
| 11 | University of Michigan | 3 | 0 / 3 | 1 | [official page](https://cse.engin.umich.edu/people/faculty/) |
| 12 | University of California, San Diego | 2 | 0 / 2 | 3 | [official page](https://cse.ucsd.edu/people/faculty-profiles) |
| 13 | University of California, Los Angeles | 3 | 1 / 2 | 2 | [official page](https://www.cs.ucla.edu/faculty/) |
| 14 | Columbia University | 5 | 5 / 0 | 0 | [official page](https://www.cs.columbia.edu/people/faculty/) |
| 15 | Harvard University | 1 | 1 / 0 | 2 | [official page](https://seas.harvard.edu/computer-science/people) |
| 16 | University of Pennsylvania | 3 | 1 / 2 | 1 | [official page](https://www.cis.upenn.edu/people/faculty/) |
| 17 | University of Wisconsin-Madison | 8 | 7 / 1 | 2 | [official page](https://www.cs.wisc.edu/people/faculty-2/) |
| 18 | University of Maryland, College Park | 10 | 10 / 0 | 1 | [official page](https://www.cs.umd.edu/people/faculty) |
| 19 | Purdue University | 7 | 7 / 0 | 2 | [official page](https://www.cs.purdue.edu/research/robotics-computer-vision.html) |
| 20 | University of Massachusetts Amherst | 1 | 0 / 1 | 4 | [official page](https://www.cics.umass.edu/people/faculty) |
| 21 | University of Southern California | 12 | 12 / 0 | 0 | [official page](https://www.cs.usc.edu/directory/faculty/) |
| 22 | Yale University | 2 | 2 / 0 | 0 | [official page](https://engineering.yale.edu/research-and-faculty/faculty-directory) |
| 23 | Brown University | 3 | 0 / 3 | 2 | [official page](https://cs.brown.edu/people/faculty/) |
| 24 | Johns Hopkins University | 14 | 14 / 0 | 1 | [official page](https://www.cs.jhu.edu/research/computer-vision/) |
| 25 | New York University | 1 | 1 / 0 | 3 | [official page](https://cs.nyu.edu/dynamic/people/faculty/) |
| 26 | Northwestern University | 8 | 8 / 0 | 2 | [official page](https://www.mccormick.northwestern.edu/computer-science/research/areas/robotics.html) |
| 27 | Duke University | 7 | 3 / 4 | 2 | [official page](https://cs.duke.edu/research/computer-vision) |
| 28 | University of California, Irvine | 3 | 2 / 1 | 0 | [official page](https://ics.uci.edu/people/) |
| 29 | University of California, Santa Barbara | 7 | 7 / 0 | 3 | [official page](https://cs.ucsb.edu/research) |
| 30 | University of North Carolina at Chapel Hill | 3 | 3 / 0 | 1 | [official page](https://cs.unc.edu/people/faculty/) |
| 31 | Rice University | 3 | 2 / 1 | 1 | [official page](https://csweb.rice.edu/people/faculty) |
| 32 | University of Chicago | 3 | 1 / 2 | 2 | [official page](https://cs.uchicago.edu/people/faculty/) |
| 33 | University of Virginia | 2 | 0 / 2 | 1 | [official page](https://engineering.virginia.edu/department/computer-science/people) |
| 34 | Pennsylvania State University | 3 | 2 / 1 | 5 | [official page](https://www.eecs.psu.edu/departments/EECS-Departments-Computer-Science-Engineering-Faculty.aspx) |
| 35 | Ohio State University | 1 | 0 / 1 | 3 | [official page](https://cse.osu.edu/people/faculty) |
| 36 | Rutgers University | 3 | 0 / 3 | 1 | [official page](https://www.cs.rutgers.edu/people/professors) |
| 37 | Texas A&M University | 2 | 1 / 1 | 4 | [official page](https://engineering.tamu.edu/cse/profiles/index.html) |
| 38 | University of Minnesota | 4 | 3 / 1 | 3 | [official page](https://cse.umn.edu/cs/faculty) |
| 39 | Virginia Tech | 3 | 2 / 1 | 2 | [official page](https://cs.vt.edu/people/faculty.html) |
| 40 | Northeastern University | 19 | 19 / 0 | 2 | [official page](https://www.khoury.northeastern.edu/research_areas/robotics/) |
| 41 | University of Colorado Boulder | 2 | 0 / 2 | 3 | [official page](https://www.colorado.edu/cs/research/robotics) |
| 42 | Stony Brook University | 6 | 6 / 0 | 3 | [official page](https://www.cs.stonybrook.edu/people/faculty) |
| 43 | University of California, Davis | 1 | 1 / 0 | 1 | [official page](https://cs.ucdavis.edu/people/faculty) |
| 44 | University of Utah | 1 | 1 / 0 | 1 | [official page](https://www.cs.utah.edu/people/faculty/) |
| 45 | Washington University in St. Louis | 3 | 1 / 2 | 1 | [official page](https://engineering.washu.edu/faculty/) |
| 46 | University of Arizona | 2 | 0 / 2 | 3 | [official page](https://www.cs.arizona.edu/person/faculty) |
| 47 | University of California, Santa Cruz | 2 | 2 / 0 | 1 | [official page](https://engineering.ucsc.edu/departments/computer-science-and-engineering/faculty/) |
| 48 | Boston University | 3 | 2 / 1 | 1 | [official page](https://www.bu.edu/cs/research-groups/ml/) |
| 49 | Arizona State University | 2 | 1 / 1 | 1 | [official page](https://scai.engineering.asu.edu/faculty/) |
| 50 | University of Rochester | 2 | 0 / 2 | 1 | [official page](https://www.cs.rochester.edu/people/faculty/index.html) |

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
