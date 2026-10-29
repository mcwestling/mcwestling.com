#!/usr/bin/env python3
"""Run with: python3 scripts/gather-products.test.py"""

import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location(
    "gather_products", Path(__file__).resolve().with_name("gather-products.py"))
gather = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gather)

README = """# Thing

Pitch.

## Who it’s for

People.

### Detail

Kept.

## Learn more

- [Private](docs/x.md)
"""


class CutIntroTests(unittest.TestCase):
    def test_keeps_through_who_its_for_and_drops_the_rest(self):
        self.assertEqual(
            gather.cut_intro(README, "thing"),
            "# Thing\n\nPitch.\n\n## Who it’s for\n\nPeople.\n\n### Detail\n\nKept.\n")

    def test_stops_at_a_rule(self):
        self.assertEqual(
            gather.cut_intro("## Who it's for\n\nPeople.\n---\nDev\n", "thing"),
            "## Who it's for\n\nPeople.\n")

    def test_fails_without_who_its_for(self):
        with self.assertRaises(SystemExit):
            gather.cut_intro("# Thing\n", "thing")


if __name__ == "__main__":
    unittest.main()
