# ======================================================
# ++++++++++++++++++ Instances ++++++++++++++++++++
# ======================================================
# +++++++++++++++++++ Github self-hosted EC2 Instances ++++++++++++++++++++
resource "aws_instance" "github-self-hosted-runner"  {
    ami = "ami-035c8a091035e710a"
    instance_type =  "t3.micro"
    subnet_id = var.subnet-id
    vpc_security_group_ids = [var.github-runner-sg]
    iam_instance_profile = var.instance_profile
    associate_public_ip_address = var.enbale-public-ip
   user_data = file("${path.module}/templates/user-data.sh")

    key_name = "danish-keypair"
    tags = {
        Name = "Gihub-runner"
    }

}
