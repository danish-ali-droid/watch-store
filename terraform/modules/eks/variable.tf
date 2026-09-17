variable "cluster-role" {
    type = string
    description = "This is for eks cluster"
}
variable "subnet_ids" {
  type = list(string)
  description = "This contain the subnets. "
}
variable "cluster-policy-attachment" {
  type = string
  description = "this contain the role policy attachment for eks cluster."
}
variable "watch-store-sg" {
  type = list(string)
}
 variable "fargate-profile-name" {
   type = string
 }
 variable "pod-execution-urn" {
   type = string
 }
  variable "ns" {
   type = string
 }