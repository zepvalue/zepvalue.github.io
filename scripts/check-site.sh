#!/usr/bin/env bash
# Checks the built site in _site/ for the projects page and case studies.
# Run after `jekyll build`. Exit code 1 if any check fails.
set -u
SITE="${1:-_site}"
fail=0
check() { if eval "$2"; then echo "ok   $1"; else echo "FAIL $1"; fail=1; fi; }

for slug in ubqart zippy-fit firecomm media-sync; do
  check "case study /apps/$slug/ exists" "[ -f '$SITE/apps/$slug/index.html' ]"
  check "case study /apps/$slug/ uses case-study layout" "grep -q 'class=\"cs\"' '$SITE/apps/$slug/index.html' 2>/dev/null"
done
check "media-sync keeps its TikTok text" "grep -q 'Content Posting API' '$SITE/apps/media-sync/index.html' 2>/dev/null"
P="$SITE/apps/index.html"
check "projects page shows 13 items" "[ \"\$(grep -o '<li class=\"panel-item' '$P' | wc -l)\" -eq 13 ]"
check "projects page has 4 panels" "[ \"\$(grep -o '<section class=\"panel\"' '$P' | wc -l)\" -eq 4 ]"
for id in products open-source backend web; do
  check "panel #$id exists" "grep -q '<section class=\"panel\" id=\"$id\"' '$P'"
done
check "one sheet template per project (13)" "[ \"\$(grep -o '<template id=\"sheet-' '$P' | wc -l)\" -eq 13 ]"
check "projects page has the sheet dialog" "grep -q '<dialog class=\"sheet\"' '$P'"
check "items keep a real link without JS" "grep -q 'href=\"/apps/ubqart/\" data-sheet=\"ubqart\"' '$P' && grep -q 'href=\"https://luxlife.site/\" data-sheet=\"luxlife\"' '$P'"
check "projects page loads panels.js" "grep -q 'src=\"/assets/js/panels.js\"' '$P'"
check "home page does not load panels.js" "! grep -q 'panels.js' '$SITE/index.html'"
check "tests folder is not published" "[ ! -e '$SITE/tests' ]"
check "projects page shows 3 case-study labels (not UbqArt)" "[ \"\$(grep -o 'class=\"cs-label' '$SITE/apps/index.html' | wc -l)\" -eq 3 ]"
check "no App Store or Google Play links on the site" "! grep -rqE 'itunes\.apple\.com|apps\.apple\.com|play\.google\.com' '$SITE' --include=*.html"
check "no page for projects without a case study" "[ ! -e '$SITE/apps/luxlife' ] && [ ! -e '$SITE/apps/luxlife.html' ]"
check "LuxLife card links to luxlife.site" "grep -q 'href=\"https://luxlife.site/\"' '$SITE/apps/index.html'"
check "zippy-fit links to its site" "grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$SITE/apps/index.html' && grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$SITE/apps/zippy-fit/index.html'"
check "home link label is Projects" "grep -q '>Projects<' '$SITE/index.html'"

exit $fail
