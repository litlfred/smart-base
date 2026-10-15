import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { hubProducts } from "./dak-ast-sidecars";
import { HUB_CONFIG_ID, HUB_NODE, HUB_PAGE, HUB_SCRIPT, hubEntries, hubNode, hubPage, stemIndex, writeHub } from "./dak-api-hub-page";
import { DAK_API_LABEL, descriptorFor, HUB_MARKER, IG_API_DESCRIPTOR, IG_API_SITE, IG_API_WORK, igSiteSidecars } from "./ig-site-sidecars";

describe("ig-site:sidecars, smart-base's step in an IG repository's site", () => {
  test("a DAK (dak.json at the IG root) labels its sidecars DAK API", () => {
    const ig = mkdtempSync(join(tmpdir(), "ig-dak-"));
    writeFileSync(join(ig, "dak.json"), "{}");
    expect(descriptorFor(ig)).toEqual({ label: DAK_API_LABEL, placeholder: HUB_MARKER });
  });

  test("an IG that declares no DAK gets no label, so fhir-harness's IG API default stands", () => {
    expect(descriptorFor(mkdtempSync(join(tmpdir(), "ig-plain-")))).toEqual({ placeholder: HUB_MARKER });
  });

  test("no AST: refused, naming the step that restores it", () => {
    const ig = mkdtempSync(join(tmpdir(), "ig-noast-"));
    expect(() => igSiteSidecars({ ig, work: mkdtempSync(join(tmpdir(), "work-")), log: () => {} })).toThrow(/no AST[\s\S]*ig-site:ast/);
  });

  // fhir-harness beside this layer, as a checkout mounts them; skipped (and said) where it is not mounted.
  const fhirHarness = join(import.meta.dir, "..", "..", "fhir-harness", "scripts", "ig-repo-site.ts");
  test.skipIf(!existsSync(fhirHarness))("the handshake names are fhir-harness's (ig-repo-site.ts)", () => {
    // Read, not imported: the test pins the two copies of the handshake's names
    // together without running fhir-harness's code.
    const src = readFileSync(fhirHarness, "utf-8");
    expect(src).toContain(`IG_API_WORK = "${IG_API_WORK}"`);
    expect(src).toContain(`IG_API_DESCRIPTOR = "${IG_API_DESCRIPTOR}"`);
    expect(src).toContain(`IG_API_SITE = "${IG_API_SITE}"`);
  });

  test("the hub's products are what it added, without the stand-in page or its QA file", () => {
    const before = ["ValueSet-x.json", "ValueSet-x.schema.json", "dak-api.html"];
    const after = [...before, "ValueSet-x.openapi.json", "ValueSets.schema.json", "openapi/index.html", "qa.json"].sort();
    expect(hubProducts(before, after)).toEqual(["ValueSet-x.openapi.json", "ValueSets.schema.json", "openapi/index.html"]);
  });
});

describe("the thin DAK API hub page (owner, 2026-10-14: \"Yes, thin page\")", () => {
  const artefacts = [
    { resourceType: "ValueSet", id: "Actors", name: "ActorsVS" },
    { resourceType: "StructureDefinition", id: "hcert", title: "Health Certificate" },
  ];

  test("each sidecar binds as fhir-harness binds it: <Type>-<id>, <Type>-<name>, <Type>-<title stem>", () => {
    const e = hubEntries(
      ["ValueSet-Actors.schema.json", "ValueSet-ActorsVS.jsonld", "StructureDefinition-Health_Certificate.schema.json", "ValueSet-Actors.displays.json", "ValueSets-enumeration.openapi.json", "README.md"],
      stemIndex(artefacts),
    );
    const by = Object.fromEntries(e.map((x) => [x.file, x]));
    expect(by["ValueSet-Actors.schema.json"]).toEqual({ file: "ValueSet-Actors.schema.json", kind: "schema", label: "JSON Schema", href: "fhir-artifact-index/sidecars/ValueSet-Actors.schema.json", artefact: { key: "ValueSet/Actors", page: "artifact/ValueSet-Actors.html" }, view: "artifact/ValueSet-Actors.schema.json.html" });
    expect(by["ValueSet-ActorsVS.jsonld"]!.view).toBe("artifact/ValueSet-ActorsVS.jsonld.html");
    expect(by["StructureDefinition-Health_Certificate.schema.json"]!.artefact!.page).toBe("artifact/StructureDefinition-hcert.html");
    // Displays have no view page; a file bound to nothing has neither artefact nor view; a non-sidecar is not listed.
    expect(by["ValueSet-Actors.displays.json"]!.view).toBeUndefined();
    expect(by["ValueSets-enumeration.openapi.json"]).toEqual({ file: "ValueSets-enumeration.openapi.json", kind: "openapi", label: "OpenAPI", href: "fhir-artifact-index/sidecars/ValueSets-enumeration.openapi.json" });
    expect(by["README.md"]).toBeUndefined();
  });

  test("the node links the OpenAPI page, each sidecar with its view, and the enumerations", () => {
    const node = hubNode({ label: "DAK API", entries: hubEntries(["ValueSet-Actors.schema.json"], stemIndex(artefacts)), openapi: true, documents: ["ValueSets.schema.json"] });
    expect(node["@id"]).toBe(HUB_NODE);
    expect(node["schema:documentation"]).toBe("openapi/");
    expect((node["schema:hasPart"] as { "schema:url": string }[])[0]!["schema:url"]).toBe("artifact/ValueSet-Actors.schema.json.html");
    expect((node["schema:workExample"] as { "schema:contentUrl": string }[])[0]!["schema:contentUrl"]).toBe("ValueSets.schema.json");
    expect(hubNode({ label: "x", entries: [], openapi: false, documents: [] })["schema:documentation"]).toBeUndefined();
  });

  test("the page is a thin shell: its config, its node and loader, a static link to openapi/, and no sidecar content", () => {
    const html = hubPage({ label: "DAK API", openapi: true });
    expect(html).toContain(`id="${HUB_CONFIG_ID}"`);
    expect(html).toContain(HUB_NODE);
    expect(html).toContain(HUB_SCRIPT);
    expect(html).toContain('href="openapi/"');
    expect(html).not.toContain("fhir-artifact-index/sidecars");
    expect(hubPage({ label: "DAK API", openapi: false })).not.toContain('href="openapi/"');
  });

  test("the page wears the shared page layout, as every other page of the IG's site does (owner, 2026-10-15: \"full width. keep it on the other pages as well\")", () => {
    const html = hubPage({ label: "DAK API", openapi: true });
    expect(html).toContain('<link rel="stylesheet" href="assets/page-layout.css" data-fa-page-layout>');
    expect(html).toContain('<script src="assets/page-layout.js" defer data-fa-page-layout></script>');
    expect(html).toContain('<main class="dak-api-hub fa-page-main">');
    expect(readFileSync(join(import.meta.dir, "templates", "dak-api-hub.js"), "utf-8")).toContain('el("table", { class: "fa-page-wide" }');
  });

  test("writeHub lays the page, its node (.jsonld and .json) and its loader into the site", () => {
    const ast = mkdtempSync(join(tmpdir(), "ast-"));
    mkdirSync(join(ast, "resources", "ValueSet"), { recursive: true });
    writeFileSync(join(ast, "resources", "ValueSet", "Actors--0.json"), JSON.stringify({ resourceType: "ValueSet", id: "Actors" }));
    writeFileSync(join(ast, "manifest.json"), JSON.stringify({ resources: [{ resourceType: "ValueSet", id: "Actors", file: "resources/ValueSet/Actors--0.json" }] }));
    const sidecars = mkdtempSync(join(tmpdir(), "sc-"));
    writeFileSync(join(sidecars, "ValueSet-Actors.schema.json"), "{}");
    const site = mkdtempSync(join(tmpdir(), "site-"));
    expect(writeHub({ ast, sidecars, site, label: "DAK API", openapi: false, documents: [] })).toEqual({ entries: 1, views: 1 });
    for (const f of [HUB_PAGE, HUB_NODE, "dak-api.json", HUB_SCRIPT]) expect(existsSync(join(site, f))).toBe(true);
  });

  test("the descriptor names the hub's marker, so an IG's own hub page is filled rather than kept", () => {
    expect(descriptorFor(mkdtempSync(join(tmpdir(), "ig-")))).toEqual({ placeholder: HUB_MARKER });
  });
});
