import { useEffect, useRef, useState } from 'react';

function secondsUntil(deadlineAt, now = Date.now()) {
  if (!deadlineAt) return 0;
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - now) / 1000));
}

export function useTimer(deadlineAt, timeLimitMs, onExpire) {
  const [now, setNow] = useState(() => Date.now());
  const expiredDeadline = useRef(null);
  const callbackRef = useRef(onExpire);

  useEffect(() => {
    callbackRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!deadlineAt) return undefined;

    const update = () => {
      const currentTime = Date.now();
      const nextValue = secondsUntil(deadlineAt, currentTime);
      setNow(currentTime);
      if (nextValue === 0 && expiredDeadline.current !== deadlineAt) {
        expiredDeadline.current = deadlineAt;
        callbackRef.current?.();
      }
    };

    const initialUpdate = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 250);
    return () => {
      window.clearTimeout(initialUpdate);
      window.clearInterval(interval);
    };
  }, [deadlineAt]);

  const secondsLeft = secondsUntil(deadlineAt, now);
  const totalSeconds = Math.max(1, Math.ceil(Number(timeLimitMs || 0) / 1000));
  return {
    secondsLeft,
    percentage: Math.max(0, Math.min(100, (secondsLeft / totalSeconds) * 100)),
    urgency: secondsLeft <= 5 ? 'critical' : secondsLeft <= 10 ? 'warning' : 'normal',
  };
}
