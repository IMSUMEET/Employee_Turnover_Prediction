#!/usr/bin/env bash
# Start the AttritionIQ API on :5001
cd "$(dirname "$0")"
exec ../.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 5001 "$@"
