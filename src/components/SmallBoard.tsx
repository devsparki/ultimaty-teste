import { memo } from "react";
import Cell from "./Cell";
import type { CellValue, BoardWinner, Player } from "@/hooks/useUltimateTicTacToe";
import { cn } from "@/lib/utils";

interface SmallBoardProps {
  cells: CellValue[];
  boardIndex: number;
  winner: BoardWinner;
  isPlayable: boolean;
  currentPlayer: Player;
  lastMove: { board: number; cell: number } | null;
  onCellClick: (boardIdx: number, cellIdx: number) => void;
}

const SmallBoard = memo(function SmallBoard({
  cells,
  boardIndex,
  winner,
  isPlayable,
  currentPlayer,
  lastMove,
  onCellClick,
}: SmallBoardProps) {
  return (
    <div
      className={cn(
        "small-board",
        isPlayable && "board-active",
        isPlayable && currentPlayer === "X" && "board-active-x",
        isPlayable && currentPlayer === "O" && "board-active-o",
        !isPlayable && !winner && "board-inactive"
      )}
    >
      {cells.map((cell, j) => (
        <Cell
          key={j}
          value={cell}
          isNew={lastMove?.board === boardIndex && lastMove?.cell === j}
          onClick={() => onCellClick(boardIndex, j)}
        />
      ))}
      {winner && (
        <div
          className={cn(
            "won-overlay",
            winner === "X" && "won-overlay-x",
            winner === "O" && "won-overlay-o",
            winner === "TIE" && "won-overlay-tie"
          )}
        >
          {winner === "TIE" ? "=" : winner}
        </div>
      )}
    </div>
  );
});

export default SmallBoard;
