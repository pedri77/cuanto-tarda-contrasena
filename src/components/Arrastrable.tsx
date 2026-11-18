import {useRef} from 'react';

type Props = {
  /** Posición en coordenadas del viewBox del SVG padre. */
  x: number;
  y: number;
  onMover: (x: number, y: number) => void;
  etiqueta: string;
  /** Paso de teclado en unidades del viewBox. */
  pasoTeclado?: number;
  r?: number;
};

/**
 * Punto arrastrable dentro de un <svg viewBox>. Ratón, táctil (pointer events + touch-action: none)
 * y teclado (flechas; Mayús multiplica por 5). Convierte coordenadas de pantalla a las del viewBox
 * con getScreenCTM, así funciona a cualquier tamaño.
 */
export function Arrastrable({x, y, onMover, etiqueta, pasoTeclado = 5, r = 10}: Props) {
  const arrastrando = useRef(false);
  const aSvg = (e: React.PointerEvent<SVGCircleElement>) => {
    const svg = e.currentTarget.ownerSVGElement!;
    const m = svg.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return [p.x, p.y] as const;
  };
  return (
    <circle
      cx={x}
      cy={y}
      r={r}
      className="arrastrable"
      role="slider"
      tabIndex={0}
      aria-label={etiqueta}
      aria-valuetext={`x ${Math.round(x)}, y ${Math.round(y)}`}
      onPointerDown={(e) => {
        arrastrando.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => arrastrando.current && onMover(...aSvg(e))}
      onPointerUp={() => (arrastrando.current = false)}
      onKeyDown={(e) => {
        const d = pasoTeclado * (e.shiftKey ? 5 : 1);
        const mov: Record<string, [number, number]> = {ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d]};
        const v = mov[e.key];
        if (!v) return;
        e.preventDefault();
        onMover(x + v[0], y + v[1]);
      }}
    />
  );
}
