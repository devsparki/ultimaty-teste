import { memo } from "react";
import type { CellValue } from "@/hooks/useUltimateTicTacToe";
import { cn } from "@/lib/utils";

interface CellProps {
  value: CellValue;
  onClick: () => void;
  isNew: boolean;
}

const Cell = memo(function Cell({ value, onClick, isNew }: CellProps) {
  return (
    <button
      className={cn(
        "cell-btn",
        value && "cell-taken",
        value === "X" && "cell-x",
        value === "O" && "cell-o",
        value && isNew && "cell-animate"
      )}
      onClick={onClick}
      aria-label={value ? `Marcado ${value}` : "Vazio"}
    >
      {value}
    </button>
  );
});

export default Cell;
