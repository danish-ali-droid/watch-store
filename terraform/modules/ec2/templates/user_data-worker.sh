#!/usr/bin/env bash

# Exit immediately on error
set -euo pipefail

if [[ $EUID -ne 0 ]]; then
   echo "[ERROR] This script must be run as root or with sudo." >&2
   exit 1
fi

TARGET_USER="${SUDO_USER:-${USER}}"
if [ "$TARGET_USER" = "root" ]; then
    if id "ubuntu" &>/dev/null; then
        TARGET_USER="ubuntu"
    elif id "ec2-user" &>/dev/null; then
        TARGET_USER="ec2-user"
    fi
fi

TARGET_USER_HOME=$(eval echo "~${TARGET_USER}")

echo "=================================================="
echo " Starting K3s Agent (Worker) Setup "
echo "=================================================="

# Fetch current EC2 Region
TOKEN_IMDS=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
AWS_REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN_IMDS" http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")

# -----------------------------------------------------------------------------
# 1. Dependencies & Kernel Tuning
# -----------------------------------------------------------------------------
if command -v apt-get &>/dev/null; then
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get install -y -qq curl wget iptables ebtables iproute2 open-iscsi ruby-full awscli >/dev/null
elif command -v yum &>/dev/null; then
    yum update -y -q
    yum install -y -q curl wget iptables ebtables iproute openiscsi ruby aws-cli >/dev/null
fi

modprobe br_netfilter || true
modprobe overlay || true

cat <<EOF > /etc/modules-load.d/k3s.conf
overlay
br_netfilter
EOF

cat <<EOF > /etc/sysctl.d/99-k3s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sysctl --system >/dev/null 2>&1
swapoff -a || true
sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab

# -----------------------------------------------------------------------------
# 2. Fetch Master IP & Token from AWS SSM (Retry Loop)
# -----------------------------------------------------------------------------
echo "Fetching Master credentials from AWS SSM..."

TIMEOUT=300 # 5 Minutes wait time for Master to store parameters
ELAPSED=0
K3S_TOKEN=""
MASTER_IP=""

until [ -n "$K3S_TOKEN" ] && [ -n "$MASTER_IP" ]; do
    K3S_TOKEN=$(aws ssm get-parameter --name "/k3s/token" --with-decryption --query "Parameter.Value" --output text --region "$AWS_REGION" 2>/dev/null || true)
    MASTER_IP=$(aws ssm get-parameter --name "/k3s/master-ip" --query "Parameter.Value" --output text --region "$AWS_REGION" 2>/dev/null || true)
    
    if [ -n "$K3S_TOKEN" ] && [ -n "$MASTER_IP" ]; then
        break
    fi

    sleep 5
    ELAPSED=$((ELAPSED+5))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "[ERROR] Timed out waiting for K3s Master SSM Parameters." >&2
        exit 1
    fi
done

# -----------------------------------------------------------------------------
# 3. Join K3s Cluster as Worker Node
# -----------------------------------------------------------------------------
echo "Joining cluster at https://${MASTER_IP}:6443..."

curl -sfL https://get.k3s.io | K3S_URL="https://${MASTER_IP}:6443" K3S_TOKEN="${K3S_TOKEN}" sh -

systemctl enable k3s-agent >/dev/null 2>&1
systemctl restart k3s-agent

# -----------------------------------------------------------------------------
# 4. Install AWS CodeDeploy Agent
# -----------------------------------------------------------------------------
cd /tmp
wget -q "https://aws-codedeploy-${AWS_REGION}.s3.${AWS_REGION}.amazonaws.com/latest/install" -O install
chmod +x ./install
./install auto >/dev/null 2>&1
systemctl start codedeploy-agent
systemctl enable codedeploy-agent

echo "✅ Worker Node Joined Successfully!"