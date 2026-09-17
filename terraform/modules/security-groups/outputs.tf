output "watch-store-sg"{
    value = aws_security_group.watch-store-sg.id

}

output "security-group-rds-id" {
  value = aws_security_group.watch-store-db-sg.id
}

output "github-runner-sg-id" {
  value = aws_security_group.github-runner-sg.id
  }