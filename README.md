# ¿Cuánto tarda en romperse tu contraseña?

Explorable de combinatoria con escalas logarítmicas: por qué la longitud pesa más que los símbolos, por qué el hash que usa la web pesa tanto como tu contraseña, y por qué lo que inventa una persona (o lo que ya se filtró) cae al instante.

## Modelo

`tiempo medio = espacio / 2 / velocidad`

- Al azar: `alfabeto ^ longitud` (10, 26, 52 o 95 símbolos).
- Frase Diceware: `7776 ^ palabras`.
- Palabra con trucos: 93.111 entradas del DLE × 1.088 variantes (mayúscula inicial, a→@, o→0, e→3, i→1, un símbolo final opcional).
- Velocidad: RTX 5090 con hashcat (MD5 219,5 GH/s; bcrypt coste 5, 304,8 kH/s; coste 10 = coste 5 / 32) × número de GPU.

Simplificaciones, dichas en la página: tiempo medio, GPU que escalan sin pérdidas, atacante con el hash ya robado (ataque fuera de línea).

Código: `src/modelo.ts` (funciones puras) y `tests/modelo.test.ts` (`npm test`). Textos y fuentes: `src/content.ts`.

## Fuentes

- Specops Software, benchmark de hashcat en RTX 5090 (2025): https://specopssoft.com/blog/gpu-password-cracking-nvidia-amd/
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- EFF Diceware: https://www.eff.org/dice
- RAE, DLE 23.ª edición: https://www.rae.es/dle-23.a-edici%C3%B3n
- Planck 2018: https://arxiv.org/abs/1807.06209
- INE, esperanza de vida: https://www.ine.es/

Sin imágenes generadas con IA. Sin cookies ni analítica.

## Local

```bash
npm install
npm run dev   # http://127.0.0.1:3027/
```

Hecho con la skill web-explorable.
