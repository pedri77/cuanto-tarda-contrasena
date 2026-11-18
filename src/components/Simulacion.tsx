import {useEffect, useState, type ReactNode} from 'react';
import {useBucle} from '../hooks/useBucle';
import {useMovimientoReducido} from '../hooks/useMovimientoReducido';
import {useVisible} from '../hooks/useVisible';

type Props = {
  titulo: string;
  /** Avanza el modelo dt segundos. Devuelve false para pararse sola (p. ej. al llenarse). */
  paso: (dt: number) => boolean | void;
  reiniciar: () => void;
  /** Lo que se dibuja (SVG o canvas). Se re-renderiza con `tic`. */
  children: (tic: number) => ReactNode;
  /** Resumen textual del estado para lectores de pantalla y para cuando no hay movimiento. */
  estado: string;
};

/**
 * Envoltorio de toda simulación: play/pausa/reiniciar, bucle solo si está en pantalla,
 * parada por defecto con prefers-reduced-motion (el lector la arranca si quiere) y
 * estado textual anunciado con aria-live. El modelo vive fuera (ref o estado del padre).
 */
export function Simulacion({titulo, paso, reiniciar, children, estado}: Props) {
  const reducido = useMovimientoReducido();
  const [ref, visible] = useVisible<HTMLDivElement>();
  const [enMarcha, setEnMarcha] = useState(!reducido);
  const [tic, setTic] = useState(0);
  useEffect(() => setEnMarcha(!reducido), [reducido]);
  useBucle(enMarcha && visible, (dt) => {
    if (paso(dt) === false) setEnMarcha(false);
    setTic((t) => t + 1);
  });
  return (
    <figure ref={ref} className="tarjeta">
      <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <span className="text-etiqueta uppercase text-texto-2">{titulo}</span>
        <span className="flex gap-2">
          <button type="button" className="boton-sec" onClick={() => setEnMarcha((v) => !v)} aria-pressed={enMarcha}>
            {enMarcha ? 'Pausa' : 'Reproducir'}
          </button>
          <button
            type="button"
            className="boton-sec"
            onClick={() => {
              reiniciar();
              setTic((t) => t + 1);
            }}
          >
            Reiniciar
          </button>
        </span>
      </figcaption>
      <div className="mt-4" aria-hidden>
        {children(tic)}
      </div>
      <p className="mt-3 text-body text-texto-2 tabular-nums" aria-live="polite">
        {estado}
      </p>
    </figure>
  );
}
