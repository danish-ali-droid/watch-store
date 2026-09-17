# ================================================ 
# +++++++++++++++++ VPC ++++++++++++++++++++++++  
# ================================================
resource "aws_vpc" "watch-store-vpc" {
     cidr_block = var.vpc_cidr_block
     tags = {
        Name = "watch-store-vpc"
     }
}
# =================================================
# +++++++++++++++++ Public Subnet +++++++++++++++  
# =================================================
resource "aws_subnet" "watch-store-public-subnet"{
    vpc_id = aws_vpc.watch-store-vpc.id
    count = 2
    cidr_block = cidrsubnet(aws_vpc.watch-store-vpc.cidr_block, 8, count.index)
    availability_zone = var.azs[count.index]
    tags = {
        Name = "watch-store-public-subnet-${count.index + 1}"
    }
}
# +++++++++++++++++ Internet gateway ++++++++++++++
resource "aws_internet_gateway" "watch_store_igw" {
    vpc_id = aws_vpc.watch-store-vpc.id
    tags = {
        Name = "watch-store-igw"
    }
}
# +++++++++++++++++ Route Table ++++++++++++++
resource "aws_route_table" "watch-store-public-rt"{
vpc_id = aws_vpc.watch-store-vpc.id
route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.watch_store_igw.id
}
}
# +++++++++++++++++ Route Table Association ++++++++++++++++++++
resource "aws_route_table_association" "watch-store-public-rt-association" {
    count = 2
    subnet_id = aws_subnet.watch-store-public-subnet[count.index].id
    route_table_id = aws_route_table.watch-store-public-rt.id
}
# =================================================
# +++++++++++++++++ Private Subnet ++++++++++++++
# =================================================
 resource "aws_subnet" "watch-store-private-subnet"{
    vpc_id = aws_vpc.watch-store-vpc.id
    count = 4
    cidr_block = cidrsubnet(aws_vpc.watch-store-vpc.cidr_block, 8 , count.index + 2)
    availability_zone = var.azs[count.index % length(var.azs)]
    tags = {
        Name = "watch-store-private-subnet-${count.index + 1}"
    }
 }
 # +++++++++++++++ NAT Gateway ++++++++++++++++++++
  resource "aws_nat_gateway" "watch-store-ntg" {
    subnet_id = aws_subnet.watch-store-public-subnet[0].id
    allocation_id = aws_eip.watch-store-eip.id
     tags = {
    Name = "watch-store-ntg"
 }
     }
# +++++++++++++++++ Elastic IP ++++++++++++++++++++
resource "aws_eip" "watch-store-eip" {
    domain = "vpc"
    tags = {
        Name = "watch-store-eip"
    }
}
# +++++++++++++++++ Route Table ++++++++++++++++++++
resource "aws_route_table" "watch-store-private-rt" {
    vpc_id = aws_vpc.watch-store-vpc.id
    route {
        cidr_block = "0.0.0.0/0"
        nat_gateway_id = aws_nat_gateway.watch-store-ntg.id
    }
 tags = {
    Name = "watch-store-private-rt"
 }
}
# +++++++++++++++++ Route Table Association ++++++++++++++++++++
resource "aws_route_table_association" "watch-store-private-rt-association"{
    count = 2
    subnet_id = aws_subnet.watch-store-private-subnet[count.index].id
    route_table_id = aws_route_table.watch-store-private-rt.id
}

