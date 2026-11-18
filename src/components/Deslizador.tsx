import {useId} from 'react';
import {alPaso} from '../lib/math';

type Props = {
  etiqueta: string;
  valor: number;
  min: number;
  max: number;
  paso?: number;
  onCambio: (v: number) => void;
  /** Texto que oye el lector de pantalla y se ve junto a la etiqueta: «12 caracteres». */
  formato?: (v: number) => string;
  /** Marcas con nombre bajo la pista (p. ej. «tu contraseña», «recomendado»). */
  marcas?: {valor: number; texto: string}[];
};

/**
 * Control base del formato. Es un <input type="range"> nativo: teclado (flechas, Re Pág, Inicio, Fin),
 * lector de pantalla y táctil vienen gratis. Solo se cambia el aspecto.
 */
export function Deslizador({etiqueta, valor, min, max, paso = 1, onCambio, formato = String, marcas = []}: Props) {
  const id = useId();
  const pct = ((valor - min) / (max - min)) * 100;
  return (
    <div className="deslizador">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-etiqueta uppercase text-texto-2">
          {etiqueta}
        </label>
        <output htmlFor={id} className="font-cifra text-lead tabular-nums">
          {formato(valor)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={paso}
        value={valor}
        aria-valuetext={formato(valor)}
        onChange={(e) => onCambio(alPaso(Number(e.target.value), paso))}
        style={{'--pct': `${pct}%`} as React.CSSProperties}
      />
      {marcas.length > 0 && (
        <div className="relative h-5 text-etiqueta text-texto-3" aria-hidden>
          {marcas.map((m) => (
            <span key={m.valor} className="absolute -translate-x-1/2 whitespace-nowrap" style={{left: `${((m.valor - min) / (max - min)) * 100}%`}}>
              {m.texto}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
