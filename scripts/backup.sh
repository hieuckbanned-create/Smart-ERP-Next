#!/bin/sh
set -e
BACKUP_DIR=/backup
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h postgres -U "$PGUSER" -d "$PGDATABASE" -F c -f "$BACKUP_DIR/smart_erp_${TIMESTAMP}.dump"
find "$BACKUP_DIR" -type f -name 'smart_erp_*.dump' | sort | head -n 7 | sed -e :a -e '$d;N;ba' -e 's/\n/\0/g' | xargs -0 -n1 rm -f
