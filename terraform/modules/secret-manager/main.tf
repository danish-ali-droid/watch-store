# ======================================================
# ++++++++++++++++++  Secrets Manager +++++++++++++++++
# ======================================================

resource "aws_secretsmanager_secret" "db-secrets" {
  name        = var.secret_name
  recovery_window_in_days = 30
}

resource "aws_secretsmanager_secret_version" "db-secrets-version" {
  secret_id     = aws_secretsmanager_secret.db-secrets.id
  secret_string = jsonencode(var.db-secrets)
  
}