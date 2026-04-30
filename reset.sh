#!/bin/bash

# 1. Stop and remove containers, networks, and images defined in the file
# 2. The -v flag is the "magic" part—it removes the named volumes (pgdata)
echo "Stopping services and clearing volumes..."
docker-compose down -v

# 3. Start the services back up
# Docker will see the volume is gone, create a new one, and 
# execute the scripts in /docker-entrypoint-initdb.d/ in order.
echo "Rebuilding database from schema and seed files..."
docker-compose up -d

echo "Database reset complete! Adminer is at http://localhost:8080"