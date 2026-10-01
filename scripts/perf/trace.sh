#!/bin/zsh
# scripts/perf/trace.sh <build folder> <selector | top> [page] — as run.sh, for trace.mjs: serves a build (e.g. the dist of
# `npx vite build --outDir /tmp/before`) on port 4301, runs bench.mjs against it in ONE headless
# Chrome, then stops both. Compare two builds by running it once for each, a few times over.
# Chrome's Energy Saver (on by default under 20% battery) caps frames at 30 a second and skews the
# scroll numbers, so it is switched off in the test browser's own profile.
HERE=${0:A:h}; SITE=${HERE:h:h}; PROFILE=${TMPDIR:-/tmp}/portfolio-perf-profile
cd "$SITE"
lsof -ti tcp:4301 | xargs kill 2>/dev/null
(npx vite preview --outDir "${1:A}" --port 4301 --strictPort --host 127.0.0.1 >/dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:4301/ && break; perl -e 'select(undef,undef,undef,0.25)'; done
pkill -f "remote-debugging-port=9378" 2>/dev/null
node -e 'const fs=require("fs"),dir=process.argv[1],file=dir+"/Local State";fs.mkdirSync(dir,{recursive:true});let state={};try{state=JSON.parse(fs.readFileSync(file,"utf8"))}catch{}(state.performance_tuning??={}).battery_saver_mode={state:0};fs.writeFileSync(file,JSON.stringify(state))' "$PROFILE"
(/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless=new --remote-debugging-port=9378 --user-data-dir="$PROFILE" --disable-features=BatterySaverModeAvailable,BatterySaverModeRenderTuning about:blank >/dev/null 2>&1 &)
for i in $(seq 1 40); do curl -s -o /dev/null http://127.0.0.1:9378/json/version && break; perl -e 'select(undef,undef,undef,0.25)'; done
cd "$HERE" && node trace.mjs http://127.0.0.1:4301/ "$2" "$3"
pkill -f "remote-debugging-port=9378"; lsof -ti tcp:4301 | xargs kill 2>/dev/null
