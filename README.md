# ⌚ ChronoCraft — Watch Store E-Commerce Platform

A production-ready, cloud-native full-stack luxury watch e-commerce web application featuring microservice containerization, Infrastructure as Code (IaC) with Terraform on AWS, automated CI/CD multi-pipeline workflows, Kubernetes orchestration, and multi-tier database caching.

---

## 🏛️ System Architecture

![Architecture Diagram](artitecture-diagram.jpeg)

```
[ Clients / Browser ]
         │
         ▼
[ AWS ALB / NGINX Ingress Controller ]
         │
    ┌────┴──────────────────────────┐
    │ Path: /                       │ Path: /api/*
    ▼                               ▼
[ Frontend Pods (React 19) ]    [ Backend API Pods (Express) ]
(Nginx Alpine Slim / port 80)    (Node.js 22 / port 4000)
                                    │               │
                            (Cache & OTP)     (Persistent DB)
                                    ▼               ▼
                            [ Redis Cache ]   [ AWS Aurora PostgreSQL / MariaDB ]
```

### Core Architecture Highlights:
- **Client Tier**: Single-Page Application (SPA) built with React 19, TypeScript, and Tailwind CSS served via an unprivileged NGINX Alpine container.
- **Application Tier**: RESTful API service written in Node.js (Express), containerized with multi-stage Docker builds.
- **Cache & Session Tier**: Redis for fast product catalog caching, OTP management (2-minute expiration), and session optimization.
- **Database Tier**: AWS Aurora PostgreSQL / MariaDB relational database managing products, users, authentication, and order workflows with ACID compliance.
- **Cloud Infrastructure**: Fully provisioned using modular Terraform on AWS (VPC, EKS with Fargate, EC2 Bastion/Self-Hosted Runner, Aurora RDS, IAM, AWS Secrets Manager, and Security Groups).
- **CI/CD & GitOps**: Multi-pipeline GitHub Actions triggering syntax verification, SQLFluff checks, automated testing with coverage, container builds pushed to Docker Hub, and rolling updates to AWS EKS.

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Router DOM v7, Lucide React, React Hot Toast |
| **Backend** | Node.js 22, Express.js, MariaDB / PostgreSQL Driver, Redis Client, Multer, Nodemailer (SMTP), Twilio (SMS OTP), UUID |
| **Databases & Cache** | AWS Aurora RDS (PostgreSQL) / MariaDB, Redis |
| **Containerization & Orchestration** | Docker (Multi-stage builds), Kubernetes (AWS EKS with AWS Fargate), NGINX Ingress |
| **Infrastructure as Code (IaC)** | Terraform (Modular VPC, Subnets, EKS, RDS, IAM, Secrets Manager, EC2, SG) |
| **CI/CD Pipelines** | GitHub Actions (Terraform, Backend, Frontend, Database Migrations) |
| **Testing & Quality** | Vitest, React Testing Library, ESLint, Prettier, SQLFluff |

---

## 📂 Project Structure

```bash
watch-store/
├── .github/
│   └── workflows/
│       ├── terraform.yaml            # IaC automation (Init, Plan, Apply)
│       ├── frontend-pipeline.yaml    # React build, test, Docker push, EKS deploy
│       ├── backend-pipeline.yaml     # Express build, test, Docker push, EKS deploy
│       └── database-pipeline.yaml    # SQLFluff lint, ephemeral test, RDS migration
├── backend/
│   ├── src/
│   │   ├── index.js                  # Main API server routes & controllers
│   │   ├── db.js                     # Database connection pool & query handler
│   │   └── services/                 # Email (Nodemailer), SMS (Twilio), Cache (Redis)
│   ├── .env.example                  # Backend environment variable template
│   ├── Dockerfile                    # Multi-stage Node 22 backend container build
│   └── package.json                  # Backend dependencies & scripts
├── db/
│   ├── schema.sql                    # Relational schema (Users, Products, Orders, etc.)
│   └── seed.sql                      # Initial catalog & admin user seed data
├── manifests/
│   ├── ns.yaml                       # Namespace definition (`watch-app`)
│   ├── watch-app-cm.yaml             # Kubernetes ConfigMap
│   ├── watch-app-secret.yaml         # Kubernetes Secrets
│   ├── frontend-deployment.yaml      # React Deployment & Service
│   ├── backend-deployment.yaml       # Node.js API Deployment & Service
│   ├── redis-deployment.yaml         # Redis Deployment & Service
│   └── ingress-resource.yaml         # NGINX Ingress rules & route mapping
├── public/                           # Static assets, logos, and images
├── src/
│   ├── components/                   # Reusable UI components (Navbar, Footer, Cards)
│   ├── pages/                        # Views (Home, Products, Details, Cart, Checkout, Auth, Admin)
│   ├── store/                        # Global state management via Zustand
│   ├── App.tsx                       # Main application routing and providers
│   ├── main.tsx                      # Vite React entry point
│   └── index.css                     # Global Tailwind styles
├── terraform/
│   ├── modules/
│   │   ├── vpc/                      # VPC, Public/Private Subnets, IGW, NAT Gateway
│   │   ├── ec2/                      # Self-hosted GitHub Runner / Management host
│   │   ├── eks/                      # AWS EKS Cluster & Fargate profiles
│   │   ├── rds/                      # AWS Aurora PostgreSQL Multi-AZ Cluster
│   │   ├── iam-role/                 # EKS cluster, Fargate pod execution, EC2 roles
│   │   ├── secret-manager/           # Secrets Manager for secure DB credentials
│   │   └── security-groups/          # Fine-grained security groups
│   ├── main.tf                       # Root Terraform definition
│   ├── variables.tf                  # Infrastructure variable declarations
│   └── backend.tf                    # S3 / Remote state backend configuration
├── Dockerfile                        # Multi-stage frontend container (Node build -> Nginx)
├── package.json                      # Frontend dependencies & workspace scripts
└── vite.config.ts                    # Vite compilation config
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
- **Node.js** >= 20.x or 22.x
- **Docker** and **Docker Compose**
- **npm** >= 10.x

### 2. Clone the Repository
```bash
git clone https://github.com/danish-ali-droid/watch-store.git
cd watch-store
```

### 3. Environment Configuration
Create `.env` inside `backend/` (or root directory):
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=watch_store

REDIS_URL=redis://127.0.0.1:6379
PORT=4000
PASSWORD_SALT=your_secure_salt

# Optional Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### 4. Database Initialization
Start MariaDB/PostgreSQL & Redis:
```bash
docker run -d --name watch-redis -p 6379:6379 redis:alpine
docker run -d --name watch-db -p 3306:3306 -e MARIADB_ROOT_PASSWORD=your_password -e MARIADB_DATABASE=watch_store mariadb:latest
```
Apply the database schema and seed data:
```bash
# Apply schema and initial seed data
mysql -h 127.0.0.1 -u root -p watch_store < db/schema.sql
mysql -h 127.0.0.1 -u root -p watch_store < db/seed.sql
```

### 5. Install Dependencies & Start Services

#### Backend:
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:4000
```

#### Frontend:
```bash
# In the root project directory:
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🐳 Docker Deployment

Build and run both services using Docker:

### Build Frontend
```bash
docker build -t watch-store-frontend:latest .
docker run -d -p 8080:8080 watch-store-frontend:latest
```

### Build Backend
```bash
cd backend
docker build -t watch-store-backend:latest .
docker run -d -p 4000:4000 --env-file .env watch-store-backend:latest
```

---

## ☁️ Cloud Infrastructure (Terraform & AWS EKS)

The project includes production-grade Terraform configurations to deploy the entire cloud infrastructure on AWS:

```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### Infrastructure Components:
- **VPC Module**: Custom VPC spanning 3 Availability Zones with private and public subnets.
- **EKS Module**: AWS Managed Kubernetes with **AWS Fargate** profiles for serverless pod execution under the `watch-app` namespace.
- **Aurora RDS**: Multi-AZ PostgreSQL cluster with private subnet placement and automated failover.
- **Secrets Manager**: Encrypted storage and automated retrieval for database credentials and notification tokens.
- **EC2 Instance Profile**: Self-hosted GitHub Runner deployed inside the VPC for secure database migration and deployment execution.

---

## 🔄 CI/CD Automation Workflows

The repository uses 4 decoupled GitHub Actions pipelines:

1. **`terraform.yaml`**: Validates, plans, and automatically deploys infrastructure changes on push to `main`.
2. **`database-pipeline.yaml`**: Lints SQL files using `sqlfluff`, spins up an ephemeral PostgreSQL test container in GitHub Actions to test migrations, and applies migrations onto AWS Aurora RDS via a private self-hosted runner.
3. **`backend-pipeline.yaml`**: Lints and formats with Prettier/ESLint, runs unit tests with Vitest, creates container builds, pushes images to Docker Hub (`watch-store-backend`), and executes a rolling restart in Kubernetes.
4. **`frontend-pipeline.yaml`**: Typechecks with TypeScript (`tsc --noEmit`), runs frontend test suites with coverage reports, builds production bundle, pushes container images to Docker Hub (`watch-store-frontend`), and applies Kubernetes manifest updates.

---

## 🧪 Testing & Linting

```bash
# Run Frontend Tests & Coverage
npm test

# Check TypeScript Types
npx tsc --noEmit

# Format Code
npx prettier --write "src/**/*.{js,jsx,ts,tsx,css,json}"

# Lint SQL Migrations
sqlfluff lint db/ --dialect postgres
```

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
