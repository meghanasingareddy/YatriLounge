# YatriLounge — Intelligent Airport Lounge Peak-Hour Predictor

> **What is YatriLounge?**
> It's an ML-based system that predicts how crowded an airport lounge will be in the next 6 hours. It then recommends exactly how many staff to deploy and how much food/drinks to prepare — reducing waste and improving guest experience.

---

## Problem Statement

Airport lounges often face **unpredictable crowd surges** that lead to:
- Understaffed counters during peak hours
- Over-prepared food that goes to waste during quiet hours
- Poor guest experience when lounges are overcrowded

**YatriLounge solves this** by using machine learning on flight schedules and historical lounge data to **forecast crowd levels 6 hours ahead** and automatically recommend staffing and food quantities.

---

## Key Objectives

| # | Objective | How YatriLounge Achieves It |
|---|-----------|---------------------------|
| 1 | Predict lounge crowd levels accurately | Gradient Boosting ML model trained on flight + lounge data |
| 2 | Optimize staffing for peak hours | Automatic staff recommendations (2-8 staff based on crowd) |
| 3 | Reduce food waste through better planning | Menu optimizer calculates exact snack/beverage quantities |
| 4 | Improve guest experience | 6-hour forecasting prevents overcrowding before it happens |

---

## Requirements

| Category | Requirement | Status |
|----------|------------|--------|
| Data | Flight schedule data integration (CSV upload) | Done |
| ML | Time-series forecasting model (Gradient Boosting) | Done |
| Logic | Staffing recommendation engine | Done |
| Logic | Menu quantity optimization (60/40 split + buffer) | Done |

---

## Deliverables

| # | Deliverable | Description |
|---|------------|-------------|
| 1 | Peak-hour prediction agent | ML model that forecasts lounge crowd for the next 6 hours |
| 2 | 6-hour forecast dashboard | Interactive React dashboard with Plotly charts, staffing tables, and menu cards |
| 3 | Staffing recommendation report | Auto-generated staffing plan + downloadable PDF report |
| 4 | Historical data analysis | Patterns across 30 days of flight and lounge data with model evaluation metrics (MAE/RMSE) |

---

## How It Works

```
Step 1: Upload Data
   You provide two CSV files:
   - Flight schedule (when flights arrive, how many passengers)
   - Lounge entry history (how many people entered the lounge each hour)

Step 2: AI Learns Patterns
   The system analyzes patterns like:
   - "8 AM is always busy because of morning flights"
   - "Weekends have 30% more lounge visitors"
   - "When 3 flights arrive at once, the lounge fills up"

Step 3: Predict and Recommend
   For the next 6 hours, it predicts:
   - How many people will be in the lounge
   - How many staff you need
   - How many snacks/beverages to prepare

Step 4: What-If Scenarios
   Ask "What if a new flight with 300 passengers arrives at 3 PM?"
   and instantly see how it changes the prediction.
```

---

## Features

| Feature | What It Does |
|---------|--------------|
| CSV Upload | Drag-and-drop upload of flight schedule and lounge entry data |
| ML Prediction | Forecasts crowd levels for the next 6 hours using Gradient Boosting |
| Interactive Chart | Line chart showing predicted crowd with peak hour highlighted |
| Model Metrics | Shows MAE and RMSE so you know how accurate the model is |
| Staffing Planner | Recommends 2-8 staff based on predicted crowd size |
| Menu Optimizer | Calculates exact snack (60%) and beverage (40%) units + 10% buffer |
| What-If Simulator | Add a hypothetical flight and instantly see the impact on predictions |
| Custom Forecast Time | Pick any date and time to see the 6-hour forecast for that period |
| Date Range Filter | Filter historical analysis by specific date ranges |
| Auto-Refresh | Dashboard updates every 60 seconds with fresh predictions |
| PDF Export | Download a styled prediction report for management |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React + Vite | Modern dashboard UI |
| Charts | Plotly.js | Interactive prediction charts |
| Backend | FastAPI (Python) | REST API server |
| ML Model | Scikit-learn (Gradient Boosting) | Crowd prediction |
| Database | SQLite (via SQLAlchemy) | Store uploaded data |
| PDF | ReportLab | Generate downloadable reports |

---

## Quick Start

### Prerequisites
- **Python 3.9+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)

### Step 1: Clone the Project
```bash
git clone https://github.com/meghanasingareddy/YatriLounge.git
cd YatriLounge
```

### Step 2: Start the Backend
```bash
cd backend
pip install -r requirements.txt
python scripts/generate_sample_data.py
uvicorn app.main:app --reload --port 8000
```
You should see: `Uvicorn running on http://127.0.0.1:8000`

### Step 3: Start the Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
You should see: `Local: http://localhost:5173/`

### Step 4: Use the Dashboard
1. Open **http://localhost:5173** in your browser
2. Upload `backend/data/flight_schedule.csv` in the Flight Schedule box
3. Upload `backend/data/lounge_entries.csv` in the Lounge Entries box
4. Click **Train & Predict**
5. Explore the dashboard

---

## Project Structure

```
YatriLounge/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server entry point
│   │   ├── config.py                # All settings and constants
│   │   ├── database.py              # SQLite database setup
│   │   ├── models.py                # Database table definitions
│   │   ├── schemas.py               # API data validation schemas
│   │   ├── routers/                 # API endpoint handlers
│   │   │   ├── data_ingestion.py    #   CSV upload endpoints
│   │   │   ├── predictions.py       #   Train and forecast endpoints
│   │   │   ├── recommendations.py   #   Staffing and menu endpoints
│   │   │   ├── simulation.py        #   What-if and PDF export
│   │   │   └── analysis.py          #   Historical data analysis
│   │   └── services/                # Business logic
│   │       ├── feature_engineering.py  # Extract ML features from data
│   │       ├── prediction_engine.py    # Train model and make predictions
│   │       ├── staffing.py             # Staff recommendation rules
│   │       ├── menu_optimizer.py       # Food/beverage calculations
│   │       ├── historical_analysis.py  # Historical trends and stats
│   │       └── pdf_export.py           # Generate PDF reports
│   ├── scripts/
│   │   └── generate_sample_data.py  # Creates sample CSV datasets
│   ├── data/                        # Generated/uploaded CSV files
│   ├── models/                      # Saved trained ML models
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main dashboard layout
│   │   ├── index.css                # Design system (light theme)
│   │   ├── components/
│   │   │   ├── Header.jsx           # Top bar with branding and actions
│   │   │   ├── FileUpload.jsx       # Drag-and-drop CSV uploader
│   │   │   ├── PredictionChart.jsx  # Plotly 6-hour forecast chart
│   │   │   ├── MetricsPanel.jsx     # MAE/RMSE stat cards
│   │   │   ├── StaffingTable.jsx    # Staffing recommendations table
│   │   │   ├── MenuCards.jsx        # Food/beverage quantity cards
│   │   │   ├── WhatIfSimulator.jsx  # Add-a-flight simulation form
│   │   │   └── HistoricalAnalysis.jsx # Historical data analysis
│   │   └── services/
│   │       └── api.js               # Axios API client
│   └── package.json                 # JavaScript dependencies
└── README.md
```

---

## About the Sample Datasets

The project includes a **sample data generator** that creates realistic data for testing.

**Date Range:** February 1, 2026 to March 2, 2026 (30 days)

### flight_schedule.csv (1,018 rows)

| Column | Example | Description |
|--------|---------|-------------|
| `arrival_time` | `2026-02-01 07:47:00` | When the flight lands |
| `departure_time` | `2026-02-01 09:20:00` | When it departs (1-3 hrs later) |
| `airline` | `Vistara` | One of 10 airlines |
| `passenger_count` | `174` | Passengers on board (30-350) |

Pattern: More flights during 6-10 AM and 5-9 PM (realistic peak hours). Weekends have more flights.

### lounge_entries.csv (720 rows)

| Column | Example | Description |
|--------|---------|-------------|
| `timestamp` | `2026-02-01 08:00:00` | Hourly timestamp |
| `entries_per_hour` | `257` | People who entered the lounge |

Pattern: About 15-25% of arriving passengers use the lounge. Entries are correlated with flight arrivals.

---

## How the ML Model Works

### Features (What the model learns from)
| Feature | What It Captures |
|---------|-----------------|
| `hour_of_day` (0-23) | Daily patterns (mornings are busy) |
| `day_of_week` (0-6) | Weekly patterns (weekends differ) |
| `is_weekend` (0/1) | Weekend vs weekday flag |
| `rolling_avg_3h` | Recent trend (last 3 hours average) |
| `total_expected_passengers` | Upcoming flight arrivals this hour |

### Model Specifications
| Parameter | Value |
|-----------|-------|
| Algorithm | Gradient Boosting Regressor |
| Estimators | 200 trees |
| Max Depth | 5 |
| Learning Rate | 0.1 |
| Train/Test Split | 80/20 |

### Evaluation
The model reports **MAE** (Mean Absolute Error) and **RMSE** (Root Mean Square Error) — lower is better.

---

## API Reference

All endpoints are available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

| Method | Endpoint | What It Does |
|--------|----------|-------------|
| `POST` | `/api/upload/flights` | Upload flight schedule CSV |
| `POST` | `/api/upload/lounge-entries` | Upload lounge entry CSV |
| `POST` | `/api/predict/train` | Train the ML model |
| `GET` | `/api/predict/forecast` | Get 6-hour crowd prediction (optional: `?start_time=`) |
| `GET` | `/api/predict/metrics` | Get MAE and RMSE scores |
| `GET` | `/api/recommendations/staffing` | Get staffing plan |
| `GET` | `/api/recommendations/menu` | Get food/beverage quantities |
| `POST` | `/api/simulate/add-flight` | What-if: add a flight |
| `GET` | `/api/export/pdf` | Download PDF report |
| `GET` | `/api/analysis/historical` | Get historical analysis (optional: `?start_date=&end_date=`) |

---

## Staffing Rules

| Predicted Crowd | Staff Recommended | Level |
|----------------|-------------------|-------|
| 0 - 50 | 2 staff | Low |
| 50 - 100 | 4 staff | Medium |
| 100 - 200 | 6 staff | High |
| 200+ | 8 staff | Peak |

## Menu Optimization Formula

```
For each predicted hour:
  Snack units    = predicted_crowd x 60% x 1.10 (buffer)
  Beverage units = predicted_crowd x 40% x 1.10 (buffer)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `pip install` fails with "Access denied" | Run terminal as Administrator, or use `pip install --user -r requirements.txt` |
| `ModuleNotFoundError: reportlab` | Run `pip install reportlab`. App works without it (only PDF export is affected) |
| Frontend shows "Upload failed" | Make sure the backend is running on port 8000 first |
| `ECONNREFUSED` in frontend | Backend isn't running. Start it with `uvicorn app.main:app --reload --port 8000` |

---

## License

MIT — free to use, modify, and distribute.

---

<p align="center">
  Built for smarter airport lounge management
</p>
