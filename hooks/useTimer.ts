import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  // Refs to store state without triggering re-renders
  // startTimestamp: The exact Date.now() when the start/resume button was pressed
  const startTimestamp = useRef<number | null>(null);
  // accumulatedTime: The total seconds elapsed before the current start/resume action
  const accumulatedTime = useRef<number>(0);
  
  const timerInterval = useRef<number | null>(null);

  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimestamp.current = Date.now();
    
    timerInterval.current = window.setInterval(() => {
      if (startTimestamp.current) {
        const now = Date.now();
        const deltaSeconds = Math.floor((now - startTimestamp.current) / 1000);
        // Current total = Time previously accumulated + Time since last start
        setSeconds(accumulatedTime.current + deltaSeconds);
      }
    }, 100); // Check every 100ms for smoothness, though UI updates per second
  }, [isRunning]);

  const pause = useCallback(() => {
    if (!isRunning) return;
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Save the time that has passed so far into accumulatedTime
    if (startTimestamp.current) {
        const now = Date.now();
        const delta = Math.floor((now - startTimestamp.current) / 1000);
        accumulatedTime.current += delta;
    }
    
    startTimestamp.current = null;
    setIsRunning(false);
  }, [isRunning]);

  const reset = useCallback(() => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setSeconds(0);
    setIsRunning(false);
    startTimestamp.current = null;
    accumulatedTime.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    setSeconds: (s: number) => { 
        setSeconds(s); 
        accumulatedTime.current = s; 
        startTimestamp.current = isRunning ? Date.now() : null; 
    }
  };
};