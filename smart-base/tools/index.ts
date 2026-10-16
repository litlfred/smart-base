/**
 * smart-base's Tool nodes — the `tools` graph for the WHO SMART base layer.
 *
 * @module smart-base/tools
 * @graphNode tool
 *
 * ## Why these are here, and what changed on 2026-09-22
 *
 * The owner: *"things like dmn -> fhir questionnaire should be a tool. the
 * skill/tools under smart-base should consolidate under the smart-base/tools/
 * directory under this repo"*, and the goal it serves — *"want to slowly get
 * smart-base back to a more conventional IG state w/o tooling"*.
 *
 * So the direction of travel is: `WorldHealthOrganization/smart-base` stops
 * being a toolchain host and becomes an ordinary FHIR IG. The capabilities it
 * hosts today move here, where the harness can declare, bind and audit them.
 *
 * ## This is NOT vendoring, and the distinction is the whole reconciliation
 *
 * `smart-base.json`'s own header says the upstream toolchain is not vendored
 * here, and [`smart-base-tools`](../../smart-base/skills/content/authoring-who-smart-guidelines/smart-base-tools.md)
 * argues why: a copy of the Python would be a second, drifting toolchain.
 *
 * **That argument is about copies of the CODE and it still stands.** A Tool
 * node is a DECLARATION — what the capability is, what it consumes and
 * produces, which skill it satisfies, and how it is invoked. Declaring that
 * `dmn_questionnaire_generator.py` exists and consumes DMN to produce
 * `Questionnaire` resources does not duplicate a line of it, and it is what
 * lets a process bind the step at all. The two statements are compatible:
 * **declare here, execute upstream, until the execution moves too.**
 *
 * ## Two tools are deliberately absent
 *
 * `strip_library_binaries.py` and `strip_library_content.py` arrived labelled
 * *DAK Postprocessing* and are not DAK-shaped — any IG depending on
 * `hl7.fhir.uv.cql` produces oversized `Library` resources. By the placement
 * question in
 * [`smart-stack-layering`](../../smart-base/skills/content/authoring-who-smart-guidelines/smart-stack-layering.md)
 * they belong to `fhir-harness`, and putting them here to keep the list
 * tidy would be the layering rule being overruled by a step's own name.
 *
 * ## `install: { none: true }` throughout, on purpose
 *
 * Every tool below is a Python script in a checkout whose location is given by
 * `SMART_BASE_HOME`. There is no install step and saying so explicitly is what
 * distinguishes "nothing to install" from "nobody finished the record" — the
 * distinction the `none` flag exists for, per `beans-manual`'s precedent.
 *
 * ## One Tool per folder — bean `tdir`
 *
 * Each Tool is declared in `<id>/<id>.ts` beside this file, with its scripts
 * and tests when they are its alone; this file only loads the folders
 * (`toolsFromFolders`, which holds the folder = file = id convention).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { declarationPathIn, toolsFromFolders, type ToolDefinition } from "../platform/index.js";

/** The INSTANCE root — `<repo>/smart-base`, where `smart-base.json` lives. */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

function decl(): { canonicalUrl?: string } {
  const p = declarationPathIn(ROOT);
  if (p === undefined || !existsSync(p)) return {};
  try {
    return JSON.parse(readFileSync(p, "utf-8")) as { canonicalUrl?: string };
  } catch {
    return {};
  }
}

export { SMART_PUBLISHER_SITE_REPOS, smartSiteRepoArgs } from "./lib.ts";

export function tools(baseUrl?: string): ToolDefinition[] {
  return toolsFromFolders(dirname(fileURLToPath(import.meta.url)), baseUrl ?? decl().canonicalUrl ?? "");
}
