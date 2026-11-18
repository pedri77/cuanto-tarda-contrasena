/**
 * Todos los textos y cifras de referencia, con su fuente al lado.
 */
export const contenido = {
  titulo: '¿Cuánto tarda en romperse tu contraseña?',
  entradilla:
    'Una contraseña aguanta lo que tarda un atacante en probar todas las posibles. Esa cuenta es pura combinatoria, y sus números son tan grandes que solo caben en una escala logarítmica.',
  contador: 'contraseñas que una sola tarjeta gráfica habría probado mientras lees esto (MD5).',

  ejemplo: 'Tr0mb@n!',
  frase: 'pila grapa cometa nube brisa',
  escalasApuesta: ['menos de 1 segundo', 'minutos', 'horas', 'días o meses', 'años', 'siglos o más', 'más que la edad del universo'],

  // Velocidades: una RTX 5090 con hashcat. Specops Software, «GPU password cracking: NVIDIA vs AMD» (2025).
  hashes: [
    {valor: 'md5', texto: 'MD5', nota: 'rápido; webs antiguas o mal hechas'},
    {valor: 'bcrypt5', texto: 'bcrypt coste 5', nota: 'lento a propósito'},
    {valor: 'bcrypt10', texto: 'bcrypt coste 10', nota: 'mínimo que recomienda OWASP'},
  ],
  gpus: [
    {valor: '1', texto: '1 GPU'},
    {valor: '12', texto: '12 GPU'},
    {valor: '10000', texto: '10.000 GPU'},
  ],
  alfabetos: [
    {valor: 'digitos', texto: 'Dígitos (10)'},
    {valor: 'minusculas', texto: 'Minúsculas (26)'},
    {valor: 'letras', texto: 'Mayús. y minús. (52)'},
    {valor: 'teclado', texto: 'Todo el teclado (95)'},
  ],

  // Referencias de la barra (segundos).
  referencias: [
    {nombre: '1 s', seg: 1},
    {nombre: '1 hora', seg: 3600},
    {nombre: '1 año', seg: 31_557_600},
    {nombre: 'una vida', seg: 83 * 31_557_600}, // esperanza de vida en España ≈ 83 años (INE, 2023)
    {nombre: 'edad del universo', seg: 13.787e9 * 31_557_600}, // 13.787 millones de años (Planck 2018)
  ],

  cierre:
    'Lo que te protege es la longitud elegida al azar y que la web guarde tu contraseña con un hash lento. Las @ y los 0 no engañan a nadie. Y una contraseña filtrada cae al instante, sea como sea: usa un gestor y una distinta para cada sitio.',
  fuentes: [
    {texto: 'Specops Software: benchmark de hashcat en RTX 5090 (MD5 219,5 GH/s; bcrypt coste 5, 304,8 kH/s), 2025', url: 'https://specopssoft.com/blog/gpu-password-cracking-nvidia-amd/'},
    {texto: 'OWASP Password Storage Cheat Sheet (bcrypt, coste mínimo 10)', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'},
    {texto: 'EFF: lista larga Diceware de 7.776 palabras', url: 'https://www.eff.org/dice'},
    {texto: 'RAE: Diccionario de la lengua española, 23.ª edición (93.111 entradas)', url: 'https://www.rae.es/dle-23.a-edici%C3%B3n'},
    {texto: 'Planck Collaboration 2018: edad del universo, 13.787 millones de años', url: 'https://arxiv.org/abs/1807.06209'},
    {texto: 'INE: esperanza de vida al nacer en España, 2023', url: 'https://www.ine.es/'},
  ],
  simplificaciones:
    'Simplificamos: el tiempo es la media (la mitad del espacio de búsqueda), las GPU se suman sin pérdidas y el atacante ya tiene el hash robado. Una web que limita intentos por internet es otro mundo, mucho más lento.',
  pie: 'Explorable hecho con la skill web-explorable. Sin cookies ni analítica.',
} as const;
