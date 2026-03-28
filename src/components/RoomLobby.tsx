import { useState } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, Users, ArrowLeft, LogIn } from "lucide-react";

interface RoomLobbyProps {
  roomCode: string;
  playersInRoom: number;
  myRole: "X" | "O" | null;
  roomStatus: string;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  timeLabel?: string;
}

export default function RoomLobby({
  roomCode,
  playersInRoom,
  myRole,
  roomStatus,
  onCreateRoom,
  onJoinRoom,
  onBack,
  timeLabel,
}: RoomLobbyProps) {
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const inRoom = !!roomCode;

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (inRoom && roomStatus === "waiting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <div className="futuristic-bg" />
        <div className="w-full max-w-md relative z-10">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="neon-card p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-[Orbitron] text-xl font-bold text-foreground mb-2 uppercase tracking-wider">Sala Criada</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Compartilhe o código com seu oponente
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="font-[Orbitron] text-3xl font-black tracking-[0.3em] text-primary neon-text">
                {roomCode}
              </span>
              <button
                onClick={copyCode}
                className="p-2 rounded-lg border border-border hover:border-primary/40 hover:shadow-[0_0_10px_hsl(var(--primary)/0.15)] transition-all"
                title="Copiar código"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
              </button>
            </div>

            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_hsl(120_100%_50%/0.5)]" />
                <span className="text-foreground font-medium">Você ({myRole})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-2.5 h-2.5 rounded-full animate-pulse", playersInRoom >= 2 ? "bg-green-400 shadow-[0_0_6px_hsl(120_100%_50%/0.5)]" : "bg-muted-foreground/40")} />
                <span className="text-muted-foreground">
                  {playersInRoom >= 2 ? "Oponente conectado" : "Aguardando oponente..."}
                </span>
              </div>
            </div>
            {timeLabel && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-medium text-muted-foreground">
                ⏱ Tempo: <span className="font-[Orbitron] text-foreground">{timeLabel}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      <div className="futuristic-bg" />
      <div className="w-full max-w-md relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>

        <h2 className="font-[Orbitron] text-2xl font-bold text-foreground tracking-wider uppercase mb-6 neon-title">Multiplayer Online</h2>

        <div className="neon-card p-6 mb-4">
          <h3 className="font-[Orbitron] font-semibold text-foreground mb-2 uppercase tracking-wider text-sm">Criar Sala</h3>
          <p className="text-muted-foreground text-sm mb-4">Crie uma sala e compartilhe o código com um amigo.</p>
          <button onClick={onCreateRoom} className="neon-btn w-full">
            Criar Sala
          </button>
        </div>

        <div className="neon-card p-6">
          <h3 className="font-[Orbitron] font-semibold text-foreground mb-2 uppercase tracking-wider text-sm">Entrar em Sala</h3>
          <p className="text-muted-foreground text-sm mb-4">Insira o código da sala para entrar.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
              placeholder="CÓDIGO"
              maxLength={5}
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground font-[Orbitron] text-center text-lg tracking-widest placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <button
              onClick={() => joinCode.length === 5 && onJoinRoom(joinCode)}
              disabled={joinCode.length !== 5}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_15px_hsl(var(--primary)/0.4)] transition-all disabled:opacity-30"
            >
              <LogIn className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
