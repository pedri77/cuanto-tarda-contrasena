import {useId} from 'react';

type Props<T extends string> = {
  etiqueta: string;
  valor: T;
  opciones: readonly {valor: T; texto: string}[];
  onCambio: (v: T) => void;
};

/** Grupo de radios nativo con aspecto de botones segmentados. Flechas para moverse dentro del grupo. */
export function Opciones<T extends string>({etiqueta, valor, opciones, onCambio}: Props<T>) {
  const nombre = useId();
  return (
    <fieldset className="opciones">
      <legend className="text-etiqueta uppercase text-texto-2">{etiqueta}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {opciones.map((o) => (
          <label key={o.valor}>
            <input type="radio" name={nombre} value={o.valor} checked={valor === o.valor} onChange={() => onCambio(o.valor)} className="sr-only" />
            <span>{o.texto}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
