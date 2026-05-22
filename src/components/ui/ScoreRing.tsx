import { cn } from "@/lib/utils";

interface ScoreRingProps {
  /** ציון 0-100. */
  score: number;
  size?: number;
  /** מציג תווית "ציון" מתחת למספר. */
  label?: boolean;
}

/** טבעת ניקוד עדיפות — צבע משתנה לפי הציון. */
export function ScoreRing({ score, size = 56, label }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 75 ? "#ec4899" : clamped >= 50 ? "#a855f7" : clamped >= 33 ? "#fb923c" : "#7c7b91";

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      title={`ציון עדיפות: ${clamped}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={5}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("font-display font-bold leading-none")}
          style={{ color, fontSize: size * 0.3 }}
        >
          {clamped}
        </span>
        {label && (
          <span className="mt-0.5 text-[8px] text-ink-mute">ציון</span>
        )}
      </div>
    </div>
  );
}
