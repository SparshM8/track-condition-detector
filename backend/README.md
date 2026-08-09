# Live Track Condition Detector

Classifies race track surface condition (Dry / Damp / Wet / Drying) from uploaded images,
tracks the trend over time, and suggests when a tire change window may be approaching.

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), Multer (uploads), Anthropic SDK (vision classification), Sharp (heuristic fallback)
- **Frontend**: React (Vite), Recharts, Axios

## How it works
1. You upload a track image (or weather info, optional).
2. The backend sends the image to Claude's vision API, which returns a label
   (Dry/Damp/Wet/Drying), a confidence score, and a one-line reasoning. If no API key is set
   or the call fails, it falls back to a local brightness-based heuristic (`utils/heuristic.js`).
3. Each reading is stored in MongoDB with a numeric `wetnessIndex` (Dry=0, Drying=1, Damp=2, Wet=3).
4. The trend endpoint computes a least-squares slope over the last N readings to determine if
   the track is drying, wetting, or stable, and generates a suggestion message.
5. The frontend polls the trend endpoint and displays the current condition, a live chart, and
   the suggestion banner.

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env: add your MONGODB_URI and ANTHROPIC_API_KEY
npm run dev
```
Backend runs on `http://localhost:5000`.

**MongoDB**: easiest option is a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas) —
create a cluster, get the connection string, paste it into `.env`. Local MongoDB also works if
you have it installed (`mongodb://localhost:27017/trackdb`).

**Anthropic API key**: get one from https://console.anthropic.com/. If you skip this, the app
still works using the local heuristic classifier — just less accurate.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (Vite proxies `/api` and `/uploads` to the backend).

## API endpoints
- `POST /api/analyze` — multipart form with `image` file (and optional `weather` text field). Returns the saved reading.
- `GET /api/trend` — last N readings + computed slope, trend direction, and suggestion.
- `GET /api/trend/history` — full reading history.
- `GET /api/health` — health check.

## Project structure
```
backend/
  models/Reading.js       - Mongoose schema
  routes/analyze.js       - POST /api/analyze
  routes/trend.js         - GET /api/trend, /api/trend/history
  utils/classify.js       - Anthropic vision API call
  utils/heuristic.js      - local brightness-based fallback classifier
  utils/trend.js          - slope calculation + suggestion rules
  server.js               - Express app entrypoint

frontend/
  src/components/UploadPanel.jsx   - image upload + preview + result
  src/components/ConditionBadge.jsx - colored condition label
  src/components/TrendChart.jsx    - Recharts line chart + suggestion banner
  src/App.jsx                      - polls /api/trend every 4s
  src/api.js                       - axios helpers
```

## Ideas to extend for the demo
- Feed a sequence of images quickly to show the trend line move in real time.
- Sample frames from a pre-recorded video (e.g. with `ffmpeg` before upload) to simulate a live camera feed.
- Add a second camera / location field to compare multiple track sections.
- Surface the AI's `reasoning` field prominently — it's a good way to show judges the model isn't a black box.
