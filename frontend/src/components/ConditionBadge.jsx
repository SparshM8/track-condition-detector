export default function ConditionBadge({ label, confidence }) {
  if (!label) return null;

  const badgeClass = `badge badge-${label.toLowerCase()}`;

  return (
    <span className={badgeClass}>
      {label}
      {typeof confidence === "number" && (
        <span style={{ opacity: 0.7, fontWeight: 400 }}>
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
}
