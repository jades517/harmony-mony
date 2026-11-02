import { useEffect, useState } from 'react';
import { formatDuration } from '../lib/format';

export default function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const toggle = () => setRunning((v) => !v);
  const reset = () => {
    setRunning(false);
    setSeconds(0);
  };

  return { seconds, running, display: formatDuration(seconds), toggle, reset };
}
