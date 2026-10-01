#!/bin/zsh
# scripts/perf/check.sh — run after `npm run build`, before a push: serves the repo root (what
# Hostinger publishes) on port 4302 and runs check.mjs against it in ONE headless Chrome, then
# stops both.
HERE=${0:A:h}; SITE=${HERE:h:h}; PROFILE=${TMPDIR:-/tmp}/portfolio-perf-profile
lsof -ti tcp:4302 | xargs kill 2>/dev/null
(python3 -m http.server 4302 --bind 127.0.0.1 --directory "$SITE" >/dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:4302/ && break; perl -e 'select(undef,undef,undef,0.25)'; done
pkill -f "remote-debugging-port=9378" 2>/dev/null
(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless=new --remote-debugging-port=9378 --user-data-dir="$PROFILE" --enable-unsafe-swiftshader about:blank >/dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:9378/json/version && break; perl -e 'select(undef,undef,undef,0.25)'; done
node "$HERE/check.mjs" http://127.0.0.1:4302/; code=$?
pkill -f "remote-debugging-port=9378"; lsof -ti tcp:4302 | xargs kill 2>/dev/null
exit $code
