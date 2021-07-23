import {useCallback, useEffect, useRef, useState} from 'react';

export function useDebounceFn(fn: (...args: any) => any, delay: number = 500): () => any {
  const timerRef = useRef<number | null>();

  const debouncedFn = (...args: any[]) => {
    timerRef.current && window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };

  useEffect(() => () => {
    timerRef.current && window.clearTimeout(timerRef.current);
  }, []);

  return debouncedFn;
}

export function useContextmenuPosition(clientX: number, clientY: number): any {
  const [ style, setStyle ] = useState({
    left: 0,
    top: 0,
  });

  const ref = useCallback((node) => {
    if (node !== null) {
      const screenW: number = window.innerWidth;
      const screenH: number = window.innerHeight;

      const rightClickRefW: number = node.offsetWidth;
      const rightClickRefH: number = node.offsetHeight;

      const canAtRight: boolean = (screenW - clientX) > rightClickRefW;
      const canAtTop: boolean = (screenH - clientY) > rightClickRefH;

      const left = canAtRight ?  clientX + 6 : clientX - rightClickRefW - 6;
      const top = canAtTop ? clientY : clientY - rightClickRefH;

      setStyle({ left, top });
    }
  }, [clientX, clientY]);

  return [ style, ref ];
}