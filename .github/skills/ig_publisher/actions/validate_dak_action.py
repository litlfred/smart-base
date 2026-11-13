"""
DAK structural validation action — validates repository structure
without requiring IG Publisher or LLM.

Environment variables:
    GITHUB_TOKEN  — GitHub API token
    PR_NUMBER     — PR number for posting results
    DAK_IG_ROOT   — IG root directory (default: current directory)
"""

import glob
import os
import sys
from pathlib import Path

_SKILLS_ROOT = Path(__file__).resolve().parent.parent.parent
if str(_SKILLS_ROOT) not in sys.path:
    sys.path.insert(0, str(_SKILLS_ROOT))

from common.ig_errors import Issue, error, warning, info, format_issues, has_errors


def validate_structure(ig_root: str) -> list:
    """Run structural validation checks and return issues."""
    issues = []
    root = Path(ig_root)

    # Check required files
    if not (root / "sushi-config.yaml").is_file():
        issues.append(warning("DAK-001", "sushi-config.yaml not found"))

    if not (root / "ig.ini").is_file():
        issues.append(warning("DAK-002", "ig.ini not found"))

    # BPMN XML, swimlane structure and lane -> ActorDefinition validation runs
    # via `smart-base/L2-bpmn/tools/dak-swimlanes/dak-swimlanes.ts` (`check:dak-swimlanes`).
    return issues


def main() -> None:
    ig_root = os.environ.get("DAK_IG_ROOT", ".")
    issues = validate_structure(ig_root)
    print(format_issues(issues))

    if has_errors(issues):
        print("❌ DAK structural validation found errors.")
        sys.exit(1)

    print("✅ DAK structural validation passed.")


if __name__ == "__main__":
    main()
