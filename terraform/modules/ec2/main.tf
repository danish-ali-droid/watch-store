# ======================================================
# ++++++++++++++++++ Instances ++++++++++++++++++++
# ======================================================
# +++++++++++++++++++ Masster EC2 Instances ++++++++++++++++++++
resource "aws_instance" "watch-store-private-instances-master"  {
    ami = "ami-035c8a091035e710a"
    instance_type =  "t3.micro"
    availability_zone = var.azs
    subnet_id = var.private-subnet-1-id
    vpc_security_group_ids = [var.security_group_master_id]
    iam_instance_profile = var.instance_profile
   user_data = file("${path.module}/templates/user_data-master.sh")

    key_name = "danish-keypair.pem"
    tags = {
        Name = "watch-store-private-instance-master"
        Role = "master"
        DeploymentTarget = "watch-store-app"
    }

}
# +++++++++++++++++++ worker EC2 Instances ++++++++++++++++++++
resource "aws_instance" "watch-store-private-instances-worker"  {
    ami = "ami-035c8a091035e710a"
    instance_type =  "t3.micro"
    availability_zone = var.azs
    subnet_id = var.private-subnet-1-id
    vpc_security_group_ids = [var.security_group_worker_id]
    iam_instance_profile = var.instance_profile
   user_data = file("${path.module}/templates/user_data-worker.sh")

    key_name = "danish-keypair.pem"
    tags = {
        Name = "watch-store-private-instance-worker"
        Role = "worker"
        DeploymentTarget = "watch-store-app"
    }

}