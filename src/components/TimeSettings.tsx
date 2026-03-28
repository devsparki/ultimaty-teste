import { useState } from "react";
import { cn } from "@/lib/utils";
import { TIME_PRESETS, INCREMENT_OPTIONS, type TimeSettings as TS } from "@/hooks/useChessClock";
import { Clock, ArrowLeft, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface TimeSettingsProps {
  onStart: (totalSeconds: number, increment: number) => void;
  onBack: () => void;
}

export default function TimeSettingsComponent({ onStart, onBack }: TimeSettingsProps) {
  const [selectedTime, setSelectedTime] = useState(TIME_PRESETS[0].totalSeconds);
  const [useIncrement, setUseIncrement] = useState(false);
  const [increment, setIncrement] = useState(2);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="futuristic-bg" />

      <div className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-[Orbitron] text-xl font-bold text-foreground uppercase tracking-wider">Controle de Tempo</h2>
            <p className="text-sm text-muted-foreground">Escolha o tempo por jogador</p>
          </div>
        </div>

        {/* Time presets */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {TIME_PRESETS.map((preset) => (
            <button
              key={preset.totalSeconds}
              onClick={() => setSelectedTime(preset.totalSeconds)}
              className={cn(
                "neon-card p-4 text-center transition-all cursor-pointer",
                selectedTime === preset.totalSeconds
                  ? "border-primary/60 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                  : ""
              )}
            >
              <span className="font-[Orbitron] text-2xl font-bold text-foreground block">{preset.label}</span>
              <span className="text-xs text-muted-foreground">por jogador</span>
            </button>
          ))}
        </div>

        {/* Increment toggle */}
        <div className="neon-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span className="font-semibold text-foreground text-sm">Incremento por jogada</span>
            </div>
            <Switch checked={useIncrement} onCheckedChange={setUseIncrement} />
          </div>
          {useIncrement && (
            <div className="flex gap-2">
              {INCREMENT_OPTIONS.filter((v) => v > 0).map((v) => (
                <button
                  key={v}
                  onClick={() => setIncrement(v)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold transition-all font-[Orbitron]",
                    increment === v
                      ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsl(var(--primary)/0.3)]"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  )}
                >
                  +{v}s
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => onStart(selectedTime, useIncrement ? increment : 0)}
          className="neon-btn w-full text-base"
        >
          Iniciar Partida
        </button>
      </div>
    </div>
  );
}
