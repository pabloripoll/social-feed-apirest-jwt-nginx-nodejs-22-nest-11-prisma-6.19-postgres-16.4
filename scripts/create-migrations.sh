#!/usr/bin/env sh
# Prepare SQL migration files for Prisma by moving each *.sql file into
# a directory with the same basename and naming the file migration.sql.
# Usage: ./scripts/prepare-prisma-migrations.sh
set -eu

MIGRATIONS_DIR="prisma/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Error: directory ${MIGRATIONS_DIR} not found. Run this from the project root."
  exit 1
fi

count=0

# match .sql and .SQL files
for f in "$MIGRATIONS_DIR"/*.[sS][qQ][lL]; do
  [ -e "$f" ] || continue

  base="$(basename "$f" | sed 's/\.[sS][qQ][lL]$//')"
  dest="$MIGRATIONS_DIR/$base"
  dest_file="$dest/migration.sql"

  # If destination is already a directory and contains migration.sql, skip to avoid overwrite
  if [ -d "$dest" ]; then
    if [ -e "$dest_file" ]; then
      echo "Skipping: destination exists and contains migration.sql -> $dest_file"
      continue
    else
      echo "Destination directory exists but migration.sql absent, moving file into it: $dest"
      mv "$f" "$dest_file"
      echo "Moved: $f -> $dest_file"
      count=$((count + 1))
      continue
    fi
  fi

  # create folder and move
  mkdir -p "$dest"
  mv "$f" "$dest_file"
  echo "Created: $dest  — moved $f -> $dest_file"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "No .sql migration files found in ${MIGRATIONS_DIR}."
else
  echo "Done. Processed $count migration file(s)."
  echo "Verify the folder layout with: ls -R ${MIGRATIONS_DIR}"
fi