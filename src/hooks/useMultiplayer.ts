import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Player, CellValue, BoardWinner } from "./useUltimateTicTacToe";

type RoomStatus = "waiting" | "playing" | "disconnected" | "finished";

interface GameState {
  smallBoards: CellValue[][];
  bigBoard: BoardWinner[];
  currentPlayer: Player;
  nextBoardIndex: number | null;
  gameActive: boolean;
  gameWinner: Player | null;
  lastMove: { board: number; cell: number } | null;
  timeX?: number;
  timeO?: number;
  timeoutLoser?: Player | null;
}

export type { GameState };

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

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function initialGameState(): GameState {
  return {
    smallBoards: Array.from({ length: 9 }, () => Array(9).fill(null)),
    bigBoard: Array(9).fill(null),
    currentPlayer: "X",
    nextBoardIndex: null,
    gameActive: true,
    gameWinner: null,
    lastMove: null,
  };
}

export function useMultiplayer() {
  const [roomCode, setRoomCode] = useState<string>("");
  const [myRole, setMyRole] = useState<Player | null>(null);
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("waiting");
  const [gameState, setGameState] = useState<GameState>(initialGameState());
  const [playersInRoom, setPlayersInRoom] = useState(0);
  const [sharedTimeConfig, setSharedTimeConfig] = useState<{ totalSeconds: number; increment: number } | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const myIdRef = useRef<string>(crypto.randomUUID());
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

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  const joinChannel = useCallback((code: string, role: Player) => {
    cleanup();
    const channel = supabase.channel(`room:${code}`, {
      config: { presence: { key: myIdRef.current } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setPlayersInRoom(count);
        if (count >= 2) {
          setRoomStatus("playing");
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (leftPresences && leftPresences.length > 0) {
          const state = channel.presenceState();
          const count = Object.keys(state).length;
          if (count < 2) {
            setRoomStatus("disconnected");
          }
        }
      })
      .on("broadcast", { event: "move" }, ({ payload }) => {
        if (payload.playerId !== myIdRef.current) {
          setGameState(payload.gameState);
          playSound(payload.gameState.lastMove ? (payload.player as Player) : "X");
        }
      })
      .on("broadcast", { event: "reset" }, ({ payload }) => {
        if (payload.playerId !== myIdRef.current) {
          setGameState(initialGameState());
        }
      })
      .on("broadcast", { event: "time_config" }, ({ payload }) => {
        if (payload.playerId !== myIdRef.current) {
          setSharedTimeConfig({ totalSeconds: payload.totalSeconds, increment: payload.increment });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ role, id: myIdRef.current });
        }
      });

    channelRef.current = channel;
    setMyRole(role);
    setRoomCode(code);
  }, [cleanup, playSound]);

  const createRoom = useCallback(() => {
    const code = generateRoomCode();
    setGameState(initialGameState());
    setRoomStatus("waiting");
    joinChannel(code, "X");
  }, [joinChannel]);

  const joinRoom = useCallback((code: string) => {
    setGameState(initialGameState());
    setRoomStatus("waiting");
    joinChannel(code.toUpperCase(), "O");
  }, [joinChannel]);

  const handleMove = useCallback(
    (boardIdx: number, cellIdx: number, timeData?: { timeX: number; timeO: number }) => {
      const gs = gameState;
      if (!gs.gameActive) return;
      if (gs.currentPlayer !== myRole) return;
      if (gs.nextBoardIndex !== null && gs.nextBoardIndex !== boardIdx) return;
      if (gs.smallBoards[boardIdx][cellIdx] || gs.bigBoard[boardIdx]) return;

      playSound(gs.currentPlayer);

      const newSmallBoards = gs.smallBoards.map((b) => [...b]);
      newSmallBoards[boardIdx][cellIdx] = gs.currentPlayer;

      const newBigBoard = [...gs.bigBoard];
      const winner = checkWinner(newSmallBoards[boardIdx]);
      if (winner) {
        newBigBoard[boardIdx] = winner;
      } else if (newSmallBoards[boardIdx].every((c) => c !== null)) {
        newBigBoard[boardIdx] = "TIE";
      }

      let gameActive = true;
      let gameWinner: Player | null = null;
      const bigWinner = checkWinner(newBigBoard);
      if (bigWinner) {
        gameWinner = bigWinner;
        gameActive = false;
      }

      // Same redirect rule as local mode
      let next: number | null = cellIdx;
      if (newBigBoard[cellIdx] !== null) {
        if (newBigBoard[boardIdx] !== null || newSmallBoards[boardIdx].every((c) => c !== null)) {
          next = null;
        } else {
          next = boardIdx;
        }
      }

      const newState: GameState = {
        smallBoards: newSmallBoards,
        bigBoard: newBigBoard,
        currentPlayer: gs.currentPlayer === "X" ? "O" : "X",
        nextBoardIndex: next,
        gameActive,
        gameWinner,
        lastMove: { board: boardIdx, cell: cellIdx },
        timeX: timeData?.timeX,
        timeO: timeData?.timeO,
      };

      setGameState(newState);
      channelRef.current?.send({
        type: "broadcast",
        event: "move",
        payload: { gameState: newState, playerId: myIdRef.current, player: gs.currentPlayer },
      });
    },
    [gameState, myRole, playSound]
  );

  const resetGame = useCallback(() => {
    const fresh = initialGameState();
    setGameState(fresh);
    channelRef.current?.send({
      type: "broadcast",
      event: "reset",
      payload: { playerId: myIdRef.current },
    });
  }, []);

  const isBoardPlayable = useCallback(
    (idx: number) =>
      gameState.gameActive &&
      gameState.currentPlayer === myRole &&
      (gameState.nextBoardIndex === null || gameState.nextBoardIndex === idx) &&
      gameState.bigBoard[idx] === null,
    [gameState, myRole]
  );

  const leaveRoom = useCallback(() => {
    cleanup();
    setRoomCode("");
    setMyRole(null);
    setRoomStatus("waiting");
    setGameState(initialGameState());
    setPlayersInRoom(0);
    setSharedTimeConfig(null);
  }, [cleanup]);

  const broadcastTimeConfig = useCallback((totalSeconds: number, increment: number) => {
    setSharedTimeConfig({ totalSeconds, increment });
    channelRef.current?.send({
      type: "broadcast",
      event: "time_config",
      payload: { totalSeconds, increment, playerId: myIdRef.current },
    });
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    roomCode,
    myRole,
    roomStatus,
    gameState,
    playersInRoom,
    sharedTimeConfig,
    createRoom,
    joinRoom,
    handleMove,
    resetGame,
    isBoardPlayable,
    leaveRoom,
    broadcastTimeConfig,
  };
}
