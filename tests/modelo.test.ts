import {test} from 'node:test';
import assert from 'node:assert/strict';
// Importa con extensión: Node ≥ 22.18 quita los tipos solo.
import {
  ALFABETOS,
  bits,
  escalaDe,
  espacioAzar,
  espacioFrase,
  espacioTrucos,
  posicionLog,
  SEG_UNIVERSO,
  tiempoLegible,
  tiempoMedio,
  velocidad,
} from '../src/modelo.ts';

test('8 caracteres de todo el teclado con MD5 en una GPU: unas 4 horas de media', () => {
  const s = tiempoMedio(espacioAzar(ALFABETOS.teclado, 8), velocidad('md5', '1'));
  assert.ok(s > 4 * 3600 && s < 4.5 * 3600, String(s));
});

test('cuatro letras minúsculas más pesan más que pasar a todo el teclado', () => {
  const base = espacioAzar(26, 8);
  const teclado = espacioAzar(95, 8) / base;
  const cuatroMas = espacioAzar(26, 12) / base;
  assert.ok(teclado > 3e4 && teclado < 3.3e4, String(teclado));
  assert.ok(Math.abs(cuatroMas - 26 ** 4) < 1);
  assert.ok(cuatroMas > teclado);
});

test('cuatro palabras Diceware rondan 8 caracteres al azar; cinco los superan', () => {
  assert.ok(Math.abs(bits(espacioFrase(4)) - bits(espacioAzar(95, 8))) < 1.5);
  assert.ok(espacioFrase(5) > espacioAzar(95, 8) * 1000);
});

test('una palabra con trucos cae en menos de un milisegundo con MD5', () => {
  assert.ok(tiempoMedio(espacioTrucos(), velocidad('md5', '1')) < 1e-3);
});

test('bcrypt 10 es 32 veces más lento que bcrypt 5', () => {
  assert.equal(velocidad('bcrypt5', '1') / velocidad('bcrypt10', '1'), 32);
});

test('posición log: bordes', () => {
  assert.equal(posicionLog(1e-12), 0);
  assert.equal(posicionLog(1e40), 1);
  assert.equal(posicionLog(1), 6 / 36);
});

test('tiempo legible en cada tramo', () => {
  assert.equal(tiempoLegible(0), 'al instante');
  assert.equal(tiempoLegible(1e-6), 'menos de un milisegundo');
  assert.equal(tiempoLegible(0.035), '35 milisegundos');
  assert.equal(tiempoLegible(0.001), '1 milisegundo');
  assert.equal(tiempoLegible(4.2 * 3600), '4,2 horas');
  assert.equal(tiempoLegible(SEG_UNIVERSO), '14.000 millones de años');
  assert.equal(tiempoLegible(1e30), 'unos 10²² años');
  for (const s of [1e-9, 0.5, 59, 3e7, 1e15, 1e22, 1e35]) assert.doesNotMatch(tiempoLegible(s), /NaN|Infinity|undefined/);
});

test('escalas de la apuesta', () => {
  assert.equal(escalaDe(0.0001), 0);
  assert.equal(escalaDe(4 * 3600), 2);
  assert.equal(escalaDe(SEG_UNIVERSO * 2), 6);
});
