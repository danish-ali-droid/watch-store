module "vpc" {
    source = "./modules/vpc"
    
    vpc_cidr_block = var.vpc_cidr_block
    azs = slice(data.aws_availability_zones.watch-store-azs.names, 0, 3)
}
module "ec2" {
    source = "./modules/ec2"
    private-subnet-1-id = module.vpc.private-subnet-ids[0]
    security_group_master_id = module.security_group.security-group-master-ec2-id
    security_group_worker_id = module.security_group.security-group-worker-ec2-id
    instance_profile = module.iam-role.Instance-profile-name
    azs = module.vpc.az_names[0]
  }
module "security_group" {
    source = "./modules/security-groups"
    vpc-id = module.vpc.vpc-id
}
module "rds" {
    source = "./modules/rds"
    subnet_ids = slice(module.vpc.private-subnet-ids, 1, 3)
    db_username = var.db_username
    db_password = var.db_password
    db_sg = [module.security_group.security-group-rds-id]
}
module "iam-role" {
  source = "./modules/iam-role"
  
}
module "code-deploy" {
source = "./modules/code-deploy"
service-role-arn = module.iam-role.codedeploy-service-role-arn
ec2-tag-name = module.ec2.codedeploy_tag_key
ec2-tag-value = module.ec2.codedeploy_tag_value
}
module "s3_bucket"{
  source = "./modules/s3-bucket"

}