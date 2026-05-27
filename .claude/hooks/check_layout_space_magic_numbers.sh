#!/bin/bash
# check_layout_space_magic_numbers.sh — P1 WARN
#
# 偵測 consumer / DS app code 用 Tailwind spacing magic numbers
# (`p-4` / `px-6` / `py-2` / `gap-3` 等)而非 layoutSpace token
# (`p-[var(--layout-space-*)]` / `gap-[var(--layout-space-*)]`)。
# 2026-05-27 user verbatim「未來其他類似 content 的容器也都應該要遵循這些原則」永久 codify.
#
# Anchor:user 質疑「content 自動繼承 layoutSpace SSOT 嗎?」
# - app-shell.spec.md:205 明文 `<main>` landmark padding=0 (intentional)
# - app-shell.spec.md:207-212 consumer 必遵循 layoutSpace.spec.md 6 條規則 + 親疏 3 級
# - 但 spec.md 是 markdown 不機械強制 → consumer 可能寫 `<div className="p-4">` magic number
#
# PostToolUse Edit/Write detect magic Tailwind spacing → suggest layoutSpace token
# (P1 WARN soft signal,不 block,避免 false positive 太多)

source "$(dirname "$0")/_log-fire.sh" 2>/dev/null && log_hook_fire

set -uo pipefail

INPUT=$(cat 2>/dev/null || echo "{}")
TOOL=$(echo "$INPUT" | jq -r '.tool_name // ""' 2>/dev/null)

case "${TOOL:-}" in
  Edit|Write|MultiEdit) ;;
  *) exit 0 ;;
esac

FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // ""' 2>/dev/null)

# Only check .tsx / .ts in app code
if ! echo "$FILE" | grep -qE '\.(tsx|ts)$'; then exit 0; fi
# Skip DS source (DS components have their own spacing logic via cva)
if echo "$FILE" | grep -qE 'packages/design-system/src/|node_modules/'; then exit 0; fi

# Get new content
NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.new_string // .tool_input.content // ""' 2>/dev/null)
[ -z "$NEW_CONTENT" ] && exit 0

# Detect magic spacing classes in consumer code
MAGIC_HITS=$(echo "$NEW_CONTENT" | grep -oE '\b(p|px|py|pt|pb|pl|pr|gap|space-x|space-y|m|mx|my|mt|mb|ml|mr)-(0\.5|[1-9][0-9]?(\.[0-9])?)\b' | sort -u | head -5)

if [ -n "$MAGIC_HITS" ]; then
  cat >&2 << EOF
⚠️  LAYOUT-SPACE-MAGIC-NUMBER WARNING(P1 soft signal,2026-05-27 user directive):

  Detected Tailwind spacing magic numbers in $FILE:
$(echo "$MAGIC_HITS" | sed 's/^/    /')

  per app-shell.spec.md L205-219 + layoutSpace.spec.md:consumer content 必遵循
  layoutSpace 6 條規則 + 親疏 3 級,**不該硬寫 Tailwind magic numbers**。改用:
    p-[var(--layout-space-loose)]    /* px-16px 規則 1A/1B chrome / wrap */
    p-[var(--layout-space-tight)]    /* py-12px 規則 3 親 gap */
    gap-[var(--layout-space-distant)] /* gap-24px 規則 3 疏 gap */
    space-y-[var(--layout-space-distant)]

  This is WARN only (not block) — magic numbers might be legitimate (Avatar size,
  icon size, etc.). Review + 改 token 若是 spacing context。

  完整 6 條規則 → packages/design-system/src/tokens/layoutSpace/layoutSpace.spec.md
EOF
fi

exit 0
