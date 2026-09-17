#!/bin/bash
set -e

echo "Fetching Secrets from AWS Secrets Manager..."
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id "watch-store/postgres/credentials" --region eu-north-1 --query SecretString --output text)

export PGHOST=$(echo "$SECRET_JSON" | jq -r '.host')
export PGUSER=$(echo "$SECRET_JSON" | jq -r '.username')
export PGPASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')
export PGDATABASE=$(echo "$SECRET_JSON" | jq -r '.dbname')
export PGPORT=$(echo "$SECRET_JSON" | jq -r '.port // "5432"')

echo "Connecting to Private RDS ($PGHOST) and applying schema..."
psql -h $PGHOST -U $PGUSER -p $PGPORT -d $PGDATABASE -f /tmp/db/schema.sql

echo "Database Migration Applied Successfully!"
