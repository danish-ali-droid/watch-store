  # ======================================================
  # ++++++++++++++++++ RDS ++++++++++++++++++++
  # ======================================================

  # ++++++++++++++++++ Subnet Group ++++++++++++++++++++
  resource "aws_db_subnet_group" "watch-store-db-subnetgroup" {
    name       = "watch-store-db-subnetgroup"
    subnet_ids = var.subnet_ids
    
    tags = {
      Name = "watch-store-db-subnetgroup"
    }
  }


  # ++++++++++++++++++ Db Cluster ++++++++++++++++++++

  resource "aws_rds_cluster" "watch-store-db-cluster" {
    cluster_identifier      = "watch-store-db-cluster"
    engine                  = "aurora-postgresql"
    database_name           = "watch_store"
    master_username         = var.db_username
    master_password         = var.db_password
    db_subnet_group_name    = aws_db_subnet_group.watch-store-db-subnetgroup.name
    vpc_security_group_ids  = var.db_sg  
    skip_final_snapshot     = true

    tags = {
      Name = "watch-store-db-cluster"
    }
  }

  # ++++++++++++++++++ Db Cluster Instance ++++++++++++++++++++

  resource "aws_rds_cluster_instance" "watch-store-db-cluster-instance" {
    count = 2
    identifier              = "watch-store-db-cluster-instance-${count.index + 1}"
    cluster_identifier      = aws_rds_cluster.watch-store-db-cluster.id
    instance_class          = "db.t3.medium"
    engine                  = aws_rds_cluster.watch-store-db-cluster.engine
    publicly_accessible     = false
  
    tags = {
      Name = "watch-store-db-cluster-instance-${count.index + 1}"
    }
    
  }