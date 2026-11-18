import {num} from './math';

/** Porcentaje legible: «9 %», «0,5 %», «0,01 %». Nunca «0 %» si no es cero. */
export function pct(fraccion: number) {
  const v = fraccion * 100;
  if (v === 0) return '0\u00a0%';
  if (v >= 10) return `${num(Math.round(v))}\u00a0%`;
  if (v >= 1) return `${num(Math.round(v * 10) / 10)}\u00a0%`;
  if (v >= 0.1) return `${num(Math.round(v * 100) / 100)}\u00a0%`;
  return `${num(Number(v.toPrecision(1)))}\u00a0%`;
}

export const plural = (n: number, uno: string, varios: string) => `${num(n)} ${n === 1 ? uno : varios}`;
