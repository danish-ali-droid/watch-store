variable "vpc_cidr_block" {
 type = string
 description = "cidr for vpc"
}
variable "azs" {
 type = list(string)
 description = "availability zones"
}
