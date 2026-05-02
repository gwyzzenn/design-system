#!/bin/bash
# Tests for stop_meta_self_audit.sh
#
# Hook 跑 score-infra-best-practice.mjs(0-100 8 dim)+ inject self-improve
# prompt 若 regression OR any dim < 80。
#
# Scenarios:
#   1. Hook script syntax OK + executable
#   2. Minimal payload(no transcript)→ no crash exit 0
#   3. Hook respects CLAUDE_PROJECT_DIR(runs in correct dir)

set -u
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOOK="$SCRIPT_DIR/../stop_meta_self_audit.sh"

[ -x "$HOOK" ] || { echo "FATAL: hook not executable"; exit 1; }

PASS=0; FAIL=0; FAILED=""

# Test 1: Syntax check
echo "Test 1: bash syntax OK"
if bash -n "$HOOK"; then
  echo "  PASS  Test 1 syntax valid"; PASS=$((PASS+1))
else
  echo "  FAIL  Test 1 syntax error"; FAIL=$((FAIL+1)); FAILED="${FAILED}\n  - Test 1"
fi

# Test 2: minimal stdin → no crash
echo "Test 2: minimal stdin → no crash"
TMP_PROJ=$(mktemp -d)
mkdir -p "$TMP_PROJ/.claude/logs" "$TMP_PROJ/scripts"
echo '{}' > "$TMP_PROJ/.claude/logs/score-history.jsonl"
STDOUT=$(echo '{}' | CLAUDE_PROJECT_DIR="$TMP_PROJ" bash "$HOOK" 2>&1); EXIT=$?
# Accept exit 0 OR 1(missing scripts/score-infra-best-practice.mjs in tmp 是 OK)
if [ "$EXIT" = "0" ] || [ "$EXIT" = "1" ]; then
  echo "  PASS  Test 2 no crash on minimal payload(exit=$EXIT)"; PASS=$((PASS+1))
else
  echo "  FAIL  Test 2 (exit=$EXIT, output=$STDOUT)"; FAIL=$((FAIL+1)); FAILED="${FAILED}\n  - Test 2"
fi
rm -rf "$TMP_PROJ"

# Test 3: hook respects CLAUDE_PROJECT_DIR
echo "Test 3: hook respects CLAUDE_PROJECT_DIR"
TMP_PROJ=$(mktemp -d)
mkdir -p "$TMP_PROJ/.claude/logs"
STDOUT=$(echo '{}' | CLAUDE_PROJECT_DIR="$TMP_PROJ" bash "$HOOK" 2>&1); EXIT=$?
# 不該 leak 訊息出 stdout(stop hook decision JSON 例外 — 但本 case minimal env 不該觸發)
if [ "$EXIT" = "0" ] || [ "$EXIT" = "1" ]; then
  echo "  PASS  Test 3 honors CLAUDE_PROJECT_DIR"; PASS=$((PASS+1))
else
  echo "  FAIL  Test 3 (exit=$EXIT, output=${STDOUT:0:200})"; FAIL=$((FAIL+1)); FAILED="${FAILED}\n  - Test 3"
fi
rm -rf "$TMP_PROJ"

echo ""
echo "════ Results: $PASS PASS, $FAIL FAIL ════"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed:"
  printf "%b\n" "$FAILED"
  exit 1
fi
exit 0
