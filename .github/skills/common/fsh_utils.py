"""
FSH (FHIR Shorthand) utility helpers for DAK skill actions.

Provides helpers for reading, validating, and generating small FSH snippets
used by BPMN import and DAK authoring skills.
"""

import re
from pathlib import Path
from typing import List, Optional

# Where a DAK keeps its BPMN: `input/bpmn/`, which the IG publishes as
# `<canonical>/bpmn/<file>.bpmn` (one folder, as every SMART IG lays it out).
BPMN_DIR = "bpmn"


def fsh_id_safe(raw_id: str) -> str:
    """Sanitize a string to a valid FSH instance identifier.

    FSH identifiers allow ``[A-Za-z0-9\\-\\.]``.  Characters outside that
    set are replaced with ``-``.
    """
    return re.sub(r"[^A-Za-z0-9.\-]", "-", raw_id)


def actor_fsh_path(ig_root: str, bare_id: str) -> Path:
    """Return the expected path for an ActorDefinition FSH file.

    Convention from ``bpmn2fhirfsh.xsl``:
        ``input/fsh/actors/ActorDefinition-DAK.<bare_id>.fsh``
    """
    return Path(ig_root) / "input" / "fsh" / "actors" / f"ActorDefinition-DAK.{bare_id}.fsh"


def bpmn_files(ig_root: str, pattern: str = "*.bpmn") -> List[Path]:
    """Return the DAK's BPMN files, from ``input/bpmn/``."""
    return sorted((Path(ig_root) / "input" / BPMN_DIR).glob(pattern))


_ACTOR_INSTANCE = re.compile(
    r"^Instance:\s*(\S+)\s*\n(?:[ \t]*//[^\n]*\n)*InstanceOf:\s*ActorDefinition\b",
    re.MULTILINE,
)


def actor_instance_ids(ig_root: str) -> set:
    """Every ``Instance:`` id under ``input/fsh/`` whose ``InstanceOf`` is ActorDefinition."""
    ids = set()
    for fsh in (Path(ig_root) / "input" / "fsh").rglob("*.fsh"):
        try:
            text = fsh.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        ids.update(m.group(1) for m in _ACTOR_INSTANCE.finditer(text))
    return ids


def instance_exists(ig_root: str, bare_id: str) -> bool:
    """Check whether an ActorDefinition exists for the lane id *bare_id*.

    ``bpmn2fhirfsh.xsl`` links a lane to the resource ``DAK.<bare_id>``
    (page ``ActorDefinition-DAK.<bare_id>.html``), so this matches the FSH
    ``Instance:`` id ``DAK.<bare_id>`` in any file under ``input/fsh/``, not a
    guessed file name: hand-written personas live in files such as
    ``input/fsh/actors/DAK.Persona.Person.fsh``.
    """
    if actor_fsh_path(ig_root, bare_id).is_file():
        return True
    ids = actor_instance_ids(ig_root)
    return f"DAK.{bare_id}" in ids or bare_id in ids


def read_fsh_instance_id(fsh_path: Path) -> Optional[str]:
    """Extract the ``Instance:`` identifier from a FSH file, if present."""
    if not fsh_path.is_file():
        return None
    text = fsh_path.read_text(encoding="utf-8")
    match = re.search(r"^Instance:\s*(\S+)", text, re.MULTILINE)
    return match.group(1) if match else None
