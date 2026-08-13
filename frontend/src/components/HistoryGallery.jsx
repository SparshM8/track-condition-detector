import { useEffect, useState } from "react";
import { getHistory, clearHistory } from "../api.js";
import ConditionBadge from "./ConditionBadge.jsx";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryGallery() {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory();
      setReadings([...data].reverse());
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleClear() {
    setClearing(true);
    setError(null);
    try {
      const result = await clearHistory();
      setReadings([]);
      setConfirmOpen(false);
      console.log(`Cleared ${result.deletedCount} readings`);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setClearing(false);
    }
  }

  return (
    <div className="card">
      <div className="history-section-head">
        <div className="card-title" style={{ marginBottom: 0 }}>
          History ({readings.length} readings)
        </div>
        {readings.length > 0 && (
          <button
            className="danger"
            onClick={() => setConfirmOpen(true)}
            disabled={clearing}
          >
            {clearing ? "Clearing..." : "Clear history"}
          </button>
        )}
      </div>

      {error && <div className="error-text">{error}</div>}

      {loading ? (
        <p className="empty-state" style={{ marginTop: 18 }}>Loading past readings...</p>
      ) : readings.length === 0 ? (
        <p className="empty-state" style={{ marginTop: 18 }}>
          No readings yet — analyze an image to get started.
        </p>
      ) : (
        <div className="history-grid">
          {readings.map((r) => (
            <div className="history-item" key={r._id}>
              <img src={r.imageUrl} alt={r.label} className="history-thumb" />
              <div className="history-item-body">
                <ConditionBadge label={r.label} confidence={r.confidence} />
                <div className="history-time">
                  {formatTime(r.timestamp)}
                  {r.weather ? ` · ${r.weather}` : ""}
                  {r.source ? ` · ${r.source}` : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmOpen && (
        <div className="modal-backdrop" onClick={() => setConfirmOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear all history?</h3>
            <p>
              This permanently deletes all {readings.length} past readings from the
              database. This action cannot be undone.
            </p>
            <div className="modal-row">
              <button className="secondary" onClick={() => setConfirmOpen(false)}>
                Cancel
              </button>
              <button className="danger" onClick={handleClear} disabled={clearing}>
                {clearing ? "Clearing..." : "Yes, clear everything"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
