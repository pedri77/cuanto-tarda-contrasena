/**
 * El modelo, en funciones puras (sin React ni DOM) para probarlo con node --test.
 *
 * Tiempo medio de un ataque = espacio de búsqueda / 2 / velocidad del atacante.
 * Espacio: alfabeto^longitud (al azar), lista^palabras (Diceware) o palabras × variantes (palabra con trucos).
 * Velocidad: hashes por segundo de una GPU × número de GPU (escalado lineal, simplificación declarada).
 */
import {grande, num} from './lib/math.ts';

export const ALFABETOS = {digitos: 10, minusculas: 26, letras: 52, teclado: 95} as const;
export type Alfabeto = keyof typeof ALFABETOS;

/** Hashes por segundo de una RTX 5090 (Specops 2025). bcrypt 10 deriva de bcrypt 5: cada punto de coste duplica el trabajo. */
export const HASHES = {md5: 219.5e9, bcrypt5: 304.8e3, bcrypt10: 304.8e3 / 2 ** 5} as const;
export type Hash = keyof typeof HASHES;

export const GPUS = {'1': 1, '12': 12, '10000': 10_000} as const;
export type Gpus = keyof typeof GPUS;

/** Lista larga Diceware de la EFF. */
export const LISTA_DICEWARE = 7776;
/** Entradas del Diccionario de la lengua española, 23.ª edición (RAE). */
export const PALABRAS_DLE = 93_111;
/**
 * Variantes de una palabra con «trucos» que prueba una regla de ataque sencilla:
 * mayúscula inicial o no (×2) · a→@, o→0, e→3, i→1 cada una sí o no (×2⁴) · ningún símbolo o uno de 33 al final (×34).
 */
export const VARIANTES_TRUCOS = 2 * 2 ** 4 * 34;

export const espacioAzar = (alfabeto: number, longitud: number) => alfabeto ** longitud;
export const espacioFrase = (palabras: number, lista = LISTA_DICEWARE) => lista ** palabras;
export const espacioTrucos = (palabras = PALABRAS_DLE, variantes = VARIANTES_TRUCOS) => palabras * variantes;

export const velocidad = (hash: Hash, gpus: Gpus) => HASHES[hash] * GPUS[gpus];

/** Segundos de media hasta acertar: de media se recorre la mitad del espacio. */
export const tiempoMedio = (espacio: number, porSegundo: number) => espacio / 2 / porSegundo;

/** Bits de entropía de un espacio uniforme. */
export const bits = (espacio: number) => Math.log2(espacio);

export const SEG_AÑO = 31_557_600;
export const SEG_UNIVERSO = 13.787e9 * SEG_AÑO; // Planck 2018

/** Rango de la barra logarítmica, en potencias de 10 de segundos. */
export const LOG_MIN = -6;
export const LOG_MAX = 30;

/** Posición 0–1 en la barra logarítmica (fuera de rango se pega al borde). */
export const posicionLog = (seg: number, min = LOG_MIN, max = LOG_MAX) => {
  const p = (Math.log10(seg) - min) / (max - min);
  return Math.min(1, Math.max(0, p));
};

const UNIDADES: [number, string, string][] = [
  [SEG_AÑO, 'año', 'años'],
  [86_400, 'día', 'días'],
  [3_600, 'hora', 'horas'],
  [60, 'minuto', 'minutos'],
  [1, 'segundo', 'segundos'],
];

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const sup = (n: number) => String(n).split('').map((d) => SUP[Number(d)]).join('');

/** «menos de un milisegundo», «35 milisegundos», «4,2 horas», «1,2 millones de años», «unos 10²⁰ años». */
export function tiempoLegible(seg: number) {
  if (!(seg > 0)) return 'al instante';
  if (seg < 1e-3) return 'menos de un milisegundo';
  if (seg < 1) {
    const ms = Math.round(seg * 1000);
    return ms === 1 ? '1 milisegundo' : `${num(ms)} milisegundos`;
  }
  const años = seg / SEG_AÑO;
  if (años < 1e6) {
    for (const [s, uno, varios] of UNIDADES) {
      if (seg >= s) {
        const n = seg / s;
        const v = n >= 10 ? Math.round(n) : Number(n.toFixed(1));
        return `${num(v)} ${v === 1 ? uno : varios}`;
      }
    }
  }
  if (años < 1e15) return `${grande(Number(años.toPrecision(2)))} de años`;
  return `unos 10${sup(Math.floor(Math.log10(años)))} años`;
}

/** Orden de magnitud para la apuesta. Índices de content.escalasApuesta. */
export function escalaDe(seg: number) {
  const años = seg / SEG_AÑO;
  if (seg < 1) return 0;
  if (seg < 3600) return 1;
  if (seg < 86_400) return 2;
  if (años < 1) return 3;
  if (años < 100) return 4;
  if (seg < SEG_UNIVERSO) return 5;
  return 6;
}

/** «6,6 × 10¹⁵» para espacios de búsqueda; por debajo de un millón, la cifra entera. */
export function cientifico(n: number) {
  if (n < 1e6) return num(Math.round(n));
  const e = Math.floor(Math.log10(n));
  return `${num(Number((n / 10 ** e).toFixed(1)))} × 10${sup(e)}`;
}
