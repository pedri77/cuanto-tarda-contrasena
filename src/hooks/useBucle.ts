import {useEffect, useRef} from 'react';

/**
 * Bucle rAF con dt en segundos que solo corre si `activo` (visible y en marcha).
 * El callback se lee de una ref: puede cambiar en cada render sin reiniciar el bucle.
 * dt se limita a 1/20 s para que una pestaña en segundo plano no dé un salto al volver.
 */
export function useBucle(activo: boolean, paso: (dt: number) => void) {
  const cb = useRef(paso);
  cb.current = paso;
  useEffect(() => {
    if (!activo) return;
    let id = 0;
    let antes = performance.now();
    const tic = (ahora: number) => {
      cb.current(Math.min(0.05, (ahora - antes) / 1000));
      antes = ahora;
      id = requestAnimationFrame(tic);
    };
    id = requestAnimationFrame(tic);
    return () => cancelAnimationFrame(id);
  }, [activo]);
}
