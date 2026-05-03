#!/bin/bash
# stop everything
echo "Stopping services and clearing volumes..."
docker-compose down -v

#start everything
echo "Rebuilding database from schema and seed files..."
docker-compose up -d

echo "Database reset complete! Adminer is at http://localhost:8080"