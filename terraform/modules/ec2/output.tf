output "master_instance_id" {
  value       = aws_instance.watch-store-private-instances-master.id
  description = "List of EC2 Instance IDs"
}

output "worker_instance_id" {
  value       = aws_instance.watch-store-private-instances-worker.id
  description = "List of EC2 Instance IDs"
}

output "codedeploy_tag_key" {
  value = "DeploymentTarget"
}

output "codedeploy_tag_value" {
  value = "watch-store-app"
}