resource "aws_s3_bucket" "watch-store-s3" {
  bucket = "watch-store-s3-deplobucket"
  tags = {
    Name = "watch-store-s3-deplobucket"
  }
}