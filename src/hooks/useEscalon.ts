import {useParametro} from './useParametro';

/**
 * Parámetro que solo toma valores de una lista (escala logarítmica «bonita»: 1, 2, 5, 10, 20…).
 * El deslizador mueve el índice; la URL guarda el valor real (?f=0.5).
 */
export function useEscalon(clave: string, inicial: number, valores: readonly number[]) {
  const [v, fijar] = useParametro(clave, inicial, valores[0], valores[valores.length - 1]);
  let i = 0;
  valores.forEach((x, k) => Math.abs(x - v) < Math.abs(valores[i] - v) && (i = k));
  return [valores[i], i, (k: number) => fijar(valores[k])] as const;
}
