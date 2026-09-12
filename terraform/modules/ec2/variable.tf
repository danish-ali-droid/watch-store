
    variable  "azs" { 
    type = string 
    }
    variable "security_group_master_id"{
       type = string 
    }
     variable "security_group_worker_id"{
       type = string 
    }
  variable "private-subnet-1-id" {
     type = string
  }
  variable "instance_profile" {
    type = string
  }