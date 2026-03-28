import { useState, useCallback, useRef, useEffect } from "react";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useChessClock } from "@/hooks/useChessClock";
import SmallBoard from "./SmallBoard";
import ChessClock from "./ChessClock";
import RoomLobby from "./RoomLobby";
import TimeSettingsComponent from "./TimeSettings";
import { cn } from "@/lib/utils";
import { RotateCcw, ArrowLeft, WifiOff, Clock } from "lucide-react";
import type { Player } from "@/hooks/useUltimateTicTacToe";

export function OnlineGameWrapper({ onBack }: { onBack: () => void }) {
  const mp = useMultiplayer();
  const [timeConfig, setTimeConfig] = useState<{ totalSeconds: number; increment: number } | null>(null);
  const [timeoutLoser, setTimeoutLoser] = useState<Player | null>(null);

  const onTimeout = useCallback((loser: Player) => {
    setTimeoutLoser(loser);
  }, []);

  const clock = useChessClock({ onTimeout });

  // Joiner receives time config from creator
  useEffect(() => {
    if (mp.sharedTimeConfig && !timeConfig) {
      setTimeConfig(mp.sharedTimeConfig);
      clock.initClock(mp.sharedTimeConfig.totalSeconds, mp.sharedTimeConfig.increment);
    }
  }, [mp.sharedTimeConfig, timeConfig, clock]);

  // Step 1: Create or join room first
  if (!mp.roomCode) {
    return (
      <RoomLobby
        roomCode=""
        playersInRoom={0}
        myRole={null}
        roomStatus="waiting"
        onCreateRoom={mp.createRoom}
        onJoinRoom={mp.joinRoom}
        onBack={onBack}
      />
    );
  }

  // Step 2: Creator picks time; joiner waits for time config
  if (!timeConfig) {
    if (mp.myRole === "X") {
      // Creator chooses time
      return (
        <TimeSettingsComponent
          onStart={(totalSeconds, increment) => {
            setTimeConfig({ totalSeconds, increment });
            clock.initClock(totalSeconds, increment);
            mp.broadcastTimeConfig(totalSeconds, increment);
          }}
          onBack={() => { mp.leaveRoom(); onBack(); }}
        />
      );
    } else {
      // Joiner waits for creator to pick time
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
          <div className="futuristic-bg" />
          <div className="w-full max-w-md relative z-10">
            <button onClick={() => { mp.leaveRoom(); onBack(); }} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <div className="neon-card p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-[Orbitron] text-xl font-bold text-foreground mb-2 uppercase tracking-wider">Sala {mp.roomCode}</h2>
              <p className="text-muted-foreground text-sm mb-2">Aguardando o criador escolher o tempo...</p>
              <div className="w-6 h-6 border-2 border-primary/40 border-t-primary rounded-full animate-spin mx-auto mt-4" />
            </div>
          </div>
        </div>
      );
    }
  }

  // Step 3: Waiting for second player
  if (mp.roomStatus === "waiting" && mp.playersInRoom < 2) {
    return (
      <RoomLobby
        roomCode={mp.roomCode}
        playersInRoom={mp.playersInRoom}
        myRole={mp.myRole}
        roomStatus={mp.roomStatus}
        onCreateRoom={mp.createRoom}
        onJoinRoom={mp.joinRoom}
        onBack={() => { mp.leaveRoom(); onBack(); }}
        timeLabel={`${Math.floor(timeConfig.totalSeconds / 60)}:${(timeConfig.totalSeconds % 60).toString().padStart(2, "0")}${timeConfig.increment > 0 ? ` +${timeConfig.increment}s` : ""}`}
      />
    );
  }

  // Step 4: Game
  return (
    <OnlineGame
      mp={mp}
      clock={clock}
      timeConfig={timeConfig}
      timeoutLoser={timeoutLoser}
      setTimeoutLoser={setTimeoutLoser}
      onBack={() => { mp.leaveRoom(); onBack(); }}
    />
  );
}

interface OnlineGameProps {
  mp: ReturnType<typeof useMultiplayer>;
  clock: ReturnType<typeof useChessClock>;
  timeConfig: { totalSeconds: number; increment: number };
  timeoutLoser: Player | null;
  setTimeoutLoser: (p: Player | null) => void;
  onBack: () => void;
}

function OnlineGame({ mp, clock, timeConfig, timeoutLoser, setTimeoutLoser, onBack }: OnlineGameProps) {
  const { currentPlayer, bigBoard, smallBoards, gameWinner, lastMove } = mp.gameState;
  const isMyTurn = currentPlayer === mp.myRole;
  const effectiveGameOver = !mp.gameState.gameActive || !!timeoutLoser;

  // Sync clock from received broadcast (only when it's NOT our turn, meaning opponent just moved)
  const lastSyncRef = useRef<string>("");
  useEffect(() => {
    const gs = mp.gameState;
    if (gs.timeX !== undefined && gs.timeO !== undefined) {
      const syncKey = `${gs.timeX}-${gs.timeO}-${gs.currentPlayer}-${gs.lastMove?.board}-${gs.lastMove?.cell}`;
      if (syncKey !== lastSyncRef.current) {
        lastSyncRef.current = syncKey;
        // Only sync if this is from the opponent's move (it's now our turn)
        if (gs.currentPlayer === mp.myRole) {
          clock.syncTimes(gs.timeX, gs.timeO, gs.currentPlayer);
        }
      }
    }
  }, [mp.gameState, mp.myRole, clock]);

  if (mp.gameState.timeoutLoser && !timeoutLoser) {
    setTimeoutLoser(mp.gameState.timeoutLoser);
  }

  const handleMove = useCallback((boardIdx: number, cellIdx: number) => {
    if (timeoutLoser || clock.paused) return;
    const gs = mp.gameState;
    if (!gs.gameActive) return;
    if (gs.currentPlayer !== mp.myRole) return;

    // Capture current times BEFORE switching turn
    const timeData = { timeX: clock.timeX, timeO: clock.timeO };
    const nextPlayer: Player = gs.currentPlayer === "X" ? "O" : "X";
    // Add increment to the player who just moved
    if (gs.currentPlayer === "X") {
      timeData.timeX = clock.timeX; // will get increment via switchTurn
    } else {
      timeData.timeO = clock.timeO;
    }
    
    clock.switchTurn(nextPlayer);
    // After switchTurn, capture the post-increment times
    const postTimeData = { timeX: clock.timeX, timeO: clock.timeO };
    mp.handleMove(boardIdx, cellIdx, postTimeData);
  }, [mp, clock, timeoutLoser]);

  const resetGame = useCallback(() => {
    mp.resetGame();
    clock.resetClock(timeConfig.totalSeconds);
    setTimeoutLoser(null);
  }, [mp, clock, timeConfig.totalSeconds, setTimeoutLoser]);

  const displayWinner = gameWinner || (timeoutLoser ? (timeoutLoser === "X" ? "O" : "X") : null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
      <div className="futuristic-bg" />

      <div className="w-full max-w-2xl relative z-10">
        {mp.roomStatus === "disconnected" && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
            <WifiOff className="w-4 h-4 shrink-0" />
            Jogador desconectado
          </div>
        )}

        <header className="flex justify-between items-end mb-4">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-xs font-medium mb-2"
            >
              <ArrowLeft className="w-3 h-3" /> Sair da sala
            </button>
            <h1 className="neon-title text-2xl font-bold tracking-wider uppercase">
              Sala {mp.roomCode}
            </h1>
            <p className="font-medium mt-1 text-muted-foreground">
              {timeoutLoser ? (
                <span className="text-destructive font-semibold">
                  ⏰ Tempo esgotado! Jogador {timeoutLoser} perdeu.
                </span>
              ) : gameWinner ? (
                <span>
                  Jogador{" "}
                  <span className={cn(gameWinner === "X" ? "text-player-x" : "text-player-o")}>
                    {gameWinner}
                  </span>{" "}
                  venceu! {gameWinner === mp.myRole ? "🎉 Você ganhou!" : "😢"}
                </span>
              ) : isMyTurn ? (
                <span className="text-foreground font-semibold neon-text">Sua vez ({mp.myRole})</span>
              ) : (
                <span>
                  Vez do oponente (
                  <span className={cn(currentPlayer === "X" ? "text-player-x" : "text-player-o")}>
                    {currentPlayer}
                  </span>
                  )
                </span>
              )}
            </p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-4 py-2 neon-card text-sm font-[Orbitron] font-semibold text-foreground hover:border-primary/40 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </header>

        <ChessClock
          timeX={clock.timeX}
          timeO={clock.timeO}
          activePlayer={clock.activePlayer}
          currentPlayer={currentPlayer}
        />

        <div className={cn("big-board", displayWinner && (displayWinner === "X" ? "victory-pulse-x" : "victory-pulse-o"))}>
          {smallBoards.map((cells, i) => (
            <SmallBoard
              key={i}
              cells={cells}
              boardIndex={i}
              winner={bigBoard[i]}
              isPlayable={!effectiveGameOver && mp.isBoardPlayable(i)}
              currentPlayer={currentPlayer}
              lastMove={lastMove}
              onCellClick={handleMove}
            />
          ))}
        </div>

        <footer className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 neon-card text-xs font-medium text-muted-foreground">
            Você é <span className={cn("font-[Orbitron] font-bold", mp.myRole === "X" ? "text-player-x" : "text-player-o")}>{mp.myRole}</span>
          </div>
          <div className="inline-flex items-center gap-3 px-4 py-2 neon-card text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <span className="font-[Orbitron] text-primary">Regra</span>
            <span className="font-normal normal-case tracking-normal">
              A posição na célula define o próximo tabuleiro
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}
