#!/bin/bash
set -euo pipefail

OUTPUT_DIR_COMMON="../stream-feeds-js/packages/common/src/gen"
OUTPUT_DIR_FEEDS="../stream-feeds-js/packages/feeds-client/src/gen"
CHAT_DIR="../chat"

rm -rf $OUTPUT_DIR_COMMON
rm -rf $OUTPUT_DIR_FEEDS

( cd $CHAT_DIR ; make openapi ; go run ./cmd/chat-manager openapi generate-client --language ts --sdk common --spec ./releases/v2/common-clientside-api.yaml --output $OUTPUT_DIR_COMMON ; go run ./cmd/chat-manager openapi generate-client --language ts --sdk feeds --spec ./releases/v2/feeds-clientside-api.yaml --output $OUTPUT_DIR_FEEDS )

yarn lint:gen