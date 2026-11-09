#!/usr/bin/env bash
# Test only, not for merge (litlfred/smart-ig-template#1).
# Run as fhir-harness ig-ast-refresh's pre-export, before the Publisher:
# 1. The restored package cache already holds who.template.root#current, so the
#    harness's seeder skips it. Drop it and seed it from the fork's default branch.
# 2. Add a report script to the seeded template's post-check folder. It runs after
#    06_generate_dak_api_hub.py and writes the DAK API hub's state straight into
#    this CI step's log, since the Publisher's own log is only kept as an artifact.
set -euo pipefail
pk="$HOME/.fhir/packages"
tpl="$pk/who.template.root#current"
seeder="$RUNNER_TEMP/igp/ast-export/scripts/seed-fhir-cache-from-npm.py"

echo "::group::test: seed who.template.root#current from litlfred/smart-ig-template"
rm -rf "$tpl"
# The base, fhir2.base.template#current, is not in FHIR/ig-registry's templates.json
# either, so it is seeded from HL7/ig-template-base2 at HEAD too.
python3 -I "$seeder" --cache "$pk" \
  --template-repo who.template.root=litlfred/smart-ig-template \
  --template-repo fhir2.base.template=HL7/ig-template-base2 \
  'who.template.root#current' 'fhir2.base.template#current' || true
for t in 'who.template.root#current' 'fhir2.base.template#current'; do
  [ -f "$pk/$t/package/package.json" ] || { echo "::error::test: $t was not seeded"; exit 1; }
done
git ls-remote https://github.com/litlfred/smart-ig-template HEAD
hub=$(find "$tpl" -path "*/scripts/post-check/06_generate_dak_api_hub.py" | head -n 1)
echo "test: hub script at ${hub:-nowhere}"
[ -n "$hub" ] && grep -q find_language_dirs "$hub" \
  && echo "test: the seeded template carries the #68 fix" \
  || { echo "::error::test: the seeded template does not carry the #68 fix"; exit 1; }
grep -o '"fhir2.base.template"[^,}]*' "$tpl/package/package.json" || true
echo "::endgroup::"

# The step's shell (this command's parent) keeps its stdout for the whole step.
# The step's shell keeps its stdout for the whole step. That is this command's
# parent, or its grandparent when pre-export is a compound command whose own
# bash -c has ended by the time the Publisher runs: list both, first live wins.
gp=$(ps -o ppid= -p "$PPID" | tr -d ' ')
printf '/proc/%s/fd/1\n/proc/%s/fd/1\n' "$PPID" "$gp" > "$RUNNER_TEMP/test-step-stdout"

cat > "$(dirname "$hub")/99_test_report_dak_hub.py" <<'PY'
import json, os, re, sys

def main():
    out = os.path.abspath("output")
    try:
        sink = None
        for path in open(os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "test-step-stdout")).read().split():
            try:
                sink = open(path, "w")
                break
            except Exception:
                pass
        sink = sink or sys.stdout
    except Exception:
        sink = sys.stdout

    def say(s):
        sink.write(s + "\n")
        sink.flush()

    pats = {
        "schema links": r"""href=["'][^"']*schemas/""",
        "jsonld links": r"""href=["'][^"']*\.jsonld""",
        "openapi links": r"""href=["'][^"']*\.openapi\.json""",
        "../ links": r"""href=["']\.\./""",
    }
    langs = sorted(d for d in os.listdir(out)
                   if re.fullmatch(r"[a-z]{2,3}(-[A-Za-z0-9]{2,8})*", d)
                   and os.path.isfile(os.path.join(out, d, "index.html")))
    say("::group::test: DAK API hub report")
    say("language folders: %s" % (langs or "none"))
    for folder in [""] + langs:
        p = os.path.join(out, folder, "dak-api.html")
        name = (folder or "(root)") + "/dak-api.html"
        if not os.path.isfile(p):
            say(name + ": missing")
            continue
        h = open(p, encoding="utf-8", errors="replace").read()
        parts = ["%d bytes" % len(h), "empty marker left: %s" % ("<!-- DAK_API_CONTENT -->" in h)]
        parts += ["%s: %d" % (k, len(re.findall(v, h))) for k, v in pats.items()]
        say(name + ": " + "; ".join(parts))
    try:
        txt = json.dumps(json.load(open(os.path.join(out, "qa.json"))))
        hits = sorted(set(re.findall(r'[^"]*(?:DAK API hub|dak-api\.html)[^"]*', txt)))
        say("qa.json DAK API entries: %d" % len(hits))
        for x in hits[:20]:
            say("  " + x[:300])
    except Exception as e:
        say("qa.json: not read (%s)" % e)
    say("::endgroup::")

try:
    main()
except Exception as e:
    print("test report failed: %s" % e)
PY
echo "test: report script added to the seeded template's post-check folder"

# Tee every post-check script's output, and its exit, into this step's log:
# Python imports usercustomize from the user site folder at start-up.
usite=$(python3 -m site --user-site)
mkdir -p "$usite"
cat > "$usite/usercustomize.py" <<'PY'
import atexit, os, sys
if "post-check" in (sys.argv[0] if sys.argv else ""):
    try:
        _sink = None
        for _p in open(os.path.join(os.environ.get("RUNNER_TEMP", "/tmp"), "test-step-stdout")).read().split():
            try:
                _sink = open(_p, "w")
                break
            except Exception:
                pass
        if _sink is None:
            raise RuntimeError("no sink")
        _name = os.path.basename(sys.argv[0])

        class _Tee:
            def __init__(self, s):
                self._s = s
            def write(self, x):
                for line in x.splitlines():
                    if line.strip():
                        _sink.write("[%s] %s\n" % (_name, line))
                _sink.flush()
                return self._s.write(x)
            def flush(self):
                self._s.flush()
            def __getattr__(self, a):
                return getattr(self._s, a)

        sys.stdout = _Tee(sys.stdout)
        sys.stderr = _Tee(sys.stderr)
        _sink.write("[%s] start, cwd %s\n" % (_name, os.getcwd()))
        _sink.flush()
        atexit.register(lambda: (_sink.write("[%s] end\n" % _name), _sink.flush()))
    except Exception:
        pass
PY
echo "test: post-check output is copied into this log (usercustomize at $usite)"
