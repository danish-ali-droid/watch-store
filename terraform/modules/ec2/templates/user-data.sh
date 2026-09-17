#!/bin/bash
set -e

# ++++++++++++++++++ Update and Install dependencies ++++++++++++++++++++

apt-get update -y
apt-get install -y curl tar jq docker.io git postgresql-client unzip perl
systemctl enable --now docker
usermod -aG docker ubuntu

# ++++++++++++++++++ Install eksctl ++++++++++++++++++++
ARCH=amd64
PLATFORM=$(uname -s)_$ARCH

curl -sLO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_$PLATFORM.tar.gz"

curl -sL "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_checksums.txt" | grep $PLATFORM | sha256sum --check

tar -xzf eksctl_$PLATFORM.tar.gz -C /tmp && rm eksctl_$PLATFORM.tar.gz

sudo install -m 0755 /tmp/eksctl /usr/local/bin && rm /tmp/eksctl


# ++++++++++++++++++ Install awscli and kubectl ++++++++++++++++++++

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
apt-get install -y unzip
unzip awscliv2.zip && ./aws/install
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# ++++++++++++++++++ Install Github runner ++++++++++++++++++++
mkdir /home/ubuntu/actions-runner && cd /home/ubuntu/actions-runner
curl -o actions-runner-linux-x64-2.337.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.337.0/actions-runner-linux-x64-2.337.0.tar.gz
echo "70920811a4f8ad4328818682bca5c6469c1c942fab52448868071d0063816613  actions-runner-linux-x64-2.337.0.tar.gz" | shasum -a 256 -c
tar xzf ./actions-runner-linux-x64-2.337.0.tar.gz
chown -R ubuntu:ubuntu /home/ubuntu/actions-runner
# ++++++++++++++++++ Update Configuration ++++++++++++++++++++
GH_PAT=$(aws secretsmanager get-secret-value --secret-id "github/pat-token" --query SecretString --output text --region eu-north-1)

RUNNER_TOKEN=$(curl -sX POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GH_PAT" \
  https://api.github.com/repos/danish-ali-droid/watch-store/actions/runners/registration-token | jq -r .token)
sudo -u ubuntu ./config.sh --unattended \
  --url "https://github.com/danish-ali-droid/watch-store" \
  --token "$RUNNER_TOKEN" \
  --name "watch-store-runner-ec2" \
  --replace

# ++++++++++++++++++ Restart Service ++++++++++++++++++++
./svc.sh install ubuntu
./svc.sh start
