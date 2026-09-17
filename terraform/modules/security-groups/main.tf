

# +++++++++++++++++++ cluster  Security Group ++++++++++++++++++++
resource "aws_security_group" "watch-store-sg" {
  vpc_id = var.vpc-id
  name   = "watch-store-cluter-sg"

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]

  }

  tags = {
    Name = "watch-store-sg"
  }

}

# +++++++++++++++++++ Db Security Group ++++++++++++++++++++
resource "aws_security_group" "watch-store-db-sg" {
  vpc_id      = var.vpc-id
  name        = "watch-store-db-sg"
  description = "Security group for watch store database"
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]

  }
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.watch-store-sg.id, aws_security_group.github-runner-sg.id]
  }
  tags = {
    Name = "watch-store-db-sg"
  }

}
# +++++++++++++++++++ Self Hosted Security Group ++++++++++++++++++++
resource "aws_security_group" "github-runner-sg" {
  vpc_id = var.vpc-id
  name   = "github-runner-sg"
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "TCP"
    cidr_blocks = ["0.0.0.0/0"]

  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]

  }

  tags = {
    Name = "Github-runner-sg"
  }

}
