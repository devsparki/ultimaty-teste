import { useState, useCallback } from "react";
import { useUltimateTicTacToe } from "@/hooks/useUltimateTicTacToe";
import { useChessClock } from "@/hooks/useChessClock";
import SmallBoard from "./SmallBoard";
import ChessClock from "./ChessClock";
import { cn } from "@/lib/utils";
import { RotateCcw, ArrowLeft } from "lucide-react";
import type { Player } from "@/hooks/useUltimateTicTacToe";

interface GameBoardProps {
  onBack?: () => void;
  totalSeconds: number;
  increment: number;
}

export default function GameBoard({ onBack, totalSeconds, increment }: GameBoardProps) {
  const [timeoutLoser, setTimeoutLoser] = useState<Player | null>(null);

  const {
    currentPlayer,
    gameActive,
    bigBoard,
    smallBoards,
    gameWinner,
    lastMove,
    handleMove: rawMove,
    resetGame: rawReset,
    isBoardPlayable,
  } = useUltimateTicTacToe();

  const onTimeout = useCallback((loser: Player) => {
    setTimeoutLoser(loser);
  }, []);

  const clock = useChessClock({ onTimeout });

  const [initialized, setInitialized] = useState(false);
  if (!initialized) {
    clock.initClock(totalSeconds, increment);
    setInitialized(true);
  }

  const effectiveGameOver = !gameActive || !!timeoutLoser;

  const handleMove = useCallback((boardIdx: number, cellIdx: number) => {
    if (timeoutLoser) return;
    if (clock.paused) return;
    rawMove(boardIdx, cellIdx);
    const nextPlayer: Player = currentPlayer === "X" ? "O" : "X";
    clock.switchTurn(nextPlayer);
  }, [rawMove, currentPlayer, clock, timeoutLoser]);

  const resetGame = useCallback(() => {
    rawReset();
    clock.resetClock(totalSeconds);
    setTimeoutLoser(null);
  }, [rawReset, clock, totalSeconds]);

  const displayWinner = gameWinner || (timeoutLoser ? (timeoutLoser === "X" ? "O" : "X") : null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
      <div className="futuristic-bg" />

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <header className="flex justify-between items-end mb-4">
          <div>
            {onBack && (
              <button onClick={onBack} className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-xs font-medium mb-2">
                <ArrowLeft className="w-3 h-3" /> Menu
              </button>
            )}
            <h1 className="neon-title text-2xl font-bold tracking-wider uppercase">
              Jogo da Velha 2
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
                  venceu o jogo! 🎉
                </span>
              ) : clock.paused ? (
                <span className="text-muted-foreground font-semibold">⏸ Jogo pausado</span>
              ) : (
                <span>
                  Vez do Jogador{" "}
                  <span className={cn(
                    currentPlayer === "X" ? "text-player-x" : "text-player-o",
                    "neon-text"
                  )}>
                    {currentPlayer}
                  </span>
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

        {/* Chess Clock */}
        <ChessClock
          timeX={clock.timeX}
          timeO={clock.timeO}
          activePlayer={clock.activePlayer}
          currentPlayer={currentPlayer}
          paused={clock.paused}
          onTogglePause={clock.togglePause}
          showPause={!effectiveGameOver}
        />

        {/* Board */}
        <div className={cn("big-board", displayWinner && (displayWinner === "X" ? "victory-pulse-x" : "victory-pulse-o"))}>
          {smallBoards.map((cells, i) => (
            <SmallBoard
              key={i}
              cells={cells}
              boardIndex={i}
              winner={bigBoard[i]}
              isPlayable={!effectiveGameOver && !clock.paused && isBoardPlayable(i)}
              currentPlayer={currentPlayer}
              lastMove={lastMove}
              onCellClick={handleMove}
            />
          ))}
        </div>

        {/* Footer rule */}
        <footer className="mt-6 text-center">
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
