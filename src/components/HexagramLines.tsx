"use client";

interface Line {
  isYang: boolean;
  label?: string;
}

interface HexagramLinesProps {
  lines: Line[];
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

export default function HexagramLines({ lines, compact, title, subtitle }: HexagramLinesProps) {
  const display = [...lines].reverse();
  const barH = compact ? "h-1.5" : "h-2";
  const yangW = compact ? "w-16" : "w-20";
  const yinW = compact ? "w-6" : "w-8";
  const gap = compact ? "gap-1.5" : "gap-2";

  return (
    <div className={`flex flex-col items-center ${compact ? "gap-1.5 py-3" : "gap-2 py-4"}`}>
      {display.map((line, i) => (
        <div key={i} className={`flex items-center ${compact ? "gap-2" : "gap-3"}`}>
          <span className={`${compact ? "w-6 text-[9px]" : "w-8 text-[10px]"} text-app-muted text-right`}>
            {6 - i}爻
          </span>
          <div className={`flex ${compact ? "w-20" : "w-24"} justify-center gap-1`}>
            {line.isYang ? (
              <div className={`${barH} ${yangW} rounded bg-app-gold${compact ? "/80" : ""}`} />
            ) : (
              <>
                <div className={`${barH} ${yinW} rounded bg-app-gold${compact ? "/80" : ""}`} />
                <div className={`${barH} ${yinW} rounded bg-app-gold${compact ? "/80" : ""}`} />
              </>
            )}
          </div>
          {line.label && (
            <span className={`${compact ? "w-8 text-[9px]" : "w-10 text-[10px]"} text-app-muted`}>{line.label}</span>
          )}
        </div>
      ))}
      {title && <p className={`mt-2 font-bold text-app-gold ${compact ? "text-sm" : "text-lg"}`}>{title}</p>}
      {subtitle && <p className="text-xs text-app-muted">{subtitle}</p>}
    </div>
  );
}
