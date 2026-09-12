variable "subnet_ids" {
    description = "List of subnet IDs for the RDS instance"
    type        = list(string)
}
variable "db_username"{
    type = string 
    description = "The username for the master user of the RDS instance"
    sensitive = true
}
variable "db_password"{
    type = string 
    description = "The password for the master user of the RDS instance"
    sensitive = true
}
variable "db_sg"{
    type = list(string)
    description = "The security group IDs for the RDS instance"
}
