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
check "projects page shows 13 cards" "[ \"\$(grep -o '<li class=\"app-card' '$SITE/apps/index.html' | wc -l)\" -eq 13 ]"
check "projects page shows 3 case-study labels (not UbqArt)" "[ \"\$(grep -o 'class=\"cs-label' '$SITE/apps/index.html' | wc -l)\" -eq 3 ]"
check "no App Store or Google Play links on the site" "! grep -rqE 'itunes\.apple\.com|apps\.apple\.com|play\.google\.com' '$SITE' --include=*.html"
check "ubqart card links to its case study" "grep -q 'href=\"/apps/ubqart/\"' '$SITE/apps/index.html'"
check "no page for projects without a case study" "[ ! -e '$SITE/apps/luxlife' ] && [ ! -e '$SITE/apps/luxlife.html' ]"
check "home link label is Projects" "grep -q '>Projects<' '$SITE/index.html'"

exit $fail
