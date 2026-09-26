<div align="center">
  <h1>FootyVision Analytics Platform</h1>
  <p>Production-grade Computer Vision Football Analytics Platform built on top of Roboflow Sports.</p>
</div>

## 🚀 Overview

This repository contains the complete Football AI Analytics Platform. It combines a state-of-the-art computer vision pipeline (YOLOv8 + ByteTrack + SigLIP) with a modern FastAPI backend and a premium Next.js frontend dashboard.

The platform automatically processes football match videos, tracks players and the ball, extracts tactical events, generates 2D radar projections using homography, and presents the intelligence in a beautiful interactive UI.

## 🏗️ Architecture

- **Machine Learning**: `examples/soccer` (YOLOv8, ByteTrack, SigLIP, Supervision)
- **Backend**: FastAPI, SQLAlchemy, SQLite (`backend/`)
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons (`frontend/`)

## 💻 Setup Guide

Follow these steps to run the platform locally on your machine.

### 1. Prerequisites

Ensure you have the following installed:
- Python 3.8+
- Node.js 18+
- npm (comes with Node.js)

### 2. Backend Setup (FastAPI & ML Pipeline)

Open a terminal and navigate to the project root:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the FastAPI development server
# Important: PYTHONPATH must include the root directory so the ML models resolve correctly
PYTHONPATH=.. uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The API will now be running at `http://localhost:8000`.

### 3. Frontend Setup (Next.js Dashboard)

Open a **new** terminal and navigate to the project root:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node.js dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```
The Frontend Dashboard will now be running at `http://localhost:3000`.

### 4. Usage

1. Open `http://localhost:3000/dashboard` in your browser (Safari, Chrome, etc.).
2. Click **Upload & Analyze** in the sidebar.
3. Select an MP4 video of a football match.
4. The video will be uploaded and the ML pipeline will begin processing in the background. You can track progress in real-time.
5. Once completed, explore the 2D Tactical Radar, Player Speeds, and Match Events!

---

## ⚽ Roboflow Sports Base Project

*This platform is built upon the open-source `sports` repository.*

In sports, every centimeter and every second matter. That's why Roboflow decided to use sports as a testing ground to push our object detection, image segmentation, keypoint detection, and foundational models to their limits. 

- **Ball tracking:** Tracking the ball is extremely difficult due to its small size and rapid movements, especially in high-resolution videos.
- **Reading jersey numbers:** Accurately reading player jersey numbers is often hampered by blurry videos, players turning away, or other objects obscuring the numbers.
- **Player tracking:** Maintaining consistent player identification throughout a game is a challenge due to frequent occlusions caused by other players or objects on the field.
- **Camera calibration:** Accurately calibrating camera views is crucial for extracting advanced statistics like player speed and distance traveled.
