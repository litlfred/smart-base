#!/usr/bin/env bash
# Put the folio-assistant platform on disk for this session: the submodule at
# its pinned commit, then every layer its lock pins (folio-assistant-core,
# cat-harness, cat-harness-tools, fhir-harness, bootstrap-tools, smart-base and
# the rest), digest-checked by the platform's own replayer.
#
# Without this a cloud session starts with an EMPTY folio-assistant/: none of
# the platform's skills (feature-staging, staging-review, render:bpmn,
# wireframe-design-review, ...) are on disk, and an agent falls back to the
# only preview this repository ships, the IG Publisher's branches/ build,
# which is the IG's and not smart-base's. That happened on PR #53.
#
# Idempotent: a mount already on disk and intact is reported current.
set -uo pipefail
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
GIT_LFS_SKIP_SMUDGE=1 git submodule update --init --depth 1 folio-assistant >/dev/null 2>&1 \
  || { echo "mount-platform: could not initialise the folio-assistant submodule" >&2; exit 0; }
if [ -f folio-assistant/.github/mount-from-lock.sh ]; then
  bash folio-assistant/.github/mount-from-lock.sh --root folio-assistant 2>&1 | tail -1
else
  echo "mount-platform: folio-assistant is pinned before the remote-mount cutover; bump the submodule" >&2
fi
( cd folio-assistant && bun install --frozen-lockfile >/dev/null 2>&1 ) || echo "mount-platform: bun install failed in folio-assistant/" >&2
exit 0
