/*
 * GUION · ¿Cuánto tarda en romperse tu contraseña?
 *
 * Idea: el tiempo de un ataque es alfabeto^longitud / 2 / velocidad. La longitud está en el exponente:
 * pesa más que los símbolos. El hash de la web pesa tanto como tu contraseña. Y lo que no es al azar
 * (palabra con trucos, contraseña filtrada) cae al instante.
 * Intuición que rompe: «Tr0mb@n!» es fuerte porque tiene mayúsculas, números y símbolos.
 * Modelo y fuentes: src/modelo.ts y src/content.ts (Specops 2025, OWASP, EFF, RAE, Planck 2018).
 *
 * | # | Pregunta                         | Control                      | Cambia                       | Debe notar                                 | Patrón |
 * | 1 | ¿Cuánto tarda «Tr0mb@n!»?        | apuesta (7 escalas)          | revelación                   | cae en < 1 ms: no es azar                  | 4      |
 * | 2 | ¿Y si es al azar y más larga?    | longitud l 4–20 (def. 8)     | tiempo, 95^l, barra log      | cada carácter multiplica por 95            | 1      |
 * | 3 | ¿Símbolos o longitud?            | alfabeto a · letras extra e  | dos marcas en la misma barra | 4 minúsculas más > todo el teclado         | 6      |
 * | 4 | ¿Y quién ataca?                  | hash h · GPU g               | la barra entera se desplaza  | bcrypt 10 vs MD5: ×23 millones             | 2      |
 * | 5 | ¿Y las frases de palabras?       | palabras k 3–7 (def. 5)      | tres marcas                  | 5 palabras > 8 al azar >> palabra trucos   | 1      |
 * | 6 | Ahora tú                         | todos + compartir            | sandbox                      | transferir a su caso                        | 9      |
 *
 * Estados QA: "" · l=4 · l=20 · a=digitos · e=0 · e=6 · h=bcrypt10 · g=10000 · h=bcrypt10&g=1&l=20 · h=md5&g=10000&l=4
 *   · k=3 · k=7 · t=frase · t=frase&k=7&h=bcrypt10 · t=azar&a=digitos&l=4&g=10000
 */
import {useRef, useState} from 'react';
import {BarraLog} from './components/BarraLog';
import {Deslizador} from './components/Deslizador';
import {Opciones} from './components/Opciones';
import {Prediccion} from './components/Prediccion';
import {contenido as c} from './content';
import {useBucle} from './hooks/useBucle';
import {useMovimientoReducido} from './hooks/useMovimientoReducido';
import {useOpcion, useParametro} from './hooks/useParametro';
import {useVisible} from './hooks/useVisible';
import {grande, num} from './lib/math';
import {
  ALFABETOS,
  bits,
  cientifico,
  escalaDe,
  espacioAzar,
  espacioFrase,
  espacioTrucos,
  GPUS,
  HASHES,
  tiempoLegible,
  tiempoMedio,
  velocidad,
  VARIANTES_TRUCOS,
  PALABRAS_DLE,
  type Alfabeto,
  type Gpus,
  type Hash,
} from './modelo';

const CLAVES_ALFABETO = Object.keys(ALFABETOS) as Alfabeto[];
const CLAVES_HASH = Object.keys(HASHES) as Hash[];
const CLAVES_GPU = Object.keys(GPUS) as Gpus[];
const caracteres = (n: number) => `${n} ${n === 1 ? 'carácter' : 'caracteres'}`;
const palabras = (n: number) => `${n} ${n === 1 ? 'palabra' : 'palabras'}`;
const veces = (x: number) =>
  x < 1 ? `÷${num(Math.round(1 / x))}` : `×${x >= 1e6 ? grande(Number(x.toPrecision(2))) : num(Math.round(x))}`;

function Seccion({id, num: n, titulo, children}: {id: string; num: number; titulo: string; children: React.ReactNode}) {
  return (
    <section className="mt-20 sm:mt-28" aria-labelledby={id}>
      <p className="font-mono text-etiqueta uppercase text-acento">{String(n).padStart(2, '0')}</p>
      <h2 id={id} className="mt-2 font-display text-display text-balance">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Entero en millones y luego billones con un decimal: sin cifras que bailen. */
const contadorTexto = (n: number) => (n < 1e12 ? `${num(Math.round(n / 1e6))} millones` : `${num(Number((n / 1e12).toFixed(1)))} billones`);

function Contador() {
  const reducido = useMovimientoReducido();
  const [ref, visible] = useVisible<HTMLDivElement>();
  const n = useRef(0);
  const [, setTic] = useState(0);
  useBucle(!reducido && visible, (dt) => {
    n.current += HASHES.md5 * dt;
    setTic((t) => t + 1);
  });
  return (
    <div ref={ref} className="tarjeta mt-10 flex items-center gap-5">
      <svg viewBox="0 0 48 60" className="w-10 shrink-0 sm:w-12" aria-hidden>
        <path d="M12 26V17a12 12 0 0 1 24 0v9" fill="none" className="stroke-acento" strokeWidth="5" />
        <rect x="4" y="26" width="40" height="32" rx="6" className="fill-acento" />
        <circle cx="24" cy="40" r="4" className="fill-acento-2" />
        <rect x="22" y="42" width="4" height="9" rx="2" className="fill-acento-2" />
      </svg>
      <div>
        {reducido ? (
          <p className="font-cifra text-lead">219.500 millones por segundo</p>
        ) : (
          <p className="font-cifra text-display tabular-nums leading-none">{contadorTexto(n.current)}</p>
        )}
        <p className="mt-2 text-body text-texto-2">{reducido ? 'contraseñas que prueba una sola tarjeta gráfica (MD5).' : c.contador}</p>
      </div>
    </div>
  );
}

function Compartir() {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      className="boton"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(location.href);
          setHecho(true);
          setTimeout(() => setHecho(false), 2000);
        } catch {
          /* sin portapapeles: la URL ya está en la barra */
        }
      }}
    >
      {hecho ? 'Enlace copiado' : 'Copiar enlace a este estado'}
    </button>
  );
}

export default function App() {
  const [l, setL] = useParametro('l', 8, 4, 20);
  const [a, setA] = useOpcion<Alfabeto>('a', 'teclado', CLAVES_ALFABETO);
  const [e, setE] = useParametro('e', 4, 0, 6);
  const [h, setH] = useOpcion<Hash>('h', 'md5', CLAVES_HASH);
  const [g, setG] = useOpcion<Gpus>('g', '1', CLAVES_GPU);
  const [k, setK] = useParametro('k', 5, 3, 7);
  const [t, setT] = useOpcion<'azar' | 'frase'>('t', 'azar', ['azar', 'frase']);

  const base = velocidad('md5', '1');
  const v = velocidad(h, g);

  // 1 · apuesta
  const segTrucos1 = tiempoMedio(espacioTrucos(), base);
  const segAzar8 = tiempoMedio(espacioAzar(95, 8), base);

  // 2 · longitud
  const esp2 = espacioAzar(95, l);
  const seg2 = tiempoMedio(esp2, base);

  // 3 · base frente a exponente (todo sobre 8 minúsculas)
  const esp3base = espacioAzar(26, 8);
  const esp3a = espacioAzar(ALFABETOS[a], 8);
  const esp3e = espacioAzar(26, 8 + e);
  const etiquetaA = c.alfabetos.find((x) => x.valor === a)!.texto;
  const letrasMas = `${e} ${e === 1 ? 'letra más' : 'letras más'} en minúscula ${e === 1 ? 'pesa' : 'pesan'}`;
  const mensaje3 =
    a === 'minusculas' && e === 0
      ? 'Empate: es la misma contraseña.'
      : a === 'digitos' && e === 0
        ? 'Solo dígitos encoge la base: peor que 8 minúsculas.'
        : esp3e > esp3a
          ? `Gana la longitud: ${letrasMas} más que ${a === 'digitos' ? 'quedarse en dígitos' : a === 'minusculas' ? 'no cambiar nada' : `pasar a ${etiquetaA.toLowerCase()}`}.`
          : esp3e === esp3a
            ? 'Empate.'
            : 'De momento gana el alfabeto. Añade letras: con 4 en minúscula ya superas a todo el teclado.';

  // 4 · atacante
  const seg4 = tiempoMedio(esp2, v);

  // 5 · frases
  const seg5 = {trucos: tiempoMedio(espacioTrucos(), v), azar: tiempoMedio(espacioAzar(95, 8), v), frase: tiempoMedio(espacioFrase(k), v)};

  // 6 · sandbox
  const esp6 = t === 'azar' ? espacioAzar(ALFABETOS[a], l) : espacioFrase(k);
  const seg6 = tiempoMedio(esp6, v);
  const hashTexto = c.hashes.find((x) => x.valor === h)!.texto;
  const gpuTexto = c.gpus.find((x) => x.valor === g)!.texto;

  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-5 sm:py-24">
      <header>
        <p className="font-mono text-etiqueta uppercase text-acento">Un explorable de combinatoria</p>
        <h1 className="mt-4 font-display text-hero text-balance">{c.titulo}</h1>
        <p className="mt-6 text-lead text-texto-2 text-pretty">{c.entradilla}</p>
        <Contador />
      </header>

      <Seccion id="s1" num={1} titulo="Apuesta antes de mirar">
        <p className="mt-4 text-body text-pretty">
          Tiene mayúscula, número, arroba y exclamación. Pasa el filtro de casi cualquier formulario. Un atacante con una sola tarjeta gráfica tiene el hash
          robado de <span className="clave">{c.ejemplo}</span>. ¿Cuánto tarda en sacarla?
        </p>
        <div className="mt-6">
          <Prediccion
            pregunta={`¿Cuánto tarda en caer «${c.ejemplo}»?`}
            min={0}
            max={6}
            correcta={escalaDe(segTrucos1)}
            formato={(i) => c.escalasApuesta[i]}
            revelacion={(ap) => (
              <>
                <p>
                  {ap === 0 ? 'Acertaste. ' : `Apostaste «${c.escalasApuesta[ap]}». `}
                  El atacante no prueba letras al azar: prueba las {grande(PALABRAS_DLE)} palabras del diccionario con {num(VARIANTES_TRUCOS)} trucos cada una
                  (mayúscula, @ por a, 0 por o, un símbolo al final…). Son {cientifico(espacioTrucos())} intentos: {tiempoLegible(segTrucos1)}.
                </p>
                <p className="mt-2">
                  Si de verdad fueran 8 caracteres al azar tardaría {tiempoLegible(segAzar8)}. Tampoco es mucho. Sigue bajando.
                </p>
              </>
            )}
          />
        </div>
      </Seccion>

      <Seccion id="s2" num={2} titulo="Cada carácter multiplica">
        <p className="mt-4 text-body text-pretty">
          Olvida los trucos: caracteres elegidos de verdad al azar entre las 95 teclas imprimibles. Con 8 hay 95 × 95 × … ocho veces. Cada carácter que añades
          multiplica todo por 95.
        </p>
        <div className="tarjeta mt-6">
          <Deslizador etiqueta="Longitud" valor={l} min={4} max={20} onCambio={setL} formato={caracteres} />
          <div aria-live="polite">
            <p className="mt-6 font-cifra text-display leading-tight tabular-nums">{tiempoLegible(seg2)}</p>
            <p className="mt-1 text-body text-texto-2">
              95<sup>{l}</sup> = {cientifico(esp2)} combinaciones · {num(Math.round(bits(esp2)))} bits · MD5 con 1 GPU
            </p>
          </div>
          <div className="mt-8">
            <BarraLog etiqueta="Tiempo medio en escala logarítmica" marcas={[{seg: seg2, texto: caracteres(l)}]} />
          </div>
        </div>
        <p className="mt-4 text-body text-texto-2 text-pretty">
          Fíjate en la barra: cada paso del deslizador avanza lo mismo, casi dos marcas de 10. Es lo que hace una escala logarítmica: convierte «multiplicar» en
          «sumar». Por eso de 8 a 12 caracteres se pasa de horas a milenios.
        </p>
      </Seccion>

      <Seccion id="s3" num={3} titulo="¿Más símbolos o más largo?">
        <p className="mt-4 text-body text-pretty">
          Parte de 8 minúsculas al azar. Puedes ensanchar la base (más tipos de carácter) o alargar el exponente (más letras). Las dos opciones, en la misma barra.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="tarjeta">
            <Opciones etiqueta="Base: alfabeto, 8 caracteres" valor={a} opciones={c.alfabetos} onCambio={setA} />
            <p className="mt-4 font-cifra text-lead tabular-nums">{veces(esp3a / esp3base)}</p>
            <p className="text-body text-texto-2">frente a 8 minúsculas</p>
          </div>
          <div className="tarjeta">
            <Deslizador etiqueta="Exponente: minúsculas extra" valor={e} min={0} max={6} onCambio={setE} formato={(x) => `+${x}`} />
            <p className="mt-4 font-cifra text-lead tabular-nums">{veces(esp3e / esp3base)}</p>
            <p className="text-body text-texto-2">{caracteres(8 + e)} en minúscula</p>
          </div>
        </div>
        <div className="tarjeta mt-4" aria-live="polite">
          <BarraLog
            etiqueta="Base frente a exponente, MD5 con 1 GPU"
            marcas={[
              {seg: tiempoMedio(esp3a, base), texto: `${etiquetaA}, 8`, tono: 'acento'},
              {seg: tiempoMedio(esp3e, base), texto: `Minúsculas, ${8 + e}`, tono: 'rojo'},
            ]}
          />
          <p className="mt-2 text-body text-pretty">
            {mensaje3}
          </p>
        </div>
      </Seccion>

      <Seccion id="s4" num={4} titulo="Quién ataca y cómo guardó la web tu contraseña">
        <p className="mt-4 text-body text-pretty">
          Las webs no guardan tu contraseña, guardan su hash. Si usan uno rápido (MD5), cada intento cuesta casi nada. Si usan uno lento a propósito (bcrypt), cada
          intento cuesta miles de veces más. Y el atacante puede alquilar más tarjetas.
        </p>
        <div className="tarjeta mt-6">
          <div className="grid gap-5">
            <Opciones etiqueta="Hash de la web" valor={h} opciones={c.hashes} onCambio={setH} />
            <Opciones etiqueta="Tarjetas gráficas del atacante" valor={g} opciones={c.gpus} onCambio={setG} />
          </div>
          <div aria-live="polite">
            <p className="mt-6 font-cifra text-display leading-tight tabular-nums">{tiempoLegible(seg4)}</p>
            <p className="mt-1 text-body text-texto-2">
              Tu contraseña de la sección 2 ({caracteres(l)} al azar) · {grande(v)} intentos por segundo
            </p>
          </div>
          <ul className="mt-5 grid gap-1 text-body">
            {c.hashes.map((x) => (
              <li key={x.valor} className={`flex flex-wrap justify-between gap-x-4 rounded-md px-2 py-1 ${x.valor === h ? 'bg-elevado font-semibold' : 'text-texto-2'}`}>
                <span>
                  {x.texto} <span className="font-normal text-texto-3">({x.nota})</span>
                </span>
                <span className="tabular-nums">{tiempoLegible(tiempoMedio(esp2, velocidad(x.valor as Hash, g)))}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <BarraLog etiqueta="Tiempo con este atacante" marcas={[{seg: seg4, texto: `${hashTexto}, ${gpuTexto}`}]} />
          </div>
        </div>
        <p className="mt-4 text-body text-texto-2 text-pretty">
          De MD5 a bcrypt 10 el tiempo se multiplica por {grande(Math.round(HASHES.md5 / HASHES.bcrypt10 / 1e6) * 1e6)}. Eso no lo decides tú, lo decide la web. Lo
          que sí decides tú es la longitud.
        </p>
      </Seccion>

      <Seccion id="s5" num={5} titulo="El atacante no prueba al azar">
        <p className="mt-4 text-body text-pretty">
          Lo que una persona inventa se parece a otras: palabras, nombres, fechas, la @ en vez de la a. Por eso <span className="clave">{c.ejemplo}</span> caía al
          instante. La salida es dejar que elija el azar, también con palabras: tira dados y coge palabras de una lista de 7.776 (Diceware). Aunque el atacante
          conozca la lista, cada palabra multiplica por 7.776.
        </p>
        <div className="tarjeta mt-6">
          <Deslizador etiqueta="Palabras al azar" valor={k} min={3} max={7} onCambio={setK} formato={palabras} />
          <p className="mt-3 font-mono text-body text-texto-2">{c.frase.split(' ').slice(0, k).join(' ')}{k > 5 ? ' …' : ''}</p>
          <div className="mt-6" aria-live="polite">
            <BarraLog
              etiqueta={`Tres contraseñas con ${hashTexto} y ${gpuTexto}`}
              marcas={[
                {seg: seg5.trucos, texto: `«${c.ejemplo}», con trucos`, tono: 'rojo'},
                {seg: seg5.azar, texto: '8 caracteres al azar', tono: 'acento'},
                {seg: seg5.frase, texto: palabras(k), tono: 'lima'},
              ]}
            />
            <p className="mt-2 text-body text-pretty">
              {palabras(k)} = {num(Math.round(bits(espacioFrase(k))))} bits, frente a {num(Math.round(bits(espacioAzar(95, 8))))} de 8 caracteres al azar.{' '}
              {k === 4 ? 'Cuatro palabras empatan con ellos; cinco ya ganan de lejos, y se recuerdan mejor.' : k < 4 ? 'Con tres se quedan cortas.' : 'Y se recuerdan mejor.'}
            </p>
          </div>
        </div>
        <p className="mt-4 rounded-lg border-l-4 border-acento-3 bg-superficie p-4 text-body text-pretty">
          Una advertencia que ninguna barra recoge: si tu contraseña ya salió en una filtración, está en las listas que los atacantes prueban primero. Da igual su
          longitud: cae al instante. Una distinta en cada sitio.
        </p>
      </Seccion>

      <Seccion id="s6" num={6} titulo="Ahora tú">
        <div className="tarjeta mt-6">
          <div className="grid gap-5">
            <Opciones
              etiqueta="Tipo"
              valor={t}
              opciones={[
                {valor: 'azar', texto: 'Caracteres al azar'},
                {valor: 'frase', texto: 'Palabras al azar'},
              ]}
              onCambio={setT}
            />
            {t === 'azar' ? (
              <>
                <Opciones etiqueta="Alfabeto" valor={a} opciones={c.alfabetos} onCambio={setA} />
                <Deslizador etiqueta="Longitud" valor={l} min={4} max={20} onCambio={setL} formato={caracteres} />
              </>
            ) : (
              <Deslizador etiqueta="Palabras" valor={k} min={3} max={7} onCambio={setK} formato={palabras} />
            )}
            <Opciones etiqueta="Hash de la web" valor={h} opciones={c.hashes} onCambio={setH} />
            <Opciones etiqueta="Tarjetas gráficas" valor={g} opciones={c.gpus} onCambio={setG} />
          </div>
          <div aria-live="polite">
            <p className="mt-8 font-cifra text-display leading-tight tabular-nums">{tiempoLegible(seg6)}</p>
            <p className="mt-1 text-body text-texto-2">
              {cientifico(esp6)} combinaciones · {num(Math.round(bits(esp6)))} bits
            </p>
          </div>
          <div className="mt-8">
            <BarraLog etiqueta="Tu contraseña" marcas={[{seg: seg6, texto: t === 'azar' ? caracteres(l) : palabras(k)}]} />
          </div>
          <div className="mt-6">
            <Compartir />
          </div>
        </div>
      </Seccion>

      <footer className="mt-24 border-t border-borde pt-8 text-body text-texto-2">
        <p className="text-lead text-texto text-pretty">{c.cierre}</p>
        <p className="mt-6 text-pretty">{c.simplificaciones}</p>
        <h2 className="mt-8 text-etiqueta uppercase text-texto-3">Fuentes</h2>
        <ul className="mt-2 grid gap-1">
          {c.fuentes.map((f) => (
            <li key={f.url}>
              <a href={f.url} className="underline decoration-borde underline-offset-2 hover:decoration-acento">
                {f.texto}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-etiqueta uppercase text-texto-3">{c.pie}</p>
      </footer>
    </main>
  );
}
