# =============================================
# +++++++++++++++ EKS Cluster ++++++++++++++   
# =============================================

# +++++++++++++++ EKS Cluster ++++++++++++++ 
resource "aws_eks_cluster" "watch-store-eks-cluster" {
  name = "watch-store-eks-cluster"

  access_config {
    authentication_mode = "API"
  }

  role_arn = var.cluster-role
  version  = "1.36"

  vpc_config {
    subnet_ids = var.subnet_ids
    security_group_ids = var.watch-store-sg
  
  }


  depends_on =  [var.cluster-policy-attachment]
   # aws_iam_role_policy_attachment.cluster_AmazonEKSClusterPolicy, 

tags = {
  "Name" =  "wach-store-eks-cluster"
}
}
# +++++++++++++++ EKS Cluster Forgate Profile ++++++++++++++ 
resource "aws_eks_fargate_profile" "watch-store-forgate-profile" {
  cluster_name           = aws_eks_cluster.watch-store-eks-cluster.name
  fargate_profile_name   = var.fargate-profile-name
  pod_execution_role_arn = var.pod-execution-urn
  subnet_ids             = var.subnet_ids

  selector {
    namespace =  var.ns
  }
}
# +++++++++++++++ Default Cluster Forgate Profile ++++++++++++++ 
resource "aws_eks_fargate_profile" "kube_system" {
  cluster_name           = aws_eks_cluster.watch-store-eks-cluster.name
  fargate_profile_name   = "kube-system-fargate-profile"
  pod_execution_role_arn = var.pod-execution-urn
  subnet_ids             = var.subnet_ids

  selector {
    namespace = "kube-system"
  }
}

