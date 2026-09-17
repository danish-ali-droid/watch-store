variable "secret_name" {
  type        = string
  description = "Secrets Manager secret name"
}


variable "db-secrets" {
  type        = map(string)
  sensitive   = true
 
}