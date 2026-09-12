output "codedeploy_app_name" {
  description = "Name of the CodeDeploy Application"
  value       = aws_codedeploy_app.watch-app-code-deploy-app.name
}

output "codedeploy_deployment_group_name" {
  description = "Name of the CodeDeploy Deployment Group"
  value       = aws_codedeploy_deployment_group.watch-store-deployment-group.deployment_group_name
}

output "codedeploy_deployment_group_id" {
  description = "ID of the CodeDeploy Deployment Group"
  value       = aws_codedeploy_deployment_group.watch-store-deployment-group.id
}