import { cn } from "@/lib/utils";
import { formatTime } from "@/hooks/useChessClock";
import type { Player } from "@/hooks/useUltimateTicTacToe";
import { Clock, Pause, Play } from "lucide-react";

interface ChessClockProps {
  timeX: number;
  timeO: number;
  activePlayer: Player | null;
  currentPlayer: Player;
  paused?: boolean;
  onTogglePause?: () => void;
  showPause?: boolean;
}

export default function ChessClock({
  timeX,
  timeO,
  activePlayer,
  currentPlayer,
  paused,
  onTogglePause,
  showPause,
}: ChessClockProps) {
  const isLowX = timeX <= 10;
  const isLowO = timeO <= 10;
  const isCriticalX = timeX <= 5;
  const isCriticalO = timeO <= 5;

  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      {/* Player X timer */}
      <div
        className={cn(
          "flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 font-mono text-lg font-bold",
          activePlayer === "X" && !paused
            ? "border-player-x/60 bg-player-x/5 shadow-[0_0_15px_hsl(var(--player-x)/0.2)]"
            : "border-border bg-card",
          isLowX && "border-destructive/60",
          isCriticalX && "animate-pulse"
        )}
      >
        <span className={cn("font-[Orbitron] text-xs font-bold uppercase tracking-wider", activePlayer === "X" ? "text-player-x" : "text-muted-foreground")}>X</span>
        <span className={cn("tabular-nums", isLowX ? "text-destructive" : "text-foreground")}>{formatTime(timeX)}</span>
      </div>

      {/* Pause button */}
      {showPause && onTogglePause && (
        <button
          onClick={onTogglePause}
          className="p-2 rounded-lg border border-border bg-card hover:border-primary/40 hover:shadow-[0_0_10px_hsl(var(--primary)/0.15)] transition-all"
          title={paused ? "Retomar" : "Pausar"}
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>
      )}

      {!showPause && (
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
      )}

      {/* Player O timer */}
      <div
        className={cn(
          "flex-1 flex items-center justify-end gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300 font-mono text-lg font-bold",
          activePlayer === "O" && !paused
            ? "border-player-o/60 bg-player-o/5 shadow-[0_0_15px_hsl(var(--player-o)/0.2)]"
            : "border-border bg-card",
          isLowO && "border-destructive/60",
          isCriticalO && "animate-pulse"
        )}
      >
        <span className={cn("tabular-nums", isLowO ? "text-destructive" : "text-foreground")}>{formatTime(timeO)}</span>
        <span className={cn("font-[Orbitron] text-xs font-bold uppercase tracking-wider", activePlayer === "O" ? "text-player-o" : "text-muted-foreground")}>O</span>
      </div>
    </div>
  );
}
