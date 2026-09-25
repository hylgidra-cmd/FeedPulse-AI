# FeedPulse AI — Voice of Customer to Product Roadmap (B2B SaaS)

[![Frontend Deploy](https://img.shields.io/badge/Vercel-Frontend%20Live-black?style=flat&logo=vercel)](https://feed-pulse-ai.vercel.app)
[![Backend API](https://img.shields.io/badge/Render-API%20Live-46E3B7?style=flat&logo=render)](https://feedpulse-ai.onrender.com/docs)
[![Python](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![AI Engine](https://img.shields.io/badge/Groq-LLaMA%203.3-f55036?style=flat)](https://groq.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **FeedPulse AI** transforms messy, unstructured customer feedback from Apple App Store, Google Play, and CSV exports into prioritized, actionable engineering roadmaps and 1-Click Jira tasks using AI Semantic Clustering and Groq LPU acceleration.

---

## 🌟 Live Demo & Deployments

- 🖥️ **Live Web Application:** [feed-pulse-ai.vercel.app](https://feed-pulse-ai.vercel.app)
- ⚡ **Backend API Server:** [feedpulse-ai.onrender.com](https://feedpulse-ai.onrender.com)
- 📚 **Interactive Swagger API Docs:** [feedpulse-ai.onrender.com/docs](https://feedpulse-ai.onrender.com/docs)

---

## 🚀 Key Features

- **Multi-Source Ingestion**:
  - Drag-and-drop CSV upload with auto-detection of column headers (`content`, `review`, `rating`, `sentiment`).
  - **Live App Store Scraper**: Pull live customer reviews directly from the Apple App Store for any app ID (Telegram, Spotify, Duolingo, WhatsApp, etc.).
- **Smart Sentiment Analysis**:
  - Automatic classification of customer reviews into Positive, Neutral, and Negative categories.
  - Real-time sentiment distribution bar and metric cards.
- **AI Semantic Clustering**:
  - Embeds feedback and clusters recurring complaints using Agglomerative Clustering with cosine affinity and adaptive thresholding.
- **Groq LPU Summarizer (LLaMA 3.3 / GPT-OSS)**:
  - Generates concise problem titles, underlying root causes, and severity scores in seconds.
  - Multi-model fallback mechanism ensuring 99.9% uptime even during provider rate limits.
- **1-Click Engineering Hand-off**:
  - Generates ready-to-use Jira / Linear issue markdown with full User Acceptance Criteria (AC).
- **Exportable Business Reports**:
  - One-click export to Excel / CSV.
  - Printable official PDF executive summary for leadership and stakeholders.

---

## 🏗️ Architecture

```
[ Customer Reviews (CSV / App Store) ]
                 │
                 ▼
      [ FastAPI Backend (Render) ]
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
[ Scikit-Learn ]       [ Groq LPU ]
 Agglomerative          LLaMA 3.3 / GPT-OSS
 Clustering            Root Cause & Jira Gen
     │                       │
     └───────────┬───────────┘
                 ▼
       [ SQLite / PostgreSQL ]
                 │
                 ▼
      [ React 18 SPA (Vercel) ]
     Dashboard, Metrics & Jira Tickets
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: FastAPI, Python 3.11, SQLAlchemy, Pydantic v2, Uvicorn.
- **AI & ML**: Scikit-Learn (Agglomerative Clustering), Groq Cloud SDK (LLaMA 3.3 / GPT-OSS), Sentence embeddings.
- **Deployment**: Vercel (Frontend SPA + API Proxy Rewrites), Render (Containerized FastAPI Web Service).

---

## 💻 Local Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone repository
```bash
git clone https://github.com/hylgidra-cmd/FeedPulse-AI.git
cd FeedPulse-AI
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python -m venv backend/venv
backend\venv\Scripts\activate   # On Windows
source backend/venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend will be available at `http://127.0.0.1:8000` (Docs at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at `http://localhost:5173`.

---

## 📄 License

This project is licensed under the MIT License.