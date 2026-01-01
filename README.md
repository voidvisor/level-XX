# LEVEL XX // CLASSIFIED

**SECURE MISSION INTERFACE**

Level XX is a real-time, interactive mission control interface designed for coordinating agent activities. It features a secure PWA (Progressive Web App) for agents and a comprehensive Admin Dashboard for mission control.

![Status](https://img.shields.io/badge/STATUS-CLASSIFIED-red) ![Tech](https://img.shields.io/badge/TECH-NEXT.JS-black)

## 🚀 Features

### for AGENTS
*   **Secure Authentication**: Unique agent IDs accessed via QR codes or dynamic links.
*   **Real-time Updates**: Instant mission status changes without refreshing.
*   **Progressive Web App (PWA)**: Installable on iOS (via Safari Share) and Android for a native app experience.
*   **Push Notifications**: Secure alerts for mission-critical updates ("Safe House Located", "Ops Center Active").
*   **Interactive Modules**:
    *   RSVP & Transport Status.
    *   Tactical Voting Systems (Simulation Selection, Pizza Logistics).
    *   Mission Debrief & Recap Video.

### for MISSION CONTROL (Admin)
*   **Command Center**: Real-time dashboard to monitor all agent statuses.
*   **Stage Control**: Manually advance the mission through 4 stages:
    *   *Stage 0*: Awaiting Signal (RSVP).
    *   *Stage 1*: Safe House Located (Coordinates).
    *   *Stage 2*: Ops Center Active (Voting/Interactive).
    *   *Stage 3*: Mission Accomplished (Debrief).
*   **Agent Management**: Create, delete, and monitor agent connections.
*   **Broadcast System**: Send custom push notifications to all deployed field agents.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
*   **Database**: MariaDB (via [Prisma ORM](https://www.prisma.io/))
*   **Styling**: Tailwind CSS
*   **Deployment**: Docker & Docker Compose
*   **Notifications**: Web Push API (VAPID)

## 📦 Deployment (Docker)

The securest way to deploy the interface is via the provided Docker container.

### Prerequisites
*   Docker & Docker Compose
*   MariaDB installed on the host server

### Quick Start
1.  **Configure Environment**:
    Ensure the `.env` file and `docker-compose.yml` are configured with the correct VAPID keys and Database credentials.

2.  **Deploy**:
    ```bash
    docker-compose -H "ssh://user@host" up --build -d
    ```

3.  **Access**:
    *   **User Interface**: `https://your-domain.com` (Requires HTTPS for PWA/Push)
    *   **Admin Panel**: `https://your-domain.com/admin`

## 🔧 Local Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create a `.env` file with the following:
    ```env
    DATABASE_URL="mysql://user:password@localhost:3306/mission_control"
    DATABASE_HOST="localhost"
    DATABASE_USER="user"
    DATABASE_PASSWORD="password"
    DATABASE_NAME="mission_control"
    NEXT_PUBLIC_VAPID_PUBLIC_KEY="your_public_key"
    VAPID_PRIVATE_KEY="your_private_key"
    ADMIN_PIN="123456"
    NEXT_PUBLIC_BASE_URL="http://localhost:3000"
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📱 Mobile Installation Guide

### iOS (iPhone)
1.  Open the secure link in **Safari**.
2.  Tap the **Share** button (Square with arrow).
3.  Scroll down and tap **"Add to Home Screen"**.
4.  Launch "LEVEL XX" from your home screen to enable Push Notifications.

### Android
1.  Open the secure link in **Chrome**.
2.  Tap the **"INITIALIZE INSTALLATION"** button at the bottom of the screen.
3.  Follow the native prompts to install.

## 🔒 Security

*   **Admin Access**: Protected by a 6-digit numeric PIN.
*   **Agent Access**: Token-based URL authentication.

---
*AUTHORIZED PERSONNEL ONLY. UNAUTHORIZED ACCESS WILL BE LOGGED.*

(tldr - this is a project I made for my birthday, it's not production ready, but it works)