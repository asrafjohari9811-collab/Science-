#!/usr/bin/env bash
# Runs the migrations + acceptance tests on a throwaway PostgreSQL database.
# Usage: PGHOST=... PGPORT=... PGUSER=postgres bash scripts/test-db.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="sq_test_$$"
psql -q -v ON_ERROR_STOP=1 -d postgres -c "create database $DB" >/dev/null
trap 'psql -q -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
run() { psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$1" >/dev/null; }
run tests/db/00_supabase_shim.sql
for f in supabase/migrations/*.sql; do run "$f"; done
run supabase/seed/content.sql
run tests/db/01_fixtures.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f tests/db/02_scenarios.sql 2>&1 | sed 's/^psql:[^ ]* NOTICE:  /  ✓ /'
