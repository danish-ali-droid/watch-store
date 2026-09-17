variable "vpc_cidr_block" {
    default = "192.168.0.0/16"
}
 
  variable "db_password" {
    type = string 
    sensitive = true
    
 }
variable "smtp_user" {
  type      = string
  sensitive = true
}

variable "smtp_pass" {
  type      = string
  sensitive = true
}

variable "password_salt" {
  type      = string
  sensitive = true
}