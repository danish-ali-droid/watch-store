#!/bin/bash
 set -e
 MANIFEST_DIR="/manifests"
 export PATH=$PATH:/usr/local/bin:/usr/bin:/bin
 echo "=========================================="
echo "Starting K3s Manifest Deployment"
echo "=========================================="

export KUBECONFIG=/etc/rancher/k3s/k3s.yaml

if ! command -v k3s &> /dev/null; then
    echo "Error: k3s command not found on this instance!"
    exit 1
fi

echo "Applying manifests from $MANIFEST_DIR..."
k3s kubectl apply -f $MANIFEST_DIR/

echo "Rolling out deployments to update pods..."
k3s kubectl rollout restart deployment -n default || echo "No deployments to restart."

echo "=========================================="
echo "K3s Deployment Completed Successfully!"
echo "=========================================="
