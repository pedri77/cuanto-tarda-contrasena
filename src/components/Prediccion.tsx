import {useState, type ReactNode} from 'react';
import {Deslizador} from './Deslizador';

type Props = {
  pregunta: string;
  min: number;
  max: number;
  paso?: number;
  correcta: number;
  formato?: (v: number) => string;
  /** Explicación que se muestra tras revelar. Recibe la apuesta para comentarla. */
  revelacion: (apuesta: number) => ReactNode;
};

/**
 * Patrón «predice antes de ver»: el lector se compromete con una cifra y después se revela.
 * Equivocarse es el objetivo: la sorpresa fija la idea. Nunca se enseña la respuesta antes.
 */
export function Prediccion({pregunta, min, max, paso = 1, correcta, formato = String, revelacion}: Props) {
  const [apuesta, setApuesta] = useState(Math.round((min + max) / 2 / paso) * paso);
  const [revelada, setRevelada] = useState(false);
  return (
    <div className="tarjeta">
      <p className="text-lead">{pregunta}</p>
      <div className="mt-6">
        <Deslizador etiqueta="Tu apuesta" valor={apuesta} min={min} max={max} paso={paso} onCambio={revelada ? () => {} : setApuesta} formato={formato} />
      </div>
      {!revelada ? (
        <button type="button" className="boton mt-6" onClick={() => setRevelada(true)}>
          Comprobar
        </button>
      ) : (
        <div className="mt-6" aria-live="polite">
          <p className="font-cifra text-display tabular-nums">{formato(correcta)}</p>
          <div className="mt-3 text-body text-texto-2">{revelacion(apuesta)}</div>
          <button type="button" className="boton-sec mt-4" onClick={() => setRevelada(false)}>
            Volver a apostar
          </button>
        </div>
      )}
    </div>
  );
}
