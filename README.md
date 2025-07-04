# 🧠 FinsimkoTest — Fullstack Simulation App

This is a technical assessment project for a simulation game between two teams. It includes:

- ✅ Backend: CLI + Flask API (PostgreSQL)
- ✅ Frontend: React + Tailwind + Recharts
- ✅ Database: PostgreSQL
- ✅ Communication: Local API or direct CLI usage

---

## 📁 Project Structure

```
FinsimkoTest/
├── backend/
│   ├── cli_simulator.py              # CLI for Simulation Game 1
│   ├── backend_api_simulation.py    # Flask API
│   ├── db_init.sql                  # SQL schema
│   ├── .env                         # PostgreSQL connection settings
│   └── requirements.txt             # Backend dependencies
│
├── frontend/
│   ├── src/components/SimulationUI.tsx  # Main interface
│   ├── ... (React/Vite project)     # Vite + Tailwind + Recharts
│
└── README.md                        # Full project instructions
```

---

## 🚀 Setup Instructions

### 🔧 Backend (Python + PostgreSQL)

#### 1. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Configure PostgreSQL

- Create database:

```bash
createdb finsimco_db
```

- Apply schema:

```bash
psql -d finsimco_db -f db_init.sql
```

- Create `.env` in `/backend`:

```
PG_DBNAME=finsimco_db
PG_USER=postgres
PG_PASSWORD=your_password
PG_HOST=localhost
PG_PORT=5432
```

#### 3. Run CLI (local interaction)

```bash
python cli_simulator.py        # Game 1
python cli_simulator_2.py      # Game 2
```

#### 4. Run API for Frontend

```bash
python backend_api_simulation.py
```

API available at: `http://localhost:5000/api/state`

---

### 🎨 Frontend (React + Vite)

#### 1. Setup

```bash
cd frontend
npm install
```

Make sure Tailwind and Recharts are installed:

```bash
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install recharts shadcn-ui
```

#### 2. Run the frontend

```bash
npm run dev
```

Access UI at `http://localhost:5173`

---

## 🔁 Game Logic Overview

- Team 1 inputs values (EBITDA, Multiple, Factor Score)
- Team 2 approves each field (TBD / OK)
- Game completes when both teams approve all fields
- Valuation = EBITDA × Multiple × Factor Score

---

## 🧪 Testing

You can run both CLI and UI at the same time.
- CLI shows real-time agreement status
- Frontend reflects values and approval flags

---

## 🧠 Technologies Used

- React + Vite
- Tailwind CSS
- Flask API
- PostgreSQL
- psycopg2
- shadcn/ui
- Recharts

---

Author: [Your Name]
