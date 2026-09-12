output "vpc-id" {
  value = aws_vpc.watch-store-vpc.id
}
output "public-subnet-ids" {
  value = aws_subnet.watch-store-public-subnet[*].id
}
output "private-subnet-ids" {  
    value = aws_subnet.watch-store-private-subnet[*].id
}
output "az_names" {
  value = var.azs
}