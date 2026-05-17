#!/bin/bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/home/ec2-user/database_backup}"

mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Crear una copia de seguridad de la base de datos
export PGPASSWORD=rEDT8s57ynH6
pg_dump -U Cyb14BXD519W -h localhost -p 5433 -d preparabombero -F c -f "$BACKUP_FILE"

# Subir la copia de seguridad a S3
aws s3 cp "$BACKUP_FILE" s3://108782067299-database-backups
aws cloudwatch put-metric-data --namespace "Backup" --metric-name "BackupStatus" --value 1 --timestamp "$(date +%Y-%m-%dT%H:%M:%S)"

# Configurar el script para ejecutarse cada 12 horas usando cron
# (Ejecuta 'crontab -e' y añade la siguiente línea)
# 0 */12 * * * /opt/preparabombero/web/backup.bash

# pg_restore -U Cyb14BXD519W -h localhost -p 5433 -d preparabombero -F c -v backup_2024-09-12_11-00-05.sql
