output "secret_arn" {
  value = aws_secretsmanager_secret.db-secrets.arn
}

output "secret_id" {
  value = aws_secretsmanager_secret.db-secrets.id
}