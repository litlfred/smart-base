"""
Swimlane → ActorDefinition validator.

Checks that every innermost ``<lane id="X">`` in BPMN files has a
corresponding ActorDefinition: an FSH ``Instance: DAK.X`` with
``InstanceOf: ActorDefinition`` anywhere under ``input/fsh/`` (the resource
``bpmn2fhirfsh.xsl`` links the lane to), whatever the file is called.
"""

import os
from typing import List
from lxml import etree

from common.ig_errors import Issue, error, warning, info
from common.fsh_utils import instance_exists

BPMN_NS = "http://www.omg.org/spec/BPMN/20100524/MODEL"

# BPMN comes from contributors: never resolve external entities or fetch DTDs.
_SAFE_PARSER = etree.XMLParser(resolve_entities=False, no_network=True, load_dtd=False)


def _is_innermost_lane(lane: etree._Element) -> bool:
    """Return True if the lane has no nested childLaneSet."""
    return lane.find(f"{{{BPMN_NS}}}childLaneSet") is None


def validate_swimlane_actors(
    bpmn_content: str,
    *,
    ig_root: str = ".",
    filename: str = "unknown.bpmn",
) -> List[Issue]:
    """Validate that every innermost lane has a matching ActorDefinition FSH file.

    Args:
        bpmn_content: BPMN XML as a string.
        ig_root: Path to the IG root directory.
        filename: Source filename for issue reporting.

    Returns:
        List of validation issues.
    """
    issues: List[Issue] = []

    try:
        tree = etree.fromstring(bpmn_content.encode("utf-8"), parser=_SAFE_PARSER)
    except etree.XMLSyntaxError as exc:
        issues.append(error("ACTOR-001", f"Cannot parse BPMN XML: {exc}", file=filename))
        return issues

    for lane in tree.iter(f"{{{BPMN_NS}}}lane"):
        if not _is_innermost_lane(lane):
            continue

        lane_id = lane.get("id", "")
        lane_name = lane.get("name", lane_id)

        if not lane_id:
            issues.append(warning(
                "ACTOR-002",
                f"Lane without id attribute (name='{lane_name}')",
                file=filename,
            ))
            continue

        if not instance_exists(ig_root, lane_id):
            issues.append(error(
                "ACTOR-003",
                f"No ActorDefinition for lane '{lane_id}' "
                f"(expected an FSH 'Instance: DAK.{lane_id}' with "
                f"'InstanceOf: ActorDefinition' under input/fsh/)",
                file=filename,
            ))

    if not issues:
        issues.append(info("ACTOR-000", "All lanes map to ActorDefinitions", file=filename))

    return issues
