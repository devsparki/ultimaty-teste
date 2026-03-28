import { useState, useCallback, useRef } from "react";

export type Player = "X" | "O";
export type CellValue = Player | null;
export type BoardWinner = Player | "TIE" | null;

const WIN_PATTERNS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function checkWinner(board: (string | null)[]): Player | null {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c] && board[a] !== "TIE") {
      return board[a] as Player;
    }
  }
  return null;
}

export function useUltimateTicTacToe() {
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [nextBoardIndex, setNextBoardIndex] = useState<number | null>(null);
  const [gameActive, setGameActive] = useState(true);
  const [bigBoard, setBigBoard] = useState<BoardWinner[]>(Array(9).fill(null));
  const [smallBoards, setSmallBoards] = useState<CellValue[][]>(
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
  const [gameWinner, setGameWinner] = useState<Player | null>(null);
  const [lastMove, setLastMove] = useState<{ board: number; cell: number } | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((player: Player) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(player === "X" ? 440 : 554, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, []);

  const handleMove = useCallback(
    (boardIdx: number, cellIdx: number) => {
      if (!gameActive) return;
      if (nextBoardIndex !== null && nextBoardIndex !== boardIdx) return;
      if (smallBoards[boardIdx][cellIdx] || bigBoard[boardIdx]) return;

      playSound(currentPlayer);

      const newSmallBoards = smallBoards.map((b) => [...b]);
      newSmallBoards[boardIdx][cellIdx] = currentPlayer;

      const newBigBoard = [...bigBoard];
      const winner = checkWinner(newSmallBoards[boardIdx]);
      if (winner) {
        newBigBoard[boardIdx] = winner;
      } else if (newSmallBoards[boardIdx].every((c) => c !== null)) {
        newBigBoard[boardIdx] = "TIE";
      }

      const bigWinner = checkWinner(newBigBoard);
      if (bigWinner) {
        setGameWinner(bigWinner);
        setGameActive(false);
      }

      // If target board is finished, redirect to current board; if current board is also full/finished, allow free choice
      let next: number | null = cellIdx;
      if (newBigBoard[cellIdx] !== null) {
        // Target finished → stay on current board, unless it's also finished or has no empty cells
        if (newBigBoard[boardIdx] !== null || newSmallBoards[boardIdx].every((c) => c !== null)) {
          next = null; // free choice
        } else {
          next = boardIdx; // stay on same board
        }
      }

      setSmallBoards(newSmallBoards);
      setBigBoard(newBigBoard);
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      setNextBoardIndex(next);
      setLastMove({ board: boardIdx, cell: cellIdx });
    },
    [gameActive, nextBoardIndex, smallBoards, bigBoard, currentPlayer, playSound]
  );

  const resetGame = useCallback(() => {
    setCurrentPlayer("X");
    setNextBoardIndex(null);
    setGameActive(true);
    setBigBoard(Array(9).fill(null));
    setSmallBoards(Array.from({ length: 9 }, () => Array(9).fill(null)));
    setGameWinner(null);
    setLastMove(null);
  }, []);

  const isBoardPlayable = useCallback(
    (idx: number) => gameActive && (nextBoardIndex === null || nextBoardIndex === idx) && bigBoard[idx] === null,
    [gameActive, nextBoardIndex, bigBoard]
  );

  return {
    currentPlayer,
    nextBoardIndex,
    gameActive,
    bigBoard,
    smallBoards,
    gameWinner,
    lastMove,
    handleMove,
    resetGame,
    isBoardPlayable,
  };
}
