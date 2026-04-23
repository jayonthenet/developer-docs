#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(dirname "$0")

# Merge both OpenAPI files and adjust the merged content
jq -s '
  {
    openapi: .[0].openapi,
    info: .[0].info,
    paths: (reduce .[].paths as $item ({}; . * $item)),
    components: (reduce .[].components as $item ({}; . * $item))
  }
' $SCRIPT_DIR/spec-cp.json $SCRIPT_DIR/spec-dp.json $SCRIPT_DIR/spec-iam.json \
| jq -f $SCRIPT_DIR/prepareOpenAPI.jq - \
> $SCRIPT_DIR/../../../static/spec/platform-orchestrator-openapi-spec.json
