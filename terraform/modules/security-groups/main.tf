

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
   ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "TCP"
    security_groups = ["sg-0b1b0003bc97bc0e1", "sg-0e3b3556c8d197151"]

  }
  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "TCP"
    security_groups = ["sg-0b1b0003bc97bc0e1", "sg-0e3b3556c8d197151"]

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
    cidr_blocks     = ["192.168.0.0/16"]  
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
