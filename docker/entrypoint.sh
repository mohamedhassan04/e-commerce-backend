#!/bin/sh
set -eu

: "${PORT:=8080}"
: "${UPLOADS_DIR:=/app/uploads}"
export PORT UPLOADS_DIR

if [ "$#" -eq 0 ]; then
  set -- node dist/main.js
fi

if [ ! -d "$UPLOADS_DIR" ]; then
  echo "Creating uploads directory: $UPLOADS_DIR"
  mkdir -p "$UPLOADS_DIR"
fi

if [ ! -w "$UPLOADS_DIR" ]; then
  echo "Error: uploads directory is not writable by uid $(id -u): $UPLOADS_DIR" >&2
  exit 1
fi

exec "$@"
