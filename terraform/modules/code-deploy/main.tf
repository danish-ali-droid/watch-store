# =========================================
# ++++++++++ Code Deploy +++++++++++++++++
# =========================================

# ++++++++++++++ Code Deploy App ++++++++++
resource "aws_codedeploy_app" "watch-app-code-deploy-app" {
  compute_platform = "Server"
  name             = "watch-app-code-deploy-app"
}

# ++++++++++++++ Code Deployment group ++++++++++++
resource "aws_codedeploy_deployment_group" "watch-store-deployment-group" {
  app_name =  aws_codedeploy_app.watch-app-code-deploy-app.name
  deployment_group_name = "watch-store-deployment-group"
  service_role_arn = var.service-role-arn 

    ec2_tag_set {
    ec2_tag_filter {
      key   = var.ec2-tag-name
      type  = "KEY_AND_VALUE"
      value = var.ec2-tag-value
    }
   
  }
    auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }

}