variable "vpc_cidr_block" {
    default = "192.168.0.0/16"
}
 
 variable "db_username" {
    type = string 
    sensitive = true

 }
  variable "db_password" {
    type = string 
    sensitive = true
    
 }
