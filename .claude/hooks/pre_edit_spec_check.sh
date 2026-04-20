#!/bin/bash
# PreToolUse hook: before editing a design-system component .tsx,
# remind AI to read the spec first.
#
# Diff-aware: skip if the edit is purely import cleanup / type-only / typo —
# spec reading not required for those. Only fire if edit touches render body,
# cva, variants, tokens, or other design-meaningful regions.
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only trigger for design-system component .tsx files (not stories, not specs)
if ! echo "$FILE_PATH" | grep -q 'src/design-system/components/.*\.tsx$'; then
  exit 0
fi
echo "$FILE_PATH" | grep -q '\.stories\.tsx$' && exit 0

# Diff-aware: extract old+new content. Skip if it's purely import / export-list
# manipulation or type-alias tweaks (not design-meaningful).
DIFF_TEXT=$(echo "$INPUT" | jq -r '
  (.tool_input.old_string // "") + "\n---\n" +
  (.tool_input.new_string // "") + "\n---\n" +
  (.tool_input.content    // "") + "\n---\n" +
  ([.tool_input.edits[]? | (.old_string + "\n---\n" + .new_string + "\n---\n")] | join(""))
' 2>/dev/null || echo "")

# If diff is non-empty and consists ONLY of import lines / export lines /
# pure type annotations — skip.
if [ -n "$DIFF_TEXT" ]; then
  # Strip lines that are imports / exports / type declarations / whitespace.
  MEANINGFUL=$(echo "$DIFF_TEXT" | grep -vE '^[[:space:]]*(import |export (type )?\{|export type |type [A-Z]|interface [A-Z]|//|---|[[:space:]]*$|\}|\{)' | head -5)
  # If nothing substantive remains, skip the nag.
  [ -z "$MEANINGFUL" ] && exit 0
fi

COMP_DIR=$(echo "$FILE_PATH" | sed -n 's|.*src/design-system/components/\([^/]*\)/.*|\1|p')
[ -z "$COMP_DIR" ] && exit 0

SPEC_BASENAME=$(echo "$COMP_DIR" | tr '[:upper:]' '[:lower:]' | sed 's/\([a-z]\)\([A-Z]\)/\1-\2/g; s/\([A-Z]\)\([A-Z][a-z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]')
cat <<EOJSON
{"hookSpecificOutput":{"hookEventName":"PreToolUse","additionalContext":"⚠️ Editing ${COMP_DIR} (design-meaningful region). Read ${SPEC_BASENAME}.spec.md + referenced patterns before proceeding."}}
EOJSON
