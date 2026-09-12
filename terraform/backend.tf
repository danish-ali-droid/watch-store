terraform {
    backend "s3" {
      bucket = "danish-terraform-state-1"   
      key = "terraform-state"
      region = "us-east-1"
      encrypt = true
      use_lockfile = true       
    }
}