# ======================================================
# ++++++++++++++++++ IAM Role ++++++++++++++++++++
# ======================================================

# ++++++++++++++++++ EC2 Role ++++++++++++++++++++
resource "aws_iam_role" "watch-store-ec2-role" {
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

  # ++++++++++++++++++ IAM Role Attachment +++++++++++++
 

resource "aws_iam_role_policy_attachment" "watch-store-role-s3-policy-attachment" {
role = aws_iam_role.watch-store-ec2-role.name
policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
resource "aws_iam_role_policy_attachment" "watch-store-role-ssm-policy-attachment" {
role = aws_iam_role.watch-store-ec2-role.name
policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy" "k3s_ssm_parameter_policy" {
  name = "k3s-ssm-parameter-policy"
  role = aws_iam_role.watch-store-ec2-role.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:PutParameter",
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/k3s/*"
      }
    ]
  })
}
# +++++++++++++++++ CodeDeploy Service Role ++++++++++++
resource "aws_iam_role" "codedeploy_service_role" {
  name = "watch-store-codedeploy-service-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codedeploy.amazonaws.com" }
    }]
  })
}

  # ++++++++++++++++++ IAM Role Attachment +++++++++++++

resource "aws_iam_role_policy_attachment" "codedeploy_service_policy" {
  role       = aws_iam_role.codedeploy_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSCodeDeployRole"
}
# ++++++++++++++++++ Instance Profile ++++++++++++++++++++

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "watch-store-ec2-codedeploy-profile"
  role = aws_iam_role.watch-store-ec2-role.name
}

