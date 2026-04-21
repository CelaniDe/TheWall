# Global Wall (Next.js + MariaDB + Docker)

This project is a **very simple anonymous “global wall” app** where users can:

* post opinions
* like or dislike other opinions

There is **no authentication**, no accounts, and no notifications.
Identity is simulated using a cookie-based anonymous token.

---

## ⚠️ Important: This is NOT a best-practice production app

This repository exists for **learning purposes only**.

It is intentionally simplified so students can focus on:

* understanding how a full-stack app works
* learning how to **run services with Docker**
* practicing **deployment to a VPS**

### What this project does *not* try to do properly

* ❌ No real authentication / authorization
* ❌ No rate limiting
* ❌ No input sanitization beyond basic checks
* ❌ No protection against spam or abuse
* ❌ No pagination or performance optimization
* ❌ No security hardening
* ❌ No proper environment separation (dev/staging/prod)
* ❌ No CI/CD pipeline

If you tried to run this in production as-is, it would break or get abused quickly.

---

## 🎯 Purpose of this repo

This project is designed to help you learn:

* how a backend connects to a database
* how a frontend talks to an API
* how services communicate inside Docker
* how to run everything together using **docker-compose**
* how to deploy a containerized app to a VPS

That’s it. Keep your focus there.

---

## 🧱 Tech stack

* **Next.js (App Router)**
* **MariaDB**
* **Docker + Docker Compose**
* **Tailwind CSS**

---

## 🚀 Getting started (local)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd global-wall
```

### 2. Make sure Docker is installed

Check:

```bash
docker -v
docker compose version
```

### 3. Run the project

```bash
docker compose up
```

Then open:

```
http://localhost:3000
```

---

## 🗄️ Database initialization

* The schema is located in:

```
sql/schema.sql
```

* It is automatically executed **only on first container startup**

If you want to reset the database:

```bash
docker compose down -v
docker compose up
```

---

## 🔑 How “users” work (no authentication)

This app uses a **very basic anonymous identity system**:

* When a user visits:

  * backend generates a random token
  * token is stored in a cookie
* That token is linked to a row in the `users` table
* All actions (posting, reacting) are tied to that user

### Limitations (important)

* clearing cookies = new identity
* using another browser = new identity
* users can fake requests if they try hard enough

This is intentional for simplicity.

---

## 🐳 Services (Docker)

The app runs two services:

### 1. `mariadb`

* database
* persistent volume for data

### 2. `next_app`

* Next.js application
* connects to MariaDB via service name (`mariadb`)

---

## 🌍 Deploying to a VPS (high-level)

This is what students should practice:

1. Get a VPS (Ubuntu recommended)
2. Install Docker + Docker Compose
3. Clone this repo on the server
4. Run:

```bash
docker compose up -d
```

5. Open your server IP in a browser

---

## ⚠️ What’s missing for real deployment

If this were a real project, you would need to add:

* proper environment configs
* database backups
* logging and monitoring
* rate limiting
* authentication
* input validation & security protections

---

## 🧠 Suggested student exercises

If you want to go further, try:

* add pagination to the feed
* allow editing display name
* add delete opinion
* add rate limiting (basic)
* convert dev setup to production Docker build

---

## Final note

This repo is intentionally **imperfect**.

Don’t treat it as a template for real-world systems.
Treat it as a **sandbox to understand how things connect together**.

Once you understand this, you can start building things properly.
