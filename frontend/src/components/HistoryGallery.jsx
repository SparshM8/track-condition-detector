import { useEffect, useState } from "react";
import { getHistory, clearHistory } from "../api.js";
import { extractErrorMessage } from "../utils/text.js";
import ConditionBadge from "./ConditionBadge.jsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Triggers a browser download for any text content (used by CSV + JSON export).
function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toCSV(readings) {
  const headers = ["Timestamp", "Label", "Confidence", "Wetness Index", "Weather", "Source", "Reasoning"];
  const rows = readings.map((r) => [
    new Date(r.timestamp).toISOString(),
    r.label,
    r.confidence,
    r.wetnessIndex,
    r.weather || "",
    r.source || "",
    (r.reasoning || "").replace(/"/g, '""'), // escape quotes for CSV safety
  ]);

  const escapeCell = (cell) => {
    const str = String(cell);
    // wrap in quotes if the value contains a comma, quote, or newline
    return /[",\n]/.test(str) ? `"${str}"` : str;
  };

  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return lines.join("\n");
}

function toPDF(readings) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Weather Whiplash — Track Condition History", 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`Exported ${new Date().toLocaleString()} · ${readings.length} readings`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [["Timestamp", "Label", "Confidence", "Wetness", "Weather", "Source"]],
    body: readings.map((r) => [
      new Date(r.timestamp).toLocaleString(),
      r.label,
      `${Math.round((r.confidence || 0) * 100)}%`,
      r.wetnessIndex,
      r.weather || "—",
      r.source || "—",
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [200, 30, 40] }, // matches the app's red accent
  });

  doc.save(`track-history-${Date.now()}.pdf`);
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
      setError(extractErrorMessage(err, "Failed to load history"));
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
      setError(extractErrorMessage(err, "Failed to clear history"));
    } finally {
      setClearing(false);
    }
  }

  function handleExportJSON() {
    downloadTextFile(
      `track-history-${Date.now()}.json`,
      JSON.stringify(readings, null, 2),
      "application/json"
    );
  }

  function handleExportCSV() {
    downloadTextFile(`track-history-${Date.now()}.csv`, toCSV(readings), "text/csv");
  }

  function handleExportPDF() {
    toPDF(readings);
  }

  return (
    <div className="card">
      <div className="history-section-head">
        <div className="card-title" style={{ marginBottom: 0 }}>
          History ({readings.length} readings)
        </div>
        {readings.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="secondary" onClick={handleExportJSON}>
              Export JSON
            </button>
            <button className="secondary" onClick={handleExportCSV}>
              Export CSV
            </button>
            <button className="secondary" onClick={handleExportPDF}>
              Export PDF
            </button>
            <button
              className="danger"
              onClick={() => setConfirmOpen(true)}
              disabled={clearing}
            >
              {clearing ? "Clearing..." : "Clear history"}
            </button>
          </div>
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
