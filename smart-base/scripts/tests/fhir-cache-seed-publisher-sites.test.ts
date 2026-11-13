/**
 * smart-base supplies the `smart.who.int.` publisher-site rule to fhir-harness's
 * `fhir-cache-seed-npm`, whose own default is empty (owner ruling 2026-10-07).
 *
 * The seeder itself is not imported: a staged layer reaches the platform
 * only through `platform/index.ts`. How `--site-repo PREFIX=OWNER/REPO[@BRANCH]`
 * parses is fhir-harness's own test; this one checks what smart-base passes.
 */
import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { toolsFromFolders } from "../../platform/index.ts";
import { SMART_PUBLISHER_SITE_REPOS, smartSiteRepoArgs } from "../../tools/index.ts";

describe("smart-base publisher-site rules for fhir-cache-seed-npm", () => {
  test("suppliesWhoPublisherSiteRule", () => {
    expect(SMART_PUBLISHER_SITE_REPOS["smart.who.int."]).toBe("WorldHealthOrganization/smart-html@main");
  });

  test("passesRuleAsSiteRepoArguments", () => {
    expect(smartSiteRepoArgs()).toEqual(["--site-repo", "smart.who.int.=WorldHealthOrganization/smart-html@main"]);
  });

  test("toolInvokesSeederWithRule", () => {
    const tool = toolsFromFolders(join(import.meta.dir, "..", "..", "L3", "tools"), "https://example.org").find((x) => x.id === "smart-fhir-cache-seed");
    const shell = (tool?.invoke as { shell?: string } | undefined)?.shell ?? "";
    expect(shell).toContain("fhir-harness/scripts/fhir-cache-seed-npm.ts");
    expect(shell).toContain("--site-repo smart.who.int.=WorldHealthOrganization/smart-html@main");
  });
});
