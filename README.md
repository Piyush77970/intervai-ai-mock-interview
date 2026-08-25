# IntervAI — AI Mock Interview & Career Preparation Platform

IntervAI is a production-quality, carrier-grade mock interview and career preparation platform designed to help candidates practice interviews, receive structured feedback, analyze resumes, match job postings, and refine coding skills.

The system is styled with a sleek, premium, professional design that communicates a **"serious career preparation platform that happens to use AI"** (avoiding glowing purple blobs, futuristic robots, and flashy AI landing page templates).

---

## 🚀 Quick Start (Zero Setup Running)

Follow these simple steps to launch the frontend development server and the backend API server concurrently.

### Prerequisites
- Node.js (v18+)

### Step 1: Install Dependencies
Install all modules for the root orchestrator, the backend Express server, and the React Vite client:
```bash
npm run install:all
```
*(Uses `--legacy-peer-deps` for React 19 / Lucide dependency resolutions).*

### Step 2: Initialize & Seed the Database
Generate the SQLite database (`server/database/intervai.db`) and populate all 24 normalized tables with rich mock portfolios, questions, logs, and roadmaps:
```bash
node server/database/init.js
```

### Step 3: Run the Development Servers
Launch both the backend API (port `5000`) and the Vite client (port `5173`) concurrently:
```bash
npm run dev
```
Open **`http://localhost:5173`** in your browser to start practicing!

---

## 🔑 Demo Account Credentials

You can test all user viewpoints out-of-the-box. Log in with the following default credentials (all accounts share the same password):

* **Password for all accounts:** `password123`

| Role | Email | Purpose |
| :--- | :--- | :--- |
| **Candidate** | `aditya@example.com` | Complete text/voice/video interviews, solve coding tests, edit profile details, upload resumes, and checkout paid memberships. |
| **Recruiter** | `sarah.hr@google.com` | Create job descriptions, manage candidates, and view completed scorecards. |
| **Super Admin**| `admin@intervai.com` | Track system metrics, view billing statements, manage questions, and swap roles. |

> [!TIP]
> **Testing Role Switcher (Best for Grading & Demos)**
> If you log in as the **Admin** (`admin@intervai.com`), you will see a list of users on the dashboard with a **"Toggle Test Role"** button next to each account. 
> Clicking this button cycles the user's role: `Candidate -> Recruiter -> Admin`. This lets you swap viewpoints instantly for testing without logging in and out!

---

## 🛠️ Key Feature Guides

### 1. Dual AI Engine
- **Simulated NLP Mode (Default)**: Evaluates response lengths, looks for industry-specific terminology (e.g., *Eden space*, *abstract constructor*, *GC roots* for Java), and checks STAR structure coverage for behavioral questions. Requires **no API keys** to run.
- **Dynamic LLM Mode**: Provide a `GEMINI_API_KEY` in the `server/.env` file to trigger real, dynamic content generation and evaluations.

### 2. Resume & Job Analyzer
- Navigate to the **Resume Analyzer** tab.
- Upload a resume file (or text) to calculate ATS compatibility matching scores and missing industry terms.
- Paste a target job description to match skills and click **"Create Practice Interview From This Job"** to instantly spin up custom practice questions.

### 3. Coding Challenge Sandbox
- Select the **Coding Practice** tab and choose a challenge (e.g., *Binary Search* or *Reverse String*).
- Select your programming language (JavaScript, Python, Java, C++).
- Implement your solution and click **"Run & Submit Code"** to check compilation, run test cases, and analyze Big-O complexity bounds.

### 4. Billing Checkout & Invoices
- Select the **Billing & Plans** tab.
- Choose to upgrade to **Pro** or **Premium** memberships.
- In the checkout overlay, enter the code **`WELCOME50`** to apply a 50% discount.
- Complete the mockup checkout to view active subscription parameters and download standard **GST tax invoice statements**.

---

## 📁 Repository Structure

```text
d:\interview\
├── client\                  # React SPA (Vite)
│   ├── public\              # Static images and icons
│   ├── src\
│   │   ├── components\      # Modular UI buttons, selectors
│   │   ├── styles\          # Vanilla CSS Design System (index.css)
│   │   ├── views\           # Layout Routers (Landing, Auth, Candidate, Recruiter, Admin)
│   │   ├── App.jsx          # Route State Coordinator & Session manager
│   │   └── main.jsx         # App Mountpoint
│   └── vite.config.js       # Proxies /api requests to port 5000
├── server\                  # Express REST API Backend
│   ├── database\            # SQLite DB connector (db.js) and seeder (init.js)
│   ├── middleware\          # Authentication (auth.js)
│   ├── routes\              # API endpoints (Auth, Profiles, Resumes, Payments, Coding)
│   ├── services\            # Heuristics & LLM services (aiService.js)
│   ├── .env                 # Environment config (Port, JWT Secret, Gemini key)
│   └── index.js             # Server launcher
├── package.json             # Root monorepo script controller
└── README.md                # Running instructions
```
