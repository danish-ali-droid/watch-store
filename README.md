# ╔════════════════════════════════════════════════════════════════════╗
# ║                    WATCH STORE / CHRONOCRAFT                    ║
# ║   Luxury Watch E-Commerce Platform with DevOps Automation      ║
# ╚════════════════════════════════════════════════════════════════════╝

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express)](https://expressjs.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com)
[![Terraform](https://img.shields.io/badge/Terraform-AWS-7B42BC?style=for-the-badge&logo=terraform)](https://www.terraform.io)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=for-the-badge&logo=kubernetes)](https://kubernetes.io)

A premium luxury watch store built as a full-stack web application and a real-world DevOps project. The project includes a modern frontend, secure backend APIs, Redis caching, MariaDB integration, Docker deployment, Kubernetes manifests, Terraform-based AWS infrastructure, and GitHub Actions CI/CD pipelines.

---

## 🏁 Project Banner

```text
╔══════════════════════════════════════════════════════════════════════════════════╗
║                     LUXURY WATCH E-COMMERCE PLATFORM                       ║
║                 Premium Collections • Secure Checkout • Admin Dashboard      ║
║                                                                            ║
║  Frontend: React + Vite + TypeScript + Tailwind                            ║
║  Backend:  Express + Node.js + Redis + MariaDB                              ║
║  Infra:    AWS + Terraform + EKS + Security Groups                          ║
║  DevOps:   Docker + Kubernetes + GitHub Actions + CI/CD                     ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## 🌟 Project Overview

This repository is a complete watch store application designed for a premium e-commerce experience. It demonstrates full-stack development and production-grade deployment architecture, combining a polished storefront with end-to-end infrastructure automation.

### Included capabilities

- Luxury watch store UI with hero banners and category sections
- Product catalog with featured, new-arrival, and filtered listings
- Product detail pages and checkout flow
- Shopping cart and order management
- User login, registration, and OTP-based verification
- Admin dashboard for product and user management
- Redis caching for faster product access and temporary OTP storage
- MariaDB-backed data persistence
- Dockerized application packaging
- Kubernetes deployment manifests for cluster rollout
- Terraform infrastructure provisioning on AWS
- GitHub Actions pipelines for code quality, build, test, and deploy automation

---

## 🧩 Architecture

```text
┌───────────────────────────────┐
│          Users / Browser      │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│    Frontend (React + Vite)   │
│  TypeScript + Tailwind CSS    │
└──────────────┬────────────────┘
               │
               ▼
┌───────────────────────────────┐
│    Backend API (Express)      │
│ Auth • Catalog • Orders • Admin│
└───────┬───────────────┬───────┘
        │               │
        │               ▼
        │      ┌────────────────┐
        │      │ Redis Cache    │
        │      │ OTP + Catalog  │
        │      └────────────────┘
        │
        ▼
┌───────────────────────────────┐
│     MariaDB / AWS RDS         │
│  Users • Products • Orders    │
└───────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router |
| Backend | Node.js, Express.js, Redis, MariaDB, Multer, Nodemailer, Twilio |
| Tests & Quality | Vitest, React Testing Library, ESLint, Prettier |
| Containerization | Docker, NGINX |
| Cloud & Infrastructure | AWS, Terraform, EKS, IAM, Secrets Manager, Security Groups |
| CI/CD | GitHub Actions, Docker Hub, Kubernetes deployment automation |

---

## 📁 Repository Structure

```bash
watch-store/
├── .github/
│   └── workflows/
│       ├── backend-pipeline.yaml
│       ├── database-pipeline.yaml
│       ├── frontend-pipeline.yaml
│       └── terraform.yaml
├── backend/
│   ├── src/
│   │   ├── services/
│   │   ├── db.js
│   │   └── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── db/
│   ├── schema.sql
│   └── seed.sql
├── manifests/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── ingress-resource.yaml
│   ├── ns.yaml
│   ├── redis-deployment.yaml
│   ├── watch-app-cm.yaml
│   └── watch-app-secret.yaml
├── public/
│   ├── assets/
│   └── uploads/
├── src/
│   ├── components/
│   ├── pages/
│   ├── store/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── utils/
├── terraform/
│   ├── modules/
│   ├── backend.tf
│   ├── main.tf
│   ├── outputs.tf
│   ├── providers.tf
│   ├── terraform.tfvars
│   └── variable.tf
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.json
├── vite.config.ts
├── LICENSE
└── .gitignore
```

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 20+
- npm
- Docker
- Redis
- MariaDB or PostgreSQL-compatible database

### 1. Clone the repository

```bash
git clone https://github.com/danish-ali-droid/watch-store.git
cd watch-store
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure environment variables

Create a `.env` file in the backend folder or project root depending on your local setup:

```env
PORT=4000
PASSWORD_SALT=your_secure_salt
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=watch_store
REDIS_URL=redis://127.0.0.1:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 5. Start dependencies

```bash
docker run -d --name watch-redis -p 6379:6379 redis:alpine

docker run -d --name watch-db -p 3306:3306 \
  -e MARIADB_ROOT_PASSWORD=your_password \
  -e MARIADB_DATABASE=watch_store \
  mariadb:latest
```

### 6. Import schema and seed data

```bash
mysql -h 127.0.0.1 -u root -p watch_store < db/schema.sql
mysql -h 127.0.0.1 -u root -p watch_store < db/seed.sql
```

### 7. Run the app

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
npm run dev
```

Access URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:4000

---

## 🐳 Docker Deployment

### Frontend container

```bash
docker build -t watch-store-frontend:latest .
docker run -d -p 8080:8080 watch-store-frontend:latest
```

### Backend container

```bash
cd backend
docker build -t watch-store-backend:latest .
docker run -d -p 4000:4000 --env-file .env watch-store-backend:latest
```

---

## ☁️ Terraform and AWS Infrastructure

The infrastructure is written in Terraform under the [terraform](terraform) directory. It provisions the cloud environment required for the application.

### Included infrastructure

- VPC and subnets
- EKS cluster configuration
- IAM role and policy setup
- RDS database provisioning
- Security groups
- AWS Secrets Manager integration
- EC2 support for runner and management use cases

### Terraform entry files

- [terraform/main.tf](terraform/main.tf)
- [terraform/providers.tf](terraform/providers.tf)
- [terraform/backend.tf](terraform/backend.tf)
- [terraform/modules](terraform/modules)

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

---

## 🔄 CI/CD Pipelines

The project contains production-style automation workflows under [.github/workflows](.github/workflows):

### 1. Infrastructure pipeline
- [terraform.yaml](.github/workflows/terraform.yaml)
- Configure AWS credentials
- Run Terraform init, plan, and apply

### 2. Backend pipeline
- [backend-pipeline.yaml](.github/workflows/backend-pipeline.yaml)
- Runs code validation and build steps
- Publishes backend Docker image to Docker Hub
- Deploys the backend to Kubernetes

### 3. Frontend pipeline
- [frontend-pipeline.yaml](.github/workflows/frontend-pipeline.yaml)
- Lints, type-checks, tests, builds, and pushes the frontend image
- Deploys the updated frontend to the cluster

### 4. Database pipeline
- [database-pipeline.yaml](.github/workflows/database-pipeline.yaml)
- Handles SQL checks and related database automation tasks

---

## 📦 Kubernetes Manifests

The deployment manifests are stored in [manifests](manifests):

- [manifests/ns.yaml](manifests/ns.yaml)
- [manifests/watch-app-cm.yaml](manifests/watch-app-cm.yaml)
- [manifests/watch-app-secret.yaml](manifests/watch-app-secret.yaml)
- [manifests/frontend-deployment.yaml](manifests/frontend-deployment.yaml)
- [manifests/backend-deployment.yaml](manifests/backend-deployment.yaml)
- [manifests/redis-deployment.yaml](manifests/redis-deployment.yaml)
- [manifests/ingress-resource.yaml](manifests/ingress-resource.yaml)

These files define the namespace, application configuration, external secrets, services, and deployment versions for the cluster.

---

## 🧪 Testing and Validation

```bash
# Frontend tests
npm test

# Type checking
npx tsc --noEmit

# Linting
npx eslint .

# Formatting
npx prettier --check "src/**/*.{js,jsx,ts,tsx,css,json}"
```

---

## 📜 License

This project is licensed under the MIT License.

---

## ✅ Summary

This project reflects a real production-style application architecture where frontend, backend, infrastructure, and CI/CD pipelines are all connected. It is well-suited for learning modern e-commerce implementation, AWS cloud automation, Kubernetes deployment, and full DevOps delivery workflows.
