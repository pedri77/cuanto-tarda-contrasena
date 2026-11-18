import {contenido as c} from '../content';
import {posicionLog, tiempoLegible} from '../modelo';

export type Marca = {seg: number; texto: string; tono?: 'acento' | 'lima' | 'rojo'};

const TONO = {acento: 'bg-acento', lima: 'bg-lima-fuerte', rojo: 'bg-acento-3'} as const;
const CARRIL = 42;
/** Fila de cada referencia bajo la barra (tres filas para que no se pisen en móvil). */
const FILA = [0, 1, 0, 2, 1];

/**
 * Barra logarítmica de 1 µs a 10³⁰ s con las referencias humanas debajo.
 * Cada marca va en su carril para que no se pisen; la etiqueta se alinea hacia dentro.
 */
export function BarraLog({marcas, etiqueta}: {marcas: Marca[]; etiqueta: string}) {
  const alto = marcas.length * CARRIL;
  const resumen = marcas.map((m) => `${m.texto}: ${tiempoLegible(m.seg)}`).join('; ');
  return (
    <div role="img" aria-label={`${etiqueta}. ${resumen}.`} className="relative select-none" style={{height: alto + 86}}>
      {marcas.map((m, i) => {
        const p = posicionLog(m.seg);
        const fuera = p === 0 ? '← ' : '';
        const fueraD = p === 1 ? ' →' : '';
        const lado = p < 0.35 ? 'izq' : p > 0.65 ? 'der' : 'centro';
        const posicion: React.CSSProperties =
          lado === 'izq'
            ? {left: `${p * 100}%`, transform: 'translateX(-5px)'}
            : lado === 'der'
              ? {right: `${(1 - p) * 100}%`, transform: 'translateX(5px)', textAlign: 'right'}
              : {left: `${p * 100}%`, transform: 'translateX(-50%)', textAlign: 'center'};
        return (
          <div key={m.texto} aria-hidden>
            <div
              className={`absolute w-0.5 ${TONO[m.tono ?? 'acento']}`}
              style={{left: `${p * 100}%`, top: i * CARRIL + 34, height: alto - i * CARRIL - 34 + 10}}
            />
            <div className="absolute whitespace-nowrap text-[0.8125rem] leading-tight" style={{top: i * CARRIL, ...posicion}}>
              <div className="font-semibold">
                {lado !== 'der' && <span className={`mr-1.5 inline-block size-2.5 rounded-full ring-1 ring-texto/40 align-middle ${TONO[m.tono ?? 'acento']}`} />}
                {m.texto}
                {lado === 'der' && <span className={`ml-1.5 inline-block size-2.5 rounded-full ring-1 ring-texto/40 align-middle ${TONO[m.tono ?? 'acento']}`} />}
              </div>
              <div className="text-texto-2">
                {fuera}
                {tiempoLegible(m.seg)}
                {fueraD}
              </div>
            </div>
          </div>
        );
      })}
      <div className="absolute inset-x-0 h-2.5 rounded-full bg-elevado ring-1 ring-borde" style={{top: alto + 6}} aria-hidden />
      {c.referencias.map((r, i) => {
        const p = posicionLog(r.seg);
        return (
          <div key={r.nombre} className="absolute" style={{left: `${p * 100}%`, top: alto + 2}} aria-hidden>
            <div className="h-[18px] w-px bg-texto-3" />
            <div className="absolute -translate-x-1/2 whitespace-nowrap text-etiqueta uppercase text-texto-3" style={{top: 22 + FILA[i] * 15}}>
              {r.nombre}
            </div>
          </div>
        );
      })}
    </div>
  );
}
