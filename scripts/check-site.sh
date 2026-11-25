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
for slug in ubqart zippy-fit firecomm; do
  check "case study /apps/$slug/ exists" "[ -f '$SITE/apps/$slug/index.html' ]"
  check "case study /apps/$slug/ uses case-study layout" "grep -q 'class=\"cs\"' '$SITE/apps/$slug/index.html' 2>/dev/null"
done
check "media_sync privacy and terms pages are gone" "[ ! -e '$SITE/privacy' ] && [ ! -e '$SITE/terms' ]"
check "media-sync page is gone" "[ ! -e '$SITE/apps/media-sync' ] && ! grep -q 'data-sheet=\"media-sync\"' '$H'"
check "no page for projects without a case study" "[ ! -e '$SITE/apps/luxlife' ] && [ ! -e '$SITE/apps/luxlife.html' ]"
check "zippy-fit case study links to its site" "grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$SITE/apps/zippy-fit/index.html'"
check "ubqart case study keeps its screenshot" "grep -q '/assets/previews/ubqart.png' '$SITE/apps/ubqart/index.html' && [ -f '$SITE/assets/previews/ubqart.png' ]"

# ── The projects deck, on /apps/ and on the home page ─────────────────────
for page in "$A" "$H"; do
  n="${page#$SITE}"
  check "$n: 4 panels" "[ \"\$(count '<section class=\"panel\"' '$page')\" -eq 4 ]"
  for id in products open-source backend web; do
    check "$n: panel #$id" "grep -q '<section class=\"panel\" id=\"$id\"' '$page'"
    check "$n: tab links to #$id" "grep -q 'class=\"deck-tab\" href=\"#$id\"' '$page'"
  done
  check "$n: tab row has 4 tabs" "[ \"\$(count 'class=\"deck-tab\"' '$page')\" -eq 4 ]"
  check "$n: short tab names" "grep -q 'href=\"#backend\" data-tab=\"2\">Backend<' '$page'"
  check "$n: 11 project items (no UbqArt)" "[ \"\$(count '<li class=\"panel-item' '$page')\" -eq 11 ]"
  check "$n: 11 sheet templates (no UbqArt)" "[ \"\$(count '<template id=\"sheet-' '$page')\" -eq 11 ]"
  check "$n: sheet dialog" "grep -q '<dialog class=\"sheet\"' '$page'"
  check "$n: 2 case-study labels" "[ \"\$(grep -oE 'class=\"(cs-label|item-cs)\"' '$page' | wc -l | tr -d ' ')\" -eq 2 ]"
  check "$n: UbqArt is not in the deck" "! grep -q 'data-sheet=\"ubqart\"' '$page' && ! grep -q 'id=\"sheet-ubqart\"' '$page'"
  check "$n: products order is LuxLife, zippy-fit, StashCam" "[ \"\$(grep -o 'data-sheet=\"[a-z-]*\"' '$page' | head -3 | tr -d '\n')\" = 'data-sheet=\"luxlife\"data-sheet=\"zippy-fit\"data-sheet=\"stashcam\"' ]"
  check "$n: items keep a real link without JS" "grep -q 'href=\"/apps/zippy-fit/\" data-sheet=\"zippy-fit\"' '$page' && grep -q 'href=\"https://luxlife.site/\" data-sheet=\"luxlife\"' '$page'"
  check "$n: 8 list cards have a footer row" "[ \"\$(count 'class=\"item-foot\"' '$page')\" -eq 8 ]"
  check "$n: zippy-fit site link" "grep -q 'href=\"https://zepvalue.github.io/zippy-fit/\"' '$page'"
  check "$n: npm items have live-number hooks" "grep -q 'data-np=\"firecomm-dl\"' '$page' && grep -q 'data-np=\"two-auth-v\"' '$page'"
  check "$n: list cards have a neutral icon" "[ \"\$(count 'class=\"item-icon\"' '$page')\" -eq 8 ]"
  check "$n: list cards have a head row with the title" "[ \"\$(count 'class=\"item-head\"' '$page')\" -eq 8 ]"
  check "$n: downloads say /yr, no arrow glyph" "! grep -q '↓/yr' '$page'"
  check "$n: case study is a footer link in list cards" "grep -q 'class=\"item-cs\">Case study' '$page'"
  check "$n: loads panels.js" "grep -q 'src=\"/assets/js/panels.js\"' '$page'"
done

# ── Home page ─────────────────────────────────────────────────────────────
check "home: deck sits in the right column" "grep -q '<aside class=\"sidebar-right\"' '$H'"
check "home: left sidebar and profile stay" "grep -q 'class=\"sidebar-left\"' '$H' && grep -q 'id=\"clock\"' '$H' && grep -q 'id=\"gh-contrib\"' '$H'"
check "home: still loads home.js" "grep -q 'src=\"/assets/js/home.js\"' '$H'"
check "home: no languages section" "! grep -q 'gh-lang' '$H' && ! grep -q '>Languages<' '$H'"
check "home: one title, Engineer who ships" "grep -A1 'id=\"typed-strings\"' '$H' | tail -1 | grep -qx ' *<span>Engineer who ships</span>'"
check "home: no Projects link row (the deck replaces it)" "! grep -q 'class=\"link-label\">Projects<' '$H'"

# ── Home hero for clients ─────────────────────────────────────────────────
line_of() { grep -n "$1" "$H" | head -1 | cut -d: -f1; }
check "hero: headline for founders" "grep -q 'I build and ship MVPs for founders.' '$H'"
check "hero: Book a call goes to Calendly" "grep -q 'href=\"https://calendly.com/zepvalue\"' '$H' && grep -q '>Book a call<' '$H'"
check "hero: email as the second option" "grep -q '>or email me<' '$H'"
check "hero: no price shown" "! grep -q 'hero-price' '$H' && ! grep -q '/hour' '$H'"
check "hero: Available now badge, no operational" "grep -q '>Available now<' '$H' && ! grep -q '>operational<' '$H'"
check "hero: no numbers card" "! grep -q 'stats-card' '$H'"
check "hero: one screen, no section below the hero" "! grep -q 'id=\"proof\"' '$H'"
check "hero: npm and graph sit in the left column" "[ -n \"\$(line_of 'npm-card')\" ] && [ \"\$(line_of 'npm-card')\" -lt \"\$(line_of 'class=\"center\"')\" ] && [ \"\$(line_of 'id=\"gh-contrib\"')\" -lt \"\$(line_of 'class=\"center\"')\" ]"
check "hero: Pinned and Activity are gone" "! grep -q 'id=\"gh-pinned\"' '$H' && ! grep -q 'id=\"gh-activity\"' '$H'"
check "npm card: one all-time total in the header, no per-package downloads" "grep -A5 'class=\"npm-head\"' '$H' | grep -q 'id=\"npm-total\">[0-9.k+]* downloads<' && ! grep -q 'last year' '$H' && ! grep -q 'class=\"npm-pkg-dl\"' '$H'"
check "hero: firecomm card sits between UbqArt and npm" "[ -n \"\$(line_of 'creator-card')\" ] && [ \"\$(line_of 'founder-card')\" -lt \"\$(line_of 'creator-card')\" ] && [ \"\$(line_of 'creator-card')\" -lt \"\$(line_of 'npm-card')\" ]"
check "hero: firecomm card links to docs, source and case study" "grep -A20 'creator-card' '$H' | grep -q 'href=\"https://firecomm.github.io\"' && grep -A20 'creator-card' '$H' | grep -q 'href=\"https://github.com/zepvalue/firecomm\"' && grep -A20 'creator-card' '$H' | grep -q 'href=\"/apps/firecomm/\"'"
check "npm card: one-line rows, no descriptions" "! grep -q 'class=\"npm-pkg-desc\"' '$H'"
check "hero: UbqArt badge says ex-founder" "grep -q 'class=\"founder-badge\">ex-founder<' '$H'"
check "head: title and description speak to clients" "grep -q '<title>[^<]*MVPs for founders' '$H' && grep -q '<meta name=\"description\" content=\"[^\"]*MVPs' '$H'"

# ── Favicon ───────────────────────────────────────────────────────────────
check "favicon: SVG icon linked in the head" "grep -q '<link rel=\"icon\" type=\"image/svg+xml\" href=\"/assets/favicon.svg\"' '$H'"
check "favicon: favicon.ico at the site root (browsers ask for /favicon.ico)" "[ -f '$SITE/favicon.ico' ] && grep -q 'href=\"/favicon.ico\"' '$H'"
check "favicon: every icon the head links exists" "( for f in \$(grep -oE 'href=\"/[^\"]*\\.(png|ico|svg|webmanifest)\"' '$H' | cut -d'\"' -f2); do [ -f \"$SITE\$f\" ] || exit 1; done )"
check "favicon: every manifest icon exists" "( for f in \$(grep -oE '\"src\":\"[^\"]*\"' '$SITE/assets/site.webmanifest' | cut -d'\"' -f4); do [ -f \"$SITE\$f\" ] || exit 1; done )"
check "favicon: manifest has the site name" "grep -q '\"name\":\"Giuseppe Zep V\"' '$SITE/assets/site.webmanifest'"

# ── Site-wide ─────────────────────────────────────────────────────────────
check "no App Store or Google Play links on the site" "! grep -rqE 'itunes\.apple\.com|apps\.apple\.com|play\.google\.com' '$SITE' --include=*.html"
check "tests folder is not published" "[ ! -e '$SITE/tests' ]"

exit $fail
