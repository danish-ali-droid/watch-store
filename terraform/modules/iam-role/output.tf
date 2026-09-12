output "Instance-profile-name" {
  value = aws_iam_instance_profile.ec2_profile.name
}
output "codedeploy-service-role-arn" {
  value = aws_iam_role.codedeploy_service_role.arn
}
output "ec2-role-arn" {
    value = aws_iam_role.watch-store-ec2-role.arn
  
}