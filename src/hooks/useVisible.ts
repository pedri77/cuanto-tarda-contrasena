import {useEffect, useRef, useState} from 'react';

/** true mientras el elemento está en pantalla. Las simulaciones solo corren si es true. */
export function useVisible<T extends HTMLElement>(margen = '0px') {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {rootMargin: margen});
    io.observe(el);
    return () => io.disconnect();
  }, [margen]);
  return [ref, visible] as const;
}
