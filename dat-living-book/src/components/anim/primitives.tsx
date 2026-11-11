// Schematic SVG primitives. Not to scale and not microscopy.
// Shape + colour together encode each molecule so meaning never relies on colour alone:
//   IgG  = plain Y (blue)          C3d = diamond (amber)
//   AHG  = Y with round tips (purple)   check cell = red cell with a ring outline

import type { CSSProperties, ReactNode } from 'react';

export const CELL_R = 30;
export const IGG_LEN = 14;

export function moveStyle(x: number, y: number, rot = 0, ms = 700, opacity = 1): CSSProperties {
  return {
    transform: `translate(${x}px, ${y}px) rotate(${rot}deg)`,
    transformBox: 'view-box',
    transformOrigin: '0 0',
    transition: ms ? `transform ${ms}ms ease-in-out, opacity ${ms}ms ease-in-out` : 'none',
    opacity,
  } as CSSProperties;
}

export function RedCell({ check = false, label }: { check?: boolean; label?: string }) {
  return (
    <g>
      <circle r={CELL_R} className="rbc" />
      <circle r={CELL_R * 0.42} className="rbc-pallor" />
      {check && <circle r={CELL_R + 4} className="check-ring" />}
      {label && (
        <text y={4} className="svg-mini" textAnchor="middle">
          {label}
        </text>
      )}
    </g>
  );
}

/** IgG drawn pointing "up" (−y) from the origin; rotate the parent to orient it. */
export function IgGShape() {
  return (
    <g className="igg">
      <line x1={0} y1={0} x2={0} y2={-8} />
      <line x1={0} y1={-8} x2={-5} y2={-IGG_LEN} />
      <line x1={0} y1={-8} x2={5} y2={-IGG_LEN} />
    </g>
  );
}

export function C3dShape() {
  return <path className="c3d" d="M0 -2 L5 -8 L0 -14 L-5 -8 Z" />;
}

/**
 * AHG (anti-human globulin) in local coordinates: its two binding tips sit at
 * (−6,0) and (6,0); hinge at (0,8); stem to (0,20).
 */
export function AhgShape() {
  return (
    <g className="ahg">
      <line x1={0} y1={8} x2={-6} y2={0} />
      <line x1={0} y1={8} x2={6} y2={0} />
      <line x1={0} y1={8} x2={0} y2={20} />
      <circle cx={-6} cy={0} r={2.2} />
      <circle cx={6} cy={0} r={2.2} />
    </g>
  );
}

/** Molecule attached to a cell membrane at `angle` degrees (0 = up, clockwise). */
export function OnMembrane({ angle, children }: { angle: number; children: ReactNode }) {
  return (
    <g transform={`rotate(${angle}) translate(0 ${-CELL_R})`}>{children}</g>
  );
}

export function Legend({ items }: { items: ('rbc' | 'igg' | 'c3d' | 'ahg' | 'check')[] }) {
  const map = {
    rbc: { label: 'Red cell', el: <RedCellIcon /> },
    igg: { label: 'IgG', el: <g transform="translate(9 17)"><IgGShape /></g> },
    c3d: { label: 'C3d (complement)', el: <g transform="translate(9 17)"><C3dShape /></g> },
    ahg: { label: 'AHG (Coombs reagent)', el: <g transform="translate(9 6)"><AhgShape /></g> },
    check: { label: 'Check cell (antibody-coated reagent cell)', el: <CheckIcon /> },
  } as const;
  return (
    <ul className="legend" aria-label="Legend">
      {items.map((k) => (
        <li key={k}>
          <svg width="20" height="28" viewBox="0 0 18 28" aria-hidden="true">
            {map[k].el}
          </svg>
          {map[k].label}
        </li>
      ))}
    </ul>
  );
}

function RedCellIcon() {
  return (
    <g transform="translate(9 14) scale(0.27)">
      <RedCell />
    </g>
  );
}
function CheckIcon() {
  return (
    <g transform="translate(9 14) scale(0.25)">
      <RedCell check />
    </g>
  );
}

/** Illustrative test tube: dispersed suspension vs visible clumps. Not a grading reference. */
export function Tube({ agglutinated, label, ms = 600 }: { agglutinated: boolean | null; label?: string; ms?: number }) {
  const dots = [
    [30, 70], [44, 82], [26, 96], [50, 104], [36, 116], [22, 130], [48, 136], [34, 150], [28, 112], [46, 92], [40, 126], [30, 140],
  ];
  const clumpCenters = [
    [33, 112], [44, 138],
  ];
  const t = ms ? `all ${ms}ms ease-in-out` : 'none';
  return (
    <figure className="tube-fig">
      <svg viewBox="0 0 72 180" width="72" height="180" role="img" aria-label={label ?? (agglutinated ? 'Tube with visible red cell clumps' : agglutinated === false ? 'Tube with evenly dispersed red cells, no clumps' : 'Empty tube')}>
        <path className="tube-glass" d="M14 8 H58 V150 A22 22 0 0 1 14 150 Z" />
        {agglutinated !== null && <path className="tube-liquid" d="M16 60 H56 V150 A20 20 0 0 1 16 150 Z" />}
        {agglutinated === false &&
          dots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} className="tube-dot" style={{ transition: t }} />)}
        {agglutinated === true &&
          clumpCenters.map(([cx, cy], i) => (
            <g key={i} style={{ transition: t }}>
              {[[0, 0], [6, 2], [-5, 4], [2, -6], [-3, -4], [5, -3], [-6, -1], [1, 6]].map(([dx, dy], j) => (
                <circle key={j} cx={cx + dx} cy={cy + dy} r={3.4} className="tube-clump" />
              ))}
            </g>
          ))}
      </svg>
      {label && <figcaption>{label}</figcaption>}
    </figure>
  );
}
