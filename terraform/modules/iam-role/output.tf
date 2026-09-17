output "Instance-profile-name" {
  value = aws_iam_instance_profile.ec2_profile.name
}
output "cluster_AmazonEKSClusterPolicy" {
  value = aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy.id
}
output "fargate_pod_execution_role" {
  value = aws_iam_role.fargate_pod_execution_role.arn
}
output "cluster" {
  value = aws_iam_role.cluster.id
}
output "ec2_profile" {
  value = aws_iam_instance_profile.ec2_profile.name
}