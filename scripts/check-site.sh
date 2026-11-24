#!/usr/bin/env bash
# Checks the built site in _site/: the projects deck on /apps/ and in the home
# page's right column, and the case-study pages.
# Run after `jekyll build`. Exit code 1 if any check fails.
set -u
SITE="${1:-_site}"
H="$SITE/index.html"
A="$SITE/apps/index.html"
fail=0
check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi; }
count() { grep -o "$1" "$2" 2>/dev/null | wc -l | tr -d ' '; }

# ── Case-study pages ──────────────────────────────────────────────────────
for slug in ubqart zippy-fit firecomm media-sync; do
  check "case study /apps/$slug/ exists" "[ -f '$SITE/apps/$slug/index.html' ]"
  check "case study /apps/$slug/ uses case-study layout" "grep -q 'class=\"cs\"' '$SITE/apps/$slug/index.html' 2>/dev/null"
done
check "media-sync keeps its TikTok text" "grep -q 'Content Posting API' '$SITE/apps/media-sync/index.html' 2>/dev/null"
check "no page for projects without a case study" "[ ! -e '$SITE/apps/luxlife' ] && [ ! -e '$SITE/apps/luxlife.html' ]"
check "zippy-fit case study links to its site" "grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$SITE/apps/zippy-fit/index.html'"

# ── The projects deck, on /apps/ and on the home page ─────────────────────
for page in "$A" "$H"; do
  n="${page#$SITE}"
  check "$n: 4 panels" "[ \"\$(count '<section class=\"panel\"' '$page')\" -eq 4 ]"
  for id in products open-source backend web; do
    check "$n: panel #$id" "grep -q '<section class=\"panel\" id=\"$id\"' '$page'"
  done
  check "$n: 13 project items" "[ \"\$(count '<li class=\"panel-item' '$page')\" -eq 13 ]"
  check "$n: 13 sheet templates" "[ \"\$(count '<template id=\"sheet-' '$page')\" -eq 13 ]"
  check "$n: sheet dialog" "grep -q '<dialog class=\"sheet\"' '$page'"
  check "$n: 3 case-study labels (not UbqArt)" "[ \"\$(count 'class=\"cs-label' '$page')\" -eq 3 ]"
  check "$n: items keep a real link without JS" "grep -q 'href=\"/apps/ubqart/\" data-sheet=\"ubqart\"' '$page' && grep -q 'href=\"https://luxlife.site/\" data-sheet=\"luxlife\"' '$page'"
  check "$n: zippy-fit site link" "grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$page'"
  check "$n: npm items have live-number hooks" "grep -q 'data-np=\"firecomm-dl\"' '$page' && grep -q 'data-np=\"two-auth-v\"' '$page'"
  check "$n: loads panels.js" "grep -q 'src=\"/assets/js/panels.js\"' '$page'"
done

# ── Home page ─────────────────────────────────────────────────────────────
check "home: deck sits in the right column" "grep -q '<aside class=\"sidebar-right\"' '$H'"
check "home: left sidebar and profile stay" "grep -q 'class=\"sidebar-left\"' '$H' && grep -q 'id=\"clock\"' '$H' && grep -q 'id=\"gh-pinned\"' '$H'"
check "home: still loads home.js" "grep -q 'src=\"/assets/js/home.js\"' '$H'"
check "home: no Projects link row (the deck replaces it)" "! grep -q 'class=\"link-label\">Projects<' '$H'"

# ── Site-wide ─────────────────────────────────────────────────────────────
check "no App Store or Google Play links on the site" "! grep -rqE 'itunes\.apple\.com|apps\.apple\.com|play\.google\.com' '$SITE' --include=*.html"
check "tests folder is not published" "[ ! -e '$SITE/tests' ]"

exit $fail
