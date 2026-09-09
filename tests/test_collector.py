import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import collect_faculty as collector

class CollectorQualityTests(unittest.TestCase):
    def test_main_content_excludes_navigation_noise(self):
        page = collector.parse("<nav>robotics multimodal</nav><main><h1>Example Professor</h1><p>Works on database systems.</p></main><footer>embodied AI</footer>")
        self.assertEqual(" ".join(page.main_text), "Example Professor Works on database systems.")

    def test_person_name_filter_rejects_ui_labels(self):
        self.assertTrue(collector.name_like("Jeannette Bohg"))
        self.assertEqual(collector.extract_name("Jesse Thomason Assistant Professor of Computer Science"), "Jesse Thomason")
        self.assertFalse(collector.name_like("Load More People"))
        self.assertFalse(collector.name_like("Research Institutes and Centers"))
        for label in ("Home Page", "Personal Website", "PhD Advisors", "Machine Learning", "In Memoriam", "Post Docs", "Visiting Scholars", "Professors Emeriti", "Tenure Track", "Courtesy Appointments", "Rudin Lab Website", "Oski Bear"):
            self.assertIsNone(collector.extract_name(label), label)

    def test_primary_direction_gate_is_configured(self):
        config = json.loads((ROOT / "config/research-directions.json").read_text())
        primary = config["strategy"]["primary_families"]
        self.assertIn("multimodal_vlm", primary)
        self.assertIn("robotics_embodied", primary)
        self.assertNotIn("llm_reasoning", primary)

    def test_hard_sites_have_explicit_adapters(self):
        adapters = json.loads((ROOT / "config/faculty-adapters.json").read_text())
        self.assertIn("Carnegie Mellon University", adapters)
        self.assertGreaterEqual(len(adapters["Carnegie Mellon University"]["directories"]), 4)

    def test_top50_are_unique_and_every_school_has_an_adapter(self):
        programs = json.loads((ROOT / "config/top50-programs.json").read_text())["programs"]
        adapters = json.loads((ROOT / "config/faculty-adapters.json").read_text())
        schools = [row[0] for row in programs]
        self.assertEqual(len(schools), 50)
        self.assertEqual(len(set(schools)), 50)
        self.assertEqual(set(schools), set(adapters))
        self.assertTrue(all(adapters[school].get("directories") for school in schools))

    def test_one_explicit_primary_direction_is_enough_for_candidate_discovery(self):
        html = "<main><h1>Example Professor</h1><p>Professor working on robot learning.</p></main>"
        families = {"robotics_embodied": ["robot learning"], "llm_reasoning": ["reasoning"]}
        collector.PRIMARY.clear()
        collector.PRIMARY.add("robotics_embodied")
        collector.WEIGHTS.clear()
        collector.WEIGHTS.update({"robotics_embodied": 1.35})
        with patch.object(collector, "fetch", return_value=html):
            result = collector.assess(("Example University", "Example Professor", "https://example.edu/faculty/example", families))
        self.assertIsNotNone(result)
        self.assertIn("robotics_embodied", result["families"])

    def test_shared_template_keyword_without_faculty_role_is_rejected(self):
        html = "<main><h1>Example Staff Member</h1><p>Department navigation mentions robotics and multimodal research.</p></main>"
        families = {"robotics_embodied": ["robotics"], "multimodal_vlm": ["multimodal"]}
        collector.PRIMARY.clear()
        collector.PRIMARY.update(families)
        with patch.object(collector, "fetch", return_value=html):
            result = collector.assess(("Example University", "Example Staff Member", "https://example.edu/people/staff", families))
        self.assertIsNone(result)

    def test_single_generic_robotics_word_is_not_enough(self):
        html = "<main><h1>Example Professor</h1><p>Professor. Robotics.</p></main>"
        families = {"robotics_embodied": ["robotics"]}
        collector.PRIMARY.clear()
        collector.PRIMARY.add("robotics_embodied")
        with patch.object(collector, "fetch", return_value=html):
            result = collector.assess(("Example University", "Example Professor", "https://example.edu/faculty/example", families))
        self.assertIsNone(result)

    def test_research_roster_link_is_not_a_fallback_without_profile_evidence(self):
        school = "Example University"
        collector.ADAPTERS.clear()
        collector.ADAPTERS[school] = {"directories": ["https://example.edu/robotics"], "profiles": []}
        with patch.object(collector, "directory_urls", return_value=["https://example.edu/robotics"]), \
             patch.object(collector, "profile_urls", return_value=[("Example Student", "https://example.edu/people/student")]), \
             patch.object(collector, "assess", return_value=None):
            _, _, found, _ = collector.collect_school((school, "https://example.edu"), {})
        self.assertEqual(found, [])

    def test_gpa_aware_priority_rewards_direction_depth_more_than_rank(self):
        candidate = {"name":"Relevant Professor","url":"https://example.edu/faculty/relevant","families":{"robotics_embodied":["robotics"]},"keywords":["robotics"],"score":80}
        results = [
            ("Prestige Only", "https://one.example.edu", [], []),
            ("Deep Direction", "https://two.example.edu", [candidate] * 8, []),
        ]
        with tempfile.TemporaryDirectory() as directory:
            payload = collector.emit(results, Path(directory) / "generated.js")
        first, second = payload["programs"]
        self.assertGreater(second["priority"], first["priority"])
        self.assertIn("GPA 3.3", second["gpaContext"])
        self.assertIn("65%", second["selectionBasis"])

    def test_emit_adds_mainland_applicant_context_without_claiming_nationality(self):
        results = [
            ("Massachusetts Institute of Technology", "https://www.eecs.mit.edu/", [], []),
            ("Example University", "https://example.edu/cs", [], []),
        ]
        with tempfile.TemporaryDirectory() as directory:
            payload = collector.emit(results, Path(directory) / "generated.js")
        mit, generic = payload["programs"]
        self.assertEqual(mit["mainlandApplicantStatus"], "international_applicants_supported")
        self.assertEqual(mit["mainlandVerification"], "official_current_general_policy")
        self.assertIn("not a guarantee", mit["mainlandApplicantNotes"])
        self.assertEqual(generic["mainlandApplicantStatus"], "needs_2028_official_check")
        self.assertEqual(generic["mainlandApplicantSource"], "https://example.edu/cs")
        self.assertIn("never infer", generic["mainlandApplicantNotes"])

    def test_failed_school_refresh_retains_previous_candidates_as_stale(self):
        previous = {
            "programs": [{"id": "p1", "school": "Example University"}],
            "faculty": [{"id": "f1", "programId": "p1", "name": "Example Professor", "website": "https://example.edu/faculty/example", "interests": ["robot learning"], "autoFamilies": {"robotics_embodied": ["robot learning"]}, "discoveryScore": 82, "lastChecked": "2026-09-01"}],
        }
        failed = [("Example University", "https://example.edu/cs", [], ["directory: HTTPError"])]
        retained = collector.retain_previous_on_failed_fetch(failed, previous)
        candidate = retained[0][2][0]
        self.assertEqual(candidate["collectionMode"], "stale_previous_snapshot")
        self.assertEqual(candidate["lastChecked"], "2026-09-01")
        with tempfile.TemporaryDirectory() as directory:
            payload = collector.emit(retained, Path(directory) / "generated.js")
        self.assertEqual(payload["report"]["zeroSchools"], 0)
        self.assertEqual(payload["report"]["details"][0]["coverage"], "stale_fallback")
        self.assertEqual(payload["faculty"][0]["lastChecked"], "2026-09-01")
        source = next(x for x in payload["sources"] if x["entity"] == "Example Professor")
        self.assertEqual(source["status"], "outdated")
        healthy_empty = collector.retain_previous_on_failed_fetch([("Example University", "https://example.edu/cs", [], [])], previous)
        self.assertEqual(healthy_empty[0][2], [])

if __name__ == "__main__": unittest.main()
