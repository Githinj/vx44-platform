#!/usr/bin/env bash
# Opens, updates or closes the GitHub issue for a scheduled check of the live site, with the gh CLI
# and the workflow's own token (GH_TOKEN and GH_REPO in the environment). There's one open issue per
# label: a new failure comments on it instead of opening another, and "resolve" closes it.
#
#   alert-issue.sh open <label> <title> <body-file>
#   alert-issue.sh resolve <label> <body-file>
set -euo pipefail

mode="${1:-}"
label="${2:-}"

open_issue() {
  gh issue list --label "$label" --state open --limit 1 --json number --jq '.[0].number // empty'
}

case "$mode" in
  open)
    title="$3"
    body="$4"
    gh label create "$label" --color B60205 --description "A scheduled check of the live site failed" 2>/dev/null || true
    number="$(open_issue)"
    if [ -n "$number" ]; then
      gh issue comment "$number" --body-file "$body"
    else
      gh issue create --title "$title" --label "$label" --body-file "$body"
    fi
    ;;
  resolve)
    body="$3"
    number="$(open_issue)"
    if [ -n "$number" ]; then
      gh issue close "$number" --comment "$(cat "$body")"
    else
      echo "No open $label issue to close."
    fi
    ;;
  *)
    echo "usage: alert-issue.sh open <label> <title> <body-file> | resolve <label> <body-file>" >&2
    exit 2
    ;;
esac
