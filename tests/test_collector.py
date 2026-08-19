import json
import sys
import unittest
from pathlib import Path

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

if __name__ == "__main__": unittest.main()
