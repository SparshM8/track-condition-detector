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
# create a .env file with your credentials (see .env format below)
# local development:
export MONGODB_URI="mongodb://localhost:27017/trackdb"
export ANTHROPIC_API_KEY="sk-ant-..."
npm run dev
```
Backend runs on `http://localhost:5000`.

**`.env` format** (create this file manually — it is gitignored and not committed):
```env
MONGODB_URI=mongodb://localhost:27017/trackdb
ANTHROPIC_API_KEY=sk-ant-...
PORT=5000
TREND_WINDOW=10
CLEAR_HISTORY_TOKEN=clear-history
```

**MongoDB**: easiest option is a free MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas) —
create a cluster, get the connection string, paste it into `.env`. Local MongoDB also works if
you have it installed (`mongodb://localhost:27017/trackdb`).

**Anthropic API key**: get one from https://console.anthropic.com/. If you skip this, the app
still works using the local heuristic classifier — just less accurate.

### Deployment (Vercel / GitHub)
Secrets are configured as **GitHub repository secrets** and injected at deploy time:

| Secret | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (e.g. MongoDB Atlas) |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI classification |
| `PORT` | Server port (default `5000`) |
| `TREND_WINDOW` | Number of recent readings used for trend math (default `10`) |
| `CLEAR_HISTORY_TOKEN` | Confirmation token for clearing history (default `clear-history`) |
| `UPLOADS_DIR` | Optional absolute path for upload storage. If unset, serverless uses `/tmp/...` automatically. |

When adding the secrets in GitHub, go to **Repository → Settings → Secrets and variables → Actions** and add them with the exact names above.

**Serverless storage note**: uploaded files are stored in a writable runtime directory.  
On Vercel/AWS Lambda, this defaults to `/tmp/track-condition-detector/uploads` unless `UPLOADS_DIR` is provided.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (Vite proxies `/api` and `/uploads` to the backend).

## API endpoints
- `GET /api/health` — health check.
- `POST /api/analyze` — multipart form with `image` file (and optional `weather` text field). Classifies the image (AI with heuristic fallback), stores the reading, and returns it.
- `POST /api/analyze-video` — multipart form with `video` file. Extracts frames (up to 15, sampled at 0.5 fps), classifies each one, and returns `{ framesProcessed, readings }`.
- `GET /api/trend` — last N readings + computed slope, trend direction, suggestion, and `latestLabel`.
- `GET /api/trend/history` — full reading history.
- `DELETE /api/trend/history` — clears **all** readings (irreversible). Requires a confirmation token in the JSON body: `{ "token": "<CLEAR_HISTORY_TOKEN>" }` — requests without a matching token are rejected with 400.
- `GET /uploads/<filename>` — static serving of uploaded images and video frames.

## Project structure
```
backend/
  models/Reading.js       - Mongoose schema
  routes/analyze.js       - POST /api/analyze
  routes/analyzeVideo.js  - POST /api/analyze-video (frame extraction + batch classification)
  routes/trend.js         - GET /api/trend, GET/DELETE /api/trend/history
  scripts/smokeTest.js    - offline smoke test (stubbed AI classifier, no DB needed)
  utils/classify.js       - Anthropic vision API call
  utils/heuristic.js      - local brightness-based fallback classifier
  utils/trend.js          - slope calculation + suggestion rules
  utils/videoFrames.js    - ffmpeg-based frame extraction
  server.js               - Express app entrypoint

frontend/
  src/components/UploadPanel.jsx     - image upload + preview + result
  src/components/VideoUploadPanel.jsx - video upload + progress + results
  src/components/LiveCameraPanel.jsx  - webcam capture → reuse of /api/analyze
  src/components/HistoryGallery.jsx   - full history + clear-history action
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
