#!/usr/bin/env bash

# Exit immediately on error
set -euo pipefail

# -----------------------------------------------------------------------------
# 1. Privileges & User Resolution
# -----------------------------------------------------------------------------
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
echo " Starting K3s Control Plane (Master) Setup "
echo "=================================================="

# Fetch current EC2 Region
TOKEN_IMDS=$(curl -s -S -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" || true)
AWS_REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN_IMDS" http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")

# -----------------------------------------------------------------------------
# 2. Dependencies & Kernel Tuning
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
# 3. Install K3s Control Plane (Master)
# -----------------------------------------------------------------------------
export K3S_KUBECONFIG_MODE="644"

# Disable Traefik so NGINX Ingress Controller can run on port 80/443
curl -sfL https://get.k3s.io | sh -s - server --disable traefik

systemctl enable k3s >/dev/null 2>&1
systemctl restart k3s

# -----------------------------------------------------------------------------
# 4. Permissions & Aliases Setup
# -----------------------------------------------------------------------------
mkdir -p /root/.kube
cp /etc/rancher/k3s/k3s.yaml /root/.kube/config

if [ -d "$TARGET_USER_HOME" ]; then
    mkdir -p "${TARGET_USER_HOME}/.kube"
    cp /etc/rancher/k3s/k3s.yaml "${TARGET_USER_HOME}/.kube/config"
    chown -R "${TARGET_USER}:" "${TARGET_USER_HOME}/.kube"
    chmod 600 "${TARGET_USER_HOME}/.kube/config"

    USER_BASHRC="${TARGET_USER_HOME}/.bashrc"
    if [ -f "$USER_BASHRC" ]; then
        if ! grep -q "alias k='kubectl'" "$USER_BASHRC"; then
            echo "alias k='kubectl'" >> "$USER_BASHRC"
            echo "alias kubectl='k3s kubectl'" >> "$USER_BASHRC"
            echo "export KUBECONFIG=${TARGET_USER_HOME}/.kube/config" >> "$USER_BASHRC"
        fi
    fi
fi

# -----------------------------------------------------------------------------
# 5. Push Token & Private IP to AWS SSM (For Workers)
# -----------------------------------------------------------------------------
TIMEOUT=60
ELAPSED=0
until k3s kubectl get nodes 2>/dev/null | grep -q "Ready"; do
    sleep 2
    ELAPSED=$((ELAPSED+2))
    if [ $ELAPSED -ge $TIMEOUT ]; then
        echo "[ERROR] K3s Master timed out." >&2
        exit 1
    fi
done

MASTER_TOKEN=$(cat /var/lib/rancher/k3s/server/node-token)
MASTER_PRIVATE_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN_IMDS" http://169.254.169.254/latest/meta-data/local-ipv4)

aws ssm put-parameter --name "/k3s/token" --value "$MASTER_TOKEN" --type "SecureString" --overwrite --region "$AWS_REGION"
aws ssm put-parameter --name "/k3s/master-ip" --value "$MASTER_PRIVATE_IP" --type "String" --overwrite --region "$AWS_REGION"

# Deploy NGINX Ingress Controller for AWS
k3s kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.0/deploy/static/provider/aws/deploy.yaml

# -----------------------------------------------------------------------------
# 6. Install AWS CodeDeploy Agent
# -----------------------------------------------------------------------------
cd /tmp
wget -q "https://aws-codedeploy-${AWS_REGION}.s3.${AWS_REGION}.amazonaws.com/latest/install" -O install
chmod +x ./install
./install auto >/dev/null 2>&1
systemctl start codedeploy-agent
systemctl enable codedeploy-agent

echo "✅ Master Node Setup Completed!"