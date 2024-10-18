#!/bin/bash
set -euo pipefail

OUTPUT_DIR="../stream-feeds-js/packages/common/src/gen"
CHAT_DIR="../chat"

rm -rf $OUTPUT_DIR

( cd $CHAT_DIR ; make openapi ; go run ./cmd/chat-manager openapi generate-client --language ts --sdk common --spec ./releases/v2/common-clientside-api.yaml --output $OUTPUT_DIR )

yarn lint:gen