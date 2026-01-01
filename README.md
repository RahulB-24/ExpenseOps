# ExpenseOps - Enterprise Expense Management System

ExpenseOps is a comprehensive, multi-tenant expense management solution designed to streamline the entire reimbursement lifecycle for modern organizations. Built with an enterprise-grade technology stack, it facilitates seamless expense tracking, multi-level approval workflows, and detailed financial analytics while ensuring strict data isolation and security.

## Table of Contents
- [Key Features](#key-features)
- [Technical Architecture](#technical-architecture)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Configuration](#configuration)
- [User Roles and Capabilities](#user-roles-and-capabilities)
- [API Documentation](#api-documentation)

---

## Key Features

### Core Functionality
*   **Multi-Tenancy**: Engineered with robust data isolation to support multiple organizations within a single deployment. Each tenant's data is logically separated, ensuring privacy and security.
*   **Advanced Expense Tracking**: 
    *   **Dual-Date Logic**: distinguish between the transaction date (Expense Date) and the filing date (Submission Date) for accurate financial reporting.
    *   **Receipt Management**: Native support for uploading and previewing receipt attachments, including PDF documents and images, directly within the application.
*   **Approval Workflows**: 
    *   Configurable state machine handling the full lifecycle of an expense: Draft, Submitted, Approved, Rejected, and Reimbursed.
    *   One-click approval/rejection for managers to streamline operations.
*   **Audit Logging**: Comprehensive tracking of all actions taken on an expense report, providing a complete audit trail for compliance and transparency.

### Security & Access Control
*   **Role-Based Access Control (RBAC)**: Fine-grained permission system defining clear boundaries between Employees, Managers, Finance teams, and Administrators.
*   **Secure Authentication**: Implemented using Spring Security and JWT (JSON Web Tokens) for stateless, secure session management.
*   **Data Protection**: Soft-delete mechanisms to preserve historical data integrity and prevent accidental loss.

### User Experience
*   **Interactive Dashboard**: Real-time analytics charts visualizing spending trends, category breakdowns, and monthly statuses using Recharts.
*   **Smart Filtering & Search**: Advanced search capabilities allowing users to filter expenses by date, status, category, or merchant.
*   **Responsive Design**: A modern, clean user interface built with React and Tailwind CSS that adapts to various screen sizes.

---

## Technical Architecture

### Backend (Server)
*   **Java 17**: LTS version leveraging modern language features.
*   **Spring Boot 3.2.1**: Framework for creating production-grade Spring applications.
*   **Spring Security 6**: Authentication and access-control framework.
*   **Spring Data JPA / Hibernate**: ORM for database interactions.
*   **PostgreSQL**: relational database system.

### Frontend (Client)
*   **React 18**: JavaScript library for building user interfaces.
*   **TypeScript**: Strongly typed superset of JavaScript for code reliability.
*   **Vite**: Next-generation frontend tooling for fast builds.
*   **Tailwind CSS**: Utility-first CSS framework for custom design.
*   **Axios**: Promise-based HTTP client for API communication.


---

## Project Structure

```bash
ExpenseOps/
├── backend/
│   ├── src/main/java/com/expenseops/
│   │   ├── config/       # Security & App Configuration
│   │   ├── controller/   # REST API Controllers (Endpoints)
│   │   ├── dto/          # Data Transfer Objects (Req/Res models)
│   │   ├── entity/       # JPA Entities (Database Tables)
│   │   ├── repository/   # Spring Data Repositories (DB Access)
│   │   ├── security/     # JWT Auth Filters & Security Utils
│   │   └── service/      # Business Logic Layer
│   └── pom.xml           # Maven Dependencies
│
├── frontend/
│   ├── components/       # Reusable UI Components (Navbar, Modals, Cards)
│   ├── pages/            # Main Application Pages (Dashboard, Login, Admin)
│   ├── services/         # Axios API Service Wrappers
│   ├── App.tsx           # Main Application Routes & Layout
│   ├── index.tsx         # Entry Point
│   ├── types.ts          # TypeScript Intefaces
│   └── package.json      # NPM Dependencies
│
└── README.md
```

---

## Prerequisites

Ensure the following tools are installed on your system before proceeding:

1.  **Java Development Kit (JDK) 17** or higher.
2.  **Node.js 18** (LTS) or higher.
3.  **Maven** (optional, wrapper provided).
4.  **PostgreSQL** (Active local server or cloud connection string).

---

## Installation and Setup

### 1. Database Configuration
1.  Access your PostgreSQL instance using `psql`, `pgAdmin`, or another client.
2.  Create a new empty database named `expenseops`.
    ```sql
    CREATE DATABASE expenseops;
    ```
    *Note: The application will automatically create the required schema and tables upon its first successful startup.*

### 2. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Configure the database connection. Open `src/main/resources/application.properties` and update the following lines with your credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/expenseops
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    ```
3.  Build and run the application using the Maven Wrapper:
    ```bash
    ./mvnw spring-boot:run
    ```
    The server will start on port `8080`.

### 3. Frontend Setup
1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Create a `.env.local` file in the root of the frontend directory to define the API endpoint:
    ```bash
    echo "VITE_API_URL=http://localhost:8080/api" > .env.local
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

---

## User Roles and Capabilities

The system defines four primary roles, each with specific capabilities:

| Role | Responsibilities | Key Capabilities |
|------|------------------|------------------|
| **Employee** | Standard user | Create expenses, upload receipts, submit reports, view own analytics. |
| **Manager** | Team oversight | Review and approve/reject team submissions, view team-level reports. |
| **Finance** | Payment processing | Issue reimbursements, view organization-wide financial data. |
| **Admin** | System administration | User management, category configuration, tenant settings, comprehensive audit access. |

---

## API Documentation

ExpenseOps includes built-in Swagger/OpenAPI documentation for testing and integration purposes.

*   **Swagger UI**: `http://localhost:8080/swagger-ui/index.html`
*   **OpenAPI Spec**: `http://localhost:8080/v3/api-docs`

Use the Swagger UI to interactively explore endpoints, test requests, and view data models.

---

---

## Cloud Deployment

ExpenseOps is designed for cloud-native deployment using Docker containers and modern PaaS providers.

### 1. Docker Containerization
The backend is fully containerized using a multi-stage `Dockerfile`.
*   **Build Stage**: Uses Maven to compile the application.
*   **Run Stage**: Uses a lightweight **Alpine Linux** JRE image (Eclipse Temurin) to keep the final image size under 350MB, optimized for resource-constrained environments.

### 2. Backend Hosting (Render)
The Spring Boot backend is deployed on **Render** (Platform as a Service).
*   **Service Type**: Web Service (Docker Runtime).
*   **Health Checks**: Configured to monitor `/actuator/health` for zero-downtime updates.
*   **Environment**: Secrets (DB credentials, JWT keys) are securely managed via Render Environment Variables.

### 3. Frontend Hosting (Vercel)
The React frontend is deployed on **Vercel** Global Edge Network.
*   **Build Settings**: `npm run build` (Vite).
*   **Routing**: Configured via `vercel.json` to handle Single Page Application (SPA) routing.
*   **Integration**: Connects to the backend via `VITE_API_BASE_URL` env var.

---

## Gallery

<div align="center">
  <img width="800" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/cf9024d3-e655-4a30-81d2-0d064df5d509" />
  <p><em>Executive Dashboard with Real-time Analytics</em></p>
  <br/>
  
  <img width="800" alt="Expense Management" src="https://github.com/user-attachments/assets/87bda24c-1ce1-4c15-969e-7033d6716de4" />
  <p><em>Comprehensive Expense Tracking & Filtering</em></p>
  <br/>
  
  <img width="800" alt="Approval Workflow" src="https://github.com/user-attachments/assets/7d7730d0-ad5e-430e-bb8b-b35912dcdba8" />
  <p><em>Manager Approval Interface</em></p>
  <br/>
  
  <img width="800" alt="Mobile Responsive" src="https://github.com/user-attachments/assets/1ccfa828-daf4-4341-af00-81ecd06b5d44" />
  <p><em>Clean, Responsive Login Experience</em></p>
  <br/>
  
  <img width="800" alt="Reporting" src="https://github.com/user-attachments/assets/2016dfa2-50cc-4551-be68-89349df41589" />
  <p><em>Detailed Financial Reporting</em></p>
</div>

---

## License

**Developed by Rahul Balachandar**
