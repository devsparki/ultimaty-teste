import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, Sparkles } from "lucide-react";

const UPDATE_DAY = 0;
const UPDATE_HOUR = 0;

function getNextUpdateDate(): Date {
  const now = new Date();
  const next = new Date(now);
  const daysUntil = (UPDATE_DAY - now.getDay() + 7) % 7;

  if (daysUntil === 0 && now.getHours() >= UPDATE_HOUR) {
    next.setDate(now.getDate() + 7);
  } else {
    next.setDate(now.getDate() + (daysUntil || 7));
  }

  next.setHours(UPDATE_HOUR, 0, 0, 0);
  return next;
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    total: diff,
  };
}

function isUpdateDay(): boolean {
  const now = new Date();
  return now.getDay() === UPDATE_DAY && now.getHours() < UPDATE_HOUR + 1;
}

export default function UpdateCountdown() {
  const [target, setTarget] = useState(getNextUpdateDate);
  const [time, setTime] = useState(() => getTimeLeft(target));

  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft(target);
      if (t.total <= 0) {
        setTarget(getNextUpdateDate());
      }
      setTime(t);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const urgent = time.days === 0 && time.hours < 1 && time.total > 0;
  const isLive = isUpdateDay() && time.total <= 3600000;

  if (isLive) {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary/10 border border-primary/30 neon-pulse">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-primary font-[Orbitron] uppercase tracking-wider">
          Nova atualização liberada! 🎉
        </span>
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
    );
  }

  const units = [
    { label: "d", value: time.days },
    { label: "h", value: time.hours },
    { label: "m", value: time.minutes },
    { label: "s", value: time.seconds },
  ];

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border transition-colors",
        urgent
          ? "bg-destructive/10 border-destructive/30"
          : "bg-card/50 border-border"
      )}
    >
      <Clock className={cn("w-4 h-4 shrink-0", urgent ? "text-destructive" : "text-muted-foreground")} />
      <span className={cn("text-xs font-medium", urgent ? "text-destructive" : "text-muted-foreground")}>
        Próxima atualização em
      </span>
      <div className="flex items-center gap-1.5">
        {units.map((u) => (
          <span
            key={u.label}
            className={cn(
              "tabular-nums font-[Orbitron] font-bold text-sm transition-colors",
              urgent ? "text-destructive" : "text-foreground"
            )}
          >
            {u.value}
            <span className="text-xs font-normal text-muted-foreground font-[Rajdhani]">{u.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
