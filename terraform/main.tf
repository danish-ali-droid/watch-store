module "vpc" {
    source = "./modules/vpc"
    
    vpc_cidr_block = var.vpc_cidr_block
    azs = slice(data.aws_availability_zones.watch-store-azs.names, 0, 3)
}
module "ec2" {
    source = "./modules/ec2"
    subnet-id = module.vpc.public-subnet-ids[0]
    instance_profile = module.iam-role.ec2_profile
    github-runner-sg = module.security_group.github-runner-sg-id
    enbale-public-ip = true

  }
module "eks" {
  source = "./modules/eks"
  subnet_ids = slice(module.vpc.private-subnet-ids,0,1)
  cluster-role = module.iam-role.cluster
  cluster-policy-attachment = module.iam-role.cluster_AmazonEKSClusterPolicy
  pod-execution-urn = module.iam-role.fargate_pod_execution_role
  fargate-profile-name = "watch-store-fargate-profile"
  ns = "watch-app"
  watch-store-sg = [module.security_group.watch-store-sg]
  
}
module "security_group" {
    source = "./modules/security-groups"
    vpc-id = module.vpc.vpc-id
}

module "rds" {
    source = "./modules/rds"
    subnet_ids = slice(module.vpc.private-subnet-ids, 2, 4)
    db_username = "root"
    db_password = var.db_password
    db_sg = [module.security_group.security-group-rds-id]
}
module "iam-role" {
  source = "./modules/iam-role"
  
}

module "db_secrets" {
  source = "./modules/secret-manager"
  secret_name    = "watch-store/postgres/credentials"
 
  db-secrets =  {
    DB_PASSWORD = var.db_password
    SMTP_USER = var.smtp_user
    SMTP_PASS = var.smtp_pass
    PASSWORD_SALT = var.password_salt
    dbname   = "watch_store"
    DB_HOST   = module.rds.rds-end-point
    port     = "5432"
  }
  depends_on = [ module.rds ]
}