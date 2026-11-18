import {useCallback, useEffect, useState} from 'react';

/**
 * Estado numérico sincronizado con la URL (?clave=valor) sin recargar ni ensuciar el historial.
 * Sirve para compartir un estado concreto («mira qué pasa con 12 caracteres») y para el QA:
 * scripts/estados.mjs abre la página con cada combinación y hace captura.
 */
export function useParametro(clave: string, inicial: number, min: number, max: number) {
  const [valor, setValor] = useState(() => {
    const v = Number(new URLSearchParams(location.search).get(clave));
    return Number.isFinite(v) && v >= min && v <= max && location.search.includes(`${clave}=`) ? v : inicial;
  });
  useEffect(() => {
    const url = new URL(location.href);
    if (valor === inicial) url.searchParams.delete(clave);
    else url.searchParams.set(clave, String(valor));
    history.replaceState(null, '', url);
  }, [clave, valor, inicial]);
  const fijar = useCallback((v: number) => setValor(Math.min(max, Math.max(min, v))), [min, max]);
  return [valor, fijar] as const;
}

/** Variante para opciones discretas (alfabeto, modo, escenario). */
export function useOpcion<T extends string>(clave: string, inicial: T, opciones: readonly T[]) {
  const [valor, setValor] = useState<T>(() => {
    const v = new URLSearchParams(location.search).get(clave) as T | null;
    return v && opciones.includes(v) ? v : inicial;
  });
  useEffect(() => {
    const url = new URL(location.href);
    if (valor === inicial) url.searchParams.delete(clave);
    else url.searchParams.set(clave, valor);
    history.replaceState(null, '', url);
  }, [clave, valor, inicial]);
  return [valor, setValor] as const;
}
