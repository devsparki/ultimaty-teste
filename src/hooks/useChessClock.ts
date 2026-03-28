import { useState, useCallback, useRef, useEffect } from "react";
import type { Player } from "./useUltimateTicTacToe";

export interface TimeSettings {
  totalSeconds: number;
  increment: number;
  label: string;
}

export const TIME_PRESETS: TimeSettings[] = [
  { totalSeconds: 300, increment: 0, label: "5 min" },
  { totalSeconds: 180, increment: 0, label: "3 min" },
  { totalSeconds: 60, increment: 0, label: "1 min" },
  { totalSeconds: 30, increment: 0, label: "30 seg" },
];

export const INCREMENT_OPTIONS = [0, 1, 2, 3, 5];

interface UseChessClockOptions {
  onTimeout: (loser: Player) => void;
}

export function useChessClock({ onTimeout }: UseChessClockOptions) {
  const [timeX, setTimeX] = useState(300);
  const [timeO, setTimeO] = useState(300);
  const [running, setRunning] = useState(false);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [paused, setPaused] = useState(false);
  const [timedOut, setTimedOut] = useState<Player | null>(null);
  const incrementRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickingRef = useRef(false);
  const tickOscRef = useRef<OscillatorNode | null>(null);
  const tickGainRef = useRef<GainNode | null>(null);

  const stopTicking = useCallback(() => {
    if (tickOscRef.current) {
      try { tickOscRef.current.stop(); } catch {}
      tickOscRef.current = null;
    }
    tickingRef.current = false;
  }, []);

  const startTicking = useCallback(() => {
    if (tickingRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(2, ctx.currentTime);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      tickOscRef.current = osc;
      tickGainRef.current = gain;
      tickingRef.current = true;
    } catch {}
  }, []);

  const playTick = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }, []);

  // Tick every 100ms for smooth countdown
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!running || paused || !activePlayer || timedOut) return;

    intervalRef.current = setInterval(() => {
      const setter = activePlayer === "X" ? setTimeX : setTimeO;
      setter((prev) => {
        const next = Math.max(0, prev - 0.1);
        if (next <= 5 && next > 0 && Math.floor(next * 10) % 10 === 0) {
          playTick();
        }
        if (next <= 0) {
          setTimedOut(activePlayer);
          setRunning(false);
          onTimeout(activePlayer);
          stopTicking();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, paused, activePlayer, timedOut, onTimeout, playTick, stopTicking]);

  const initClock = useCallback((totalSeconds: number, increment: number) => {
    setTimeX(totalSeconds);
    setTimeO(totalSeconds);
    setRunning(false);
    setActivePlayer(null);
    setPaused(false);
    setTimedOut(null);
    incrementRef.current = increment;
    stopTicking();
  }, [stopTicking]);

  const switchTurn = useCallback((nextPlayer: Player) => {
    // Add increment to the player who just moved
    if (activePlayer && incrementRef.current > 0) {
      const setter = activePlayer === "X" ? setTimeX : setTimeO;
      setter((prev) => prev + incrementRef.current);
    }
    setActivePlayer(nextPlayer);
    if (!running) setRunning(true);
  }, [activePlayer, running]);

  const pauseClock = useCallback(() => setPaused(true), []);
  const resumeClock = useCallback(() => setPaused(false), []);
  const togglePause = useCallback(() => setPaused((p) => !p), []);

  const resetClock = useCallback((totalSeconds: number) => {
    setTimeX(totalSeconds);
    setTimeO(totalSeconds);
    setRunning(false);
    setActivePlayer(null);
    setPaused(false);
    setTimedOut(null);
    stopTicking();
  }, [stopTicking]);

  // Sync times from multiplayer
  const syncTimes = useCallback((x: number, o: number, active: Player | null) => {
    setTimeX(x);
    setTimeO(o);
    setActivePlayer(active);
    if (active && !running) setRunning(true);
  }, [running]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopTicking();
    };
  }, [stopTicking]);

  return {
    timeX,
    timeO,
    activePlayer,
    running,
    paused,
    timedOut,
    initClock,
    switchTurn,
    pauseClock,
    resumeClock,
    togglePause,
    resetClock,
    syncTimes,
  };
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (seconds < 10) {
    return `${m}:${s.toString().padStart(2, "0")}.${ms}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}
