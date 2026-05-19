#!/bin/bash
set -euo pipefail

OUTPUT_DIR="../stream-feeds-js/packages/feeds-client/src/gen"
CHAT_DIR="../chat"

rm -rf $OUTPUT_DIR

( cd $CHAT_DIR ; make openapi ; ./build/chat-manager openapi generate-client --language ts --spec ./releases/v2/feeds-clientside-api.yaml --output $OUTPUT_DIR )

yarn lint:gen
