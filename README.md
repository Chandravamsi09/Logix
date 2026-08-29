# Logix: Enterprise Cloud-Native Supply Chain & Microservices Platform

[![CI Pipeline](https://github.com/Chandravamsi09/Logix/actions/workflows/ci-build-test.yml/badge.svg)](https://github.com/Chandravamsi09/Logix/actions)
[![Security Audit](https://github.com/Chandravamsi09/Logix/actions/workflows/security-audit.yml/badge.svg)](https://github.com/Chandravamsi09/Logix/actions)
[![Architecture: Clean DDD](https://img.shields.io/badge/Architecture-Clean%20DDD%20%2F%20Event--Driven-blue.svg)](https://github.com/Chandravamsi09/Logix)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](https://github.com/Chandravamsi09/Logix)

**Logix** is a high-throughput, multi-tenant cloud-native supply chain, warehouse inventory, distributed order orchestration, and fleet logistics microservices platform. Engineered with Clean Architecture, Domain-Driven Design (DDD), Transactional Outbox pattern, Saga orchestration, and strict database-per-service isolation.

---

## 🏛️ System Architecture Overview

```
                      +-----------------------------+
                      |   React 18 / TypeScript SPA |
                      |    (Web Operations Center)  |
                      +--------------+--------------+
                                     | HTTPS / WSS
                                     v
                      +-----------------------------+
                      |     API Gateway (:4000)     |
                      |  Reverse Proxy & Rate Limit |
                      +--------------+--------------+
                                     |
    +---------------+----------------+---------------+---------------+
    |               |                |               |               |
    v               v                v               v               v
+---------+   +-----------+   +-------------+  +-----------+  +------------+
|  Auth   |   |   Order   |   |  Inventory  |  | Logistics |  |  Billing   |
| Service |   |  Service  |   |   Service   |  |  Service  |  |  Service   |
| (:4001) |   |  (:4002)  |   |   (:4003)   |  |  (:4004)  |  |  (:4005)   |
+----+----+   +-----+-----+   +------+------+  +-----+-----+  +-----+------+
     |              |                |               |              |
  [Postgres]     [Postgres]       [MongoDB]       [Postgres]     [Postgres]
     |              |                |               |              |
     +--------------+----------------+---------------+--------------+
                                     |
                          +----------v----------+
                          | Distributed Event   |
                          | Bus (RabbitMQ/Redis)|
                          +----------+----------+
                                     |
                      +--------------+--------------+
                      |                             |
                      v                             v
            +-------------------+         +-------------------+
            |   Notification    |         |     Analytics     |
            |  Service (:4006)  |         |  Service (:4007)  |
            +---------+---------+         +---------+---------+
                      |                             |
                   [Redis]                      [Postgres]
```

---

## 📦 Services Breakdown

| Service | Port | Database | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `4000` | Redis (Rate limiting) | Central reverse proxy, JWT claim verification, token bucket rate limiter, Correlation ID routing. |
| **Auth & IAM** | `4001` | PostgreSQL | Multi-tenant identity, RBAC permission matrix, Argon2 hashing, Refresh token rotation. |
| **Order Management** | `4002` | PostgreSQL | Order state machine, distributed transaction Saga orchestrator, Outbox message publisher. |
| **Inventory & Warehouse** | `4003` | MongoDB | Multi-facility bin allocations, atomic stock reservations, SKU catalogs, batch tracking. |
| **Fleet & Logistics** | `4004` | PostgreSQL | Carrier dispatch, GPS waypoint telemetry, route optimization, Proof-of-Delivery (POD). |
| **Billing & Financial Ledger** | `4005` | PostgreSQL | Double-entry financial accounting ledger, automated invoicing, payment gateway abstractions. |
| **Notification Hub** | `4006` | Redis | Omnichannel notification engine, WebSocket live feeds, template rendering. |
| **Analytics & Reporting** | `4007` | PostgreSQL | Cross-domain metric rollups, fulfillment KPIs, executive PDF/CSV report generation. |
| **Common Shared Library** | N/A | N/A | CloudEvents contracts, Domain error hierarchies, Result monads, DTO validators. |
| **Web Dashboard** | `3000` | N/A | React 18, TypeScript, TailwindCSS, Live Fleet Map, Order Saga visualizer. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: >= 20.x
- **Docker & Docker Compose**: >= 24.x
- **npm**: >= 10.x

### 1. Clone & Configure Environment
```bash
git clone https://github.com/Chandravamsi09/Logix.git
cd Logix
cp example.env .env
```

### 2. Start Full Stack with Docker Compose
```bash
docker compose up --build
```

### 3. Run Automated Test Suite
```bash
npm install
npm test
```

---

## 🛡️ Security & Zero-Trust Architecture
- **Zero Hardcoded Secrets**: All configuration is loaded dynamically through strict environment schemas.
- **No Third-Party Copied Code**: 100% clean-room, custom-engineered TypeScript architecture.
- **Strict Tenant Isolation**: Multi-tenant data segregation enforced at both Gateway and Repository layers.

---

## 📄 License
UNLICENSED. All rights reserved.
