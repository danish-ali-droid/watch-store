output "security-group-master-ec2-id"{
    value = aws_security_group.watch-store-master-ec2-sg

}
output "security-group-worker-ec2-id"{
    value = aws_security_group.watch-store-worker-ec2-sg

}
output "security-group-rds-id" {
  value = aws_security_group.watch-store-db-sg.id
}