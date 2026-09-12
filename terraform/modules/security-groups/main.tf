
# +++++++++++++++++++ Mater EC2 Security Group ++++++++++++++++++++
resource "aws_security_group" "watch-store-master-ec2-sg" {
    vpc_id = var.vpc-id
    name = "watch-store-master-sg"
    description = "Security group for watch store"
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
       
        }
 tags = {
        Name = "watch-store-master-sg"
    }

}

# +++++++++++++++++++ Worker EC2 Security Group ++++++++++++++++++++
resource "aws_security_group" "watch-store-worker-ec2-sg" {
    vpc_id = var.vpc-id
    name = "watch-store-worker-sg"
    description = "Security group for watch store"
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
       
        }
    
 tags = {
        Name = "watch-store-worker-sg"
    }

}

# +++++++++++++++++++ Db Security Group ++++++++++++++++++++
resource "aws_security_group" "watch-store-db-sg" {
    vpc_id = var.vpc-id
    name = "watch-store-db-sg"
    description = "Security group for watch store database"
    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
       
        }
    ingress {
        from_port = 5432
        to_port = 5432
        protocol = "tcp"
        security_groups = [aws_security_group.watch-store-master-ec2-sg.id , aws_security_group.watch-store-worker-ec2-sg.id]
    }
 tags = {
        Name = "watch-store-db-sg"
    }

}

