/**
 * The platform's theme schema, alone — the seam `themes/themes.ts` imports.
 *
 * Part of the `platform/` seam: `index.ts` re-exports this file, so the
 * platform's location is still named in this directory only. It is split out
 * because `themes.ts` is loaded by every theme lookup
 * (`cat-harness-tools/schemas/ui/theme-by-ref.ts` imports each instance's
 * `themes/themes.ts`), and importing the whole barrel pulled fhir-harness's IG
 * site and AST readers into that closure — which left the CI input-hash
 * fingerprint of `skill:register:check` and `kg:audit:check` undetermined
 * (beans folio-assistant-x35i, vgfp, k3vv). This module reaches only
 * `theme.ts`, whose own imports are zod and two kg schema files.
 *
 * @module smart-base/platform/theme
 */
export {
  THEME_SCHEMA_TAG,
  explainThemeFailure,
  resolveTheme,
  type ResolvedTheme,
  type Theme,
} from "../../cat-harness-tools/schemas/ui/theme.js";
