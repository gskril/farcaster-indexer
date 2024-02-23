#!/bin/sh

# Check if the BACKFILL environment variable is set to "true"
# To run the backfill script, docker run -d -e BACKFILL=true your-image-name

if [ "$BACKFILL" = "true" ]; then
  echo "Running backfill..."
  exec npm run backfill
else
  echo "Starting application..."
  exec npm start
fi
