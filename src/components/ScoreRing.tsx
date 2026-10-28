export default function ScoreRing({
  score,
  size = 116,
  label,
  tone = "forest",
}: {
  score: number;
  size?: number;
  label?: string;
  tone?: "forest" | "coral" | "lime";
}) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const dash = (clamped / 100) * circumference;
  const stroke = tone === "coral" ? "#D9553A" : tone === "lime" ? "#A9C93F" : "#1C6B54";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(22,33,28,0.09)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          style={{ transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl leading-none text-ink">{clamped}</span>
        {label ? (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
