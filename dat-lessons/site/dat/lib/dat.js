'use strict';
// DAT book library: schematic red cells and the molecules the DAT is about. Shape and colour both encode identity:
//   red cell = disc with paler centre (face-on view; schematic, not to scale)
//   IgG = near-black Y bound by its two Fab arms to the membrane, Fc stem pointing outward
//   C3d = amber diamond on the membrane      AHG (anti-human globulin) = purple Y with round binding tips
// Orientation of IgG (Fab on antigen, Fc outward) is standard immunology; the source infographic does not state it.
const DAT = {
  red: '#c3313a', redEdge: '#7e1520', igg: '#262a31', c3d: '#b35c00', ahg: '#762cc0', check: '#22262c',
};
function datDefs() {
  if (document.getElementById('rbcGrad')) return;
  const defs = mk('defs', {}, document.getElementById('stage'));
  const g = mk('radialGradient', { id: 'rbcGrad', cx: '50%', cy: '50%', r: '50%' }, defs);
  [[0, '#f3bbb6'], [.24, '#eda39e'], [.5, '#d5524f'], [.82, '#c3313a'], [1, '#a1212b']].forEach(([o, c]) =>
    mk('stop', { offset: o, 'stop-color': c }, g));
}
// A red cell drawn around its own origin; place it with put()/tween x,y. r is the radius in stage px.
function datCell(p, x, y, r = 60, { check = false } = {}) {
  datDefs();
  const g = G(p, { x, y });
  mk('circle', { r, fill: 'url(#rbcGrad)', stroke: DAT.redEdge, 'stroke-width': 1.5 }, g);
  if (check) mk('circle', { r: r + 8, fill: 'none', stroke: DAT.check, 'stroke-width': 3 }, g);
  g.r0 = r;
  return g;
}
const datUnit = a => { const t = a * Math.PI / 180; return [Math.sin(t), -Math.cos(t)]; };   // 0 deg = up, clockwise
// Geometry shared by IgG and AHG so bridges meet: lengths scale with the cell radius.
const datGeo = r => { const k = r / 60; return { half: 11 * k, hinge: 17 * k, fc: 20 * k, w: 4.5 * Math.sqrt(k), tip: 4 * k, gap: 26 * k }; };
// IgG on the membrane of cell `cell` at membrane angle `a`; returns the group (state o for reveals).
function datIgG(cell, a, { o = 1 } = {}) {
  const r = cell.r0, q = datGeo(r), [dx, dy] = datUnit(a), wx = -dy, wy = dx;
  const bx = dx * r, by = dy * r, hx = bx + dx * q.hinge, hy = by + dy * q.hinge, fx = hx + dx * q.fc, fy = hy + dy * q.fc;
  const d = `M${bx - wx * q.half} ${by - wy * q.half}L${hx} ${hy}L${bx + wx * q.half} ${by + wy * q.half}M${hx} ${hy}L${fx} ${fy}`;
  const g = G(cell, { o });
  path(g, d, { stroke: DAT.igg, 'stroke-width': q.w, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  return g;
}
// C3d fragment on the membrane.
function datC3d(cell, a, { o = 1 } = {}) {
  const r = cell.r0, k = r / 60, [dx, dy] = datUnit(a), cx = dx * (r + 9 * k), cy = dy * (r + 9 * k);
  const g = G(cell, { o });
  path(g, `M${cx} ${cy - 9 * k}L${cx + 7 * k} ${cy}L${cx} ${cy + 9 * k}L${cx - 7 * k} ${cy}Z`, { fill: DAT.c3d, stroke: DAT.c3d, 'stroke-width': 1 });
  return g;
}
// AHG drawn in its own frame: binding tips at (-gap/2, 0) and (gap/2, 0), body toward +y. Place with x, y, r (degrees).
function datAhg(p, r = 60, st0 = {}) {
  const q = datGeo(r), h = q.gap / 2;
  const g = G(p, st0);
  path(g, `M${-h} 0L0 ${q.hinge}L${h} 0M0 ${q.hinge}L0 ${q.hinge + q.fc}`, { stroke: DAT.ahg, 'stroke-width': q.w + .5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
  mk('circle', { cx: -h, cy: 0, r: q.tip, fill: DAT.ahg }, g);
  mk('circle', { cx: h, cy: 0, r: q.tip, fill: DAT.ahg }, g);
  return g;
}
// Where the Fc end of an IgG at membrane angle a sits, for a cell centred at (x, y).
function datFcEnd(x, y, r, a) { const q = datGeo(r), [dx, dy] = datUnit(a), L = r + q.hinge + q.fc; return [x + dx * L, y + dy * L]; }
// A small key: [['igg','IgG'], ...] at x, y.
function datKey(p, items, x, y, t0) {
  const g = G(p, { x, y, o: 0 });
  items.forEach(([kind, label], i) => {
    const row = G(g, { y: i * 44 });
    if (kind === 'rbc') datCell(row, 14, 0, 13);
    if (kind === 'igg') { const c = G(row, { x: 14, y: 14 }); c.r0 = 0; path(c, 'M-8 0L0 -12L8 0M0 -12L0 -26', { stroke: DAT.igg, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }); }
    if (kind === 'c3d') path(row, 'M14 -10L21 0L14 10L7 0Z', { fill: DAT.c3d });
    if (kind === 'ahg') datAhg(row, 50, { x: 14, y: -12 });
    if (kind === 'check') datCell(row, 14, 0, 12, { check: true });
    T(row, label, { x: 44, y: 9, size: 24, fill: COL.dim });
  });
  show(g, t0);
  return g;
}
