# ======================================================
# ++++++++++++++++++ IAM Role ++++++++++++++++++++
# ======================================================

# ++++++++++++++++++ EC2 Role ++++++++++++++++++++
resource "aws_iam_role" "github-runner-role" {
  name = "watch-store-code-deploy-role"
  assume_role_policy = jsonencode({
                      Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })

  tags = {
    Name = "watch-store-code-deploy-role"
  }
}

  # ++++++++++++++++++ IAM Policy +++++++++++++

resource "aws_iam_policy" "github_runner_custom_policy" {
  name        = "watch-store-jumper-custom-policy"
  description = "Allow Secrets Manager and EKS describe access for Jumper server"

 policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = "*" 
      },
      {
        Effect = "Allow"
        Action = [
          "eks:Describe*",
          "eks:List*",
          "eks:AccessKubernetesApi"
        ]
        Resource = "*"
      }
    ]
  })

}

# ++++++++++++++++++ EKS Access Entry +++++++++++++
resource "aws_eks_access_entry" "runner_access" {
  cluster_name  = "watch-store-eks-cluster"
  principal_arn = aws_iam_role.github-runner-role.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "runner_policy" {
  cluster_name  = "watch-store-eks-cluster"
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"
  principal_arn = aws_iam_role.github-runner-role.arn

  access_scope {
    type = "cluster"
  }
}
  # ++++++++++++++++++ IAM Role Attachment +++++++++++++
 

resource "aws_iam_role_policy_attachment" "attach-ssm-policy" {
  role       = aws_iam_role.github-runner-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy_attachment" "attach-secret-policy" {
  role       = aws_iam_role.github-runner-role.name
  policy_arn = aws_iam_policy.github_runner_custom_policy.arn
}
resource "aws_iam_role_policy_attachment" "attach-eks-cluster-policy" {
  role       = aws_iam_role.github-runner-role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}


# ++++++++++++++++++ EKS Role ++++++++++++++++++++

resource "aws_iam_role" "cluster" {
  name = "watch-store-eks-cluster"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sts:AssumeRole",
          "sts:TagSession"
        ]
        Effect = "Allow"
        Principal = {
          Service = "eks.amazonaws.com"
        }
      },
    ]
  })
}

# ++++++++++++++++++ EKS Role Policy Attachment ++++++++++++++++++++
resource "aws_iam_role_policy_attachment" "cluster_AmazonEKSClusterPolicy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}
resource "aws_iam_role_policy_attachment" "resorce-controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster.name
}

# ++++++++++++++++++ EKS Forgate Role ++++++++++++++++++++
resource "aws_iam_role" "fargate_pod_execution_role" {
  name = "watch-store-fargate-pod-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "eks-fargate-pods.amazonaws.com" }
    }]
  })
}
# ++++++++++++++++++ EKS Forgate Role Policy Attachment ++++++++++++++++++++
resource "aws_iam_role_policy_attachment" "fargate_pod_execution_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSFargatePodExecutionRolePolicy"
  role       = aws_iam_role.fargate_pod_execution_role.name
}

  # ++++++++++++++++++ Ec2 Profile +++++++++++++

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "github-runner-profile"
  role = aws_iam_role.github-runner-role.name
}

