# Video Conferencing Platform (Zoom Clone)

A full-stack Zoom clone built as an SDE Fullstack Assignment — replicating Zoom's design, user experience, and core meeting workflows.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Python 3 · FastAPI · Uvicorn |
| Database | SQLite · SQLAlchemy ORM |
| Video Engine | VideoSDK.live (optional — falls back to Demo Mode) |

## Features

### Core
- **Landing Dashboard** — Zoom-accurate sidebar layout with Home / Meetings / History tabs, live clock, and quick-action tiles
- **Instant Meeting** — One-click meeting creation with a Zoom-style meeting ID (e.g. `892-573-401`), stored in the database
- **Join Meeting** — Join by Meeting ID or invite link; enter display name before joining; server-side validation
- **Schedule Meetings** — Form with Topic, Description, Date & Time picker, Duration; auto-generates invite link; shown in Upcoming section
- **Upcoming Meetings** — Full list with date cards, start button, copy-invite-link, delete
- **Recent Meetings** — History of completed meetings pulled from the database
- **Pre-Join Screen** — Camera preview, mic/webcam toggle before entering the room
- **In-Meeting** — Control bar (Mute, Video, Security, Participants, Chat, Share Screen, Polling, Reactions, Record), Speaker/Gallery view, side panels

### Bonus
- Responsive layout (mobile-friendly control bar via bottom sheet)
- Host controls: mute-all, remove participant, lock room, waiting room
- Picture-in-Picture support

## Database Schema

```
meetings
  id           TEXT  PRIMARY KEY   -- Zoom-style meeting ID (e.g. 892-573-401)
  title        TEXT  NOT NULL
  description  TEXT
  scheduled_at DATETIME            -- null for instant meetings
  duration     INTEGER             -- minutes
  created_at   DATETIME
  is_instant   BOOLEAN

recent_meetings
  id               TEXT PRIMARY KEY
  meeting_id       TEXT             -- references the original meeting ID
  title            TEXT
  host_name        TEXT
  ended_at         DATETIME
  duration_minutes INTEGER
```

## Assumptions

1. **No login required** — a default user "Alex Johnson" is assumed logged in. The display name can be customized on the pre-join screen.
2. **Demo Mode** — without a VideoSDK API token the app runs a fully interactive local demo (mock participants, chat, controls). Real multi-device video requires a free token from [videosdk.live](https://videosdk.live).
3. **Sample data** — the database is pre-seeded with upcoming and recent meetings (see `backend/seed.py`).

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install fastapi uvicorn sqlalchemy pydantic pydantic-settings python-dotenv

# Seed the database with sample data
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install

# (Optional) For real video calls, add your VideoSDK token:
# Create frontend/.env.local and add:
# NEXT_PUBLIC_VIDEOSDK_TOKEN=your_token_here

npm run dev
```

Open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/meetings/instant` | Create an instant meeting |
| POST | `/api/meetings/schedule` | Schedule a meeting |
| GET | `/api/meetings/upcoming` | List upcoming scheduled meetings |
| GET | `/api/meetings/recent` | List recent completed meetings |
| GET | `/api/meetings/{id}` | Validate / get a meeting by ID |
| POST | `/api/meetings/{id}/end` | Record a completed meeting |
| DELETE | `/api/meetings/{id}` | Delete a scheduled meeting |

## Deployment

- **Frontend**: Push `frontend/` to Vercel — zero config required.
- **Backend**: Deploy `backend/` to Render or Railway using `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- Update `NEXT_PUBLIC_API_BASE` in frontend env vars to point to the deployed backend URL.
