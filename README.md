# 📝 **GymControl – Comprehensive Gym Management System**


[![TDD](https://img.shields.io/badge/methodology-TDD-blue)](https://martinfowler.com/bliki/TestDrivenDevelopment.html) [![TypeScript](https://img.shields.io/badge/language-TypeScript-007ACC)](https://www.typescriptlang.org/) [![Docker](https://img.shields.io/badge/platform-Docker-2496ED)](https://www.docker.com/)

GymControl is a **professional gym management solution** built with **Clean Architecture**, **Test-Driven Development**, and **TypeScript**.  
This monorepo implements a comprehensive system for **managing memberships, payments, user roles**, and integrations with different payment gateways.

---

## 📁 **Project Architecture**


```bash
gymControl/
├── README.md
├── package.json
├── docker-compose.yml
├── domain/                     # Core business logic (Clean Architecture)
│   ├── src/
│   │   ├── entities/           # Domain entities
│   │   ├── use-cases/          # Business operations
│   │   ├── services/           # Domain services
│   │   └── repositories/       # Repository interfaces
│   ├── tests/                  # Comprehensive unit tests (TDD)
│   └── package.json
│
└── apps/
    ├── backend/                # REST API (Express + MongoDB)
    │   ├── src/
    │   │   ├── config/         # Environment configuration
    │   │   ├── infrastructure/ # Database adapters, payment integrations
    │   │   └── presentation/   # REST controllers
    │   ├── Dockerfile
    │   └── package.json
    │
    └── frontend/               # 🚧 Coming soon!
```

---

## 🚀 **Quick Start with Docker** (Recommended)

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- [Git](https://git-scm.com/) to clone the repository

### ⚡ Run the complete application (Single command)

```bash
# Clone the repository
git clone https://github.com/m4rkdv/gym-control
cd gymControl

# Start all services (Frontend + Backend + Database)
docker compose up -d
```

### 🌐 Access the application

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **API Backend**: [http://localhost:3001/api](http://localhost:3001/api)
- **Health Check**: [http://localhost:3001/api/health](http://localhost:3001/api/health)

### 👤 Test Users

The system automatically initializes with test users:

#### Administrator
- **Username**: `admin`
- **Password**: `123456`
- **Permissions**: Full system access

#### Trainers
- **Username**: `trainer1` or `trainer2`
- **Password**: `123456`
- **Permissions**: Member and routine management

#### Members
- **Username**: `member1`, `member2`, etc.
- **Password**: `123456`
- **Permissions**: Access to personal information

### 🐳 Included Docker services:
- **🌐 Nginx**: Reverse proxy and static server
- **⚛️ Frontend**: Next.js application with React
- **🔧 Backend**: REST API with Express and Node.js
- **🗄️ MongoDB**: NoSQL database with auto-seeded test data

---

## 🔑 **Key Architectural Principles**

| Principle | Description |
|-----------|-------------|
| **Clean Architecture** | Core domain completely independent of frameworks |
| **Test-Driven Development** | 90+ tests covering critical business rules |
| **Dependency Inversion** | Infrastructure depends on domain, not vice-versa |
| **Monorepo Structure** | Yarn workspaces for efficient dependency management |
| **Backend** | Node.js with Express for RESTful API |
| **Database** | MongoDB for data persistence |
| **Deployment** | Docker containers for easy scaling and deployment |

---

## �️ **Development Setup** (For Testing & Local Development)

### ✅ **Prerequisites**

- **Node.js v18+**
- **Docker & Docker Compose** (for MongoDB)
- **Yarn v1+**

### 📦 **Installation & Setup**

```bash
# Clone repository
git clone https://github.com/m4rkdv/gym-control.git
cd gymControl

# Install dependencies
yarn install

# Copy environment template
cp apps/backend/.env.example apps/backend/.env
```

### 🐳 **Start Database Only (for development)**

```bash
# Start MongoDB container
docker compose up -d mongo
```

### 🚀 **Run Development Server**

```bash
# Start backend development server
yarn workspace @gymcontrol/backend dev
```

### 🧪 **Running Tests (TDD Approach)**

```bash
# Run all domain tests (TDD core)
yarn workspace @gymcontrol/domain test

# Run specific test suite
yarn workspace @gymcontrol/domain vitest run tests/membership-status.test.ts

# Run tests in watch mode
yarn workspace @gymcontrol/domain test --watch

# Run backend tests
yarn workspace @gymcontrol/backend test
```

---

### 🧩 **Core Domain Entities**

- **Member**: Name, weight, age, membership status
- **Payment**: Amount, method, date, covered months
- **User**: Roles (`Member`, `Trainer`, `Admin`)

### 🔐 **Critical Business Rules**

| Status | Condition |
|--------|-----------|
| **Active** | Payment up-to-date (grace period until 10th) |
| **Inactive** | Missed payment deadline |
| **Suspended** | 3 consecutive inactive months |
| **Eliminated** | Manual admin action |

---

## 📚 **Learning Reflections**

Implementing this project with **Clean Architecture + TDD** provided valuable insights:

| Insight | Description |
|---------|-------------|
| **Domain Isolation** | Business rules remained pure and framework-agnostic |
| **TDD Confidence** | Tests caught edge cases (leap year, timezones) |
| **Architectural Challenges** | Solved via abstract repositories + dependency injection |
| **Docker Benefits** | Consistent dev environment & production-like DB config |

---

## ➡️ **Next Steps**

- [ ] Add **administrator dashboard** with metrics
- [ ] Develop **member portal** with payment functionality
- [ ] Create **trainer management interface**
- [ ] Implement **automated membership status transitions** whit cronjobs

---
> **GymControl © 2025** – Fitness Management System  
> Built with **Clean Architecture** | **TDD** | **TypeScript**