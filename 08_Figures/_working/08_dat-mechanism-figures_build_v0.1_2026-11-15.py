"""Build editable PowerPoint mechanism figures for the Direct Antiglobulin Test (DAT).

Source: DAT2.pdf (The Blood Project infographic, single page). Every scientific
statement on the slides is taken from that page; teaching additions are labelled.
All artwork is native PowerPoint shapes (ovals, connectors, text, groups) named
for the Selection Pane. Run:  python3 08_dat-mechanism-figures_build_v0.1_2026-11-15.py OUT.pptx
"""
import math
import sys
from copy import deepcopy

from lxml import etree
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Emu, Pt

E = 914400  # EMU per inch
FONT = 'Arial'

# Palette. RBC/IgG follow the source figure (red cells, near-black IgG). The source
# draws anti-IgG in red; here it is purple with round binding tips for contrast
# against red cells (deviation noted in the speaker notes).
INK = RGBColor(0x1F, 0x23, 0x28)
MUTED = RGBColor(0x5A, 0x62, 0x6C)
IGG = RGBColor(0x26, 0x2A, 0x31)
AHG = RGBColor(0x76, 0x2C, 0xC0)
RED = RGBColor(0xA3, 0x20, 0x2A)
RED_DARK = RGBColor(0x7E, 0x15, 0x20)
TEAL = RGBColor(0x0B, 0x6B, 0x62)
VIVO_BG = RGBColor(0xFB, 0xEC, 0xEC)
VITRO_BG = RGBColor(0xEE, 0xF3, 0xF7)
PANEL = RGBColor(0xF6, 0xF4, 0xF0)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FLAG = RGBColor(0x8A, 0x5A, 0x00)

SOURCE_LINE = 'Source: DAT2.pdf (The Blood Project), p. 1'


def emu(x):
    return Emu(int(round(x * E)))


# ---------------------------------------------------------------- primitives
def set_line(shape, color, width_pt, cap_round=True, dash=None):
    ln = shape.line
    ln.color.rgb = color
    ln.width = Pt(width_pt)
    el = shape._element.spPr.find(qn('a:ln'))
    if cap_round and el is not None:
        el.set('cap', 'rnd')
    if dash:
        ln.dash_style = dash


def line(shapes, p, q, color, width_pt, name):
    c = shapes.add_connector(MSO_CONNECTOR.STRAIGHT, emu(p[0]), emu(p[1]), emu(q[0]), emu(q[1]))
    set_line(c, color, width_pt)
    c.name = name
    return c


def radial_fill(shape, stops):
    """Replace the shape fill with a centred radial gradient. stops: [(pos 0-100, 'RRGGBB')]."""
    spPr = shape._element.spPr
    for tag in ('a:solidFill', 'a:gradFill', 'a:noFill'):
        for el in spPr.findall(qn(tag)):
            spPr.remove(el)
    gs = ''.join(f'<a:gs pos="{int(p * 1000)}"><a:srgbClr val="{c}"/></a:gs>' for p, c in stops)
    xml = (f'<a:gradFill xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" rotWithShape="1">'
           f'<a:gsLst>{gs}</a:gsLst><a:path path="circle">'
           f'<a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path></a:gradFill>')
    geom = spPr.find(qn('a:prstGeom'))
    geom.addnext(etree.fromstring(xml))


def alt_text(shape, text):
    shape._element.xpath('./*[1]/p:cNvPr')[0].set('descr', text)


def text(shapes, x, y, w, h, s, size=14, color=INK, bold=False, align=PP_ALIGN.LEFT, name=None,
         italic=False, anchor=MSO_ANCHOR.TOP):
    tb = shapes.add_textbox(emu(x), emu(y), emu(w), emu(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = anchor
    for m in ('margin_left', 'margin_right', 'margin_top', 'margin_bottom'):
        setattr(tf, m, Emu(0))
    lines = s if isinstance(s, list) else [s]
    for i, ln_ in enumerate(lines):
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = align
        run = para.add_run()
        run.text = ln_
        f = run.font
        f.name, f.size, f.bold, f.italic = FONT, Pt(size), bold, italic
        f.color.rgb = color
    if name:
        tb.name = name
    return tb


def rect(shapes, x, y, w, h, fill, name, line_color=None, shape=MSO_SHAPE.RECTANGLE, radius=None):
    s = shapes.add_shape(shape, emu(x), emu(y), emu(w), emu(h))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line_color is None:
        s.line.fill.background()
    else:
        set_line(s, line_color, 1, cap_round=False)
    if radius is not None:
        s.adjustments[0] = radius
    s.shadow.inherit = False
    s.name = name
    return s


# ---------------------------------------------------------------- biology
def rbc(shapes, c, r, name, check=False):
    """Face-on red cell: disc with paler centre (central pallor of the biconcave shape)."""
    s = shapes.add_shape(MSO_SHAPE.OVAL, emu(c[0] - r), emu(c[1] - r), emu(2 * r), emu(2 * r))
    radial_fill(s, [(0, 'F3BBB6'), (24, 'EDA39E'), (50, 'D5524F'), (82, 'C3313A'), (100, 'A1212B')])
    set_line(s, RED_DARK, 0.75, cap_round=False)
    s.shadow.inherit = False
    s.name = f'{name}_membrane'
    if check:
        ring = shapes.add_shape(MSO_SHAPE.OVAL, emu(c[0] - r - 0.05), emu(c[1] - r - 0.05), emu(2 * r + 0.1), emu(2 * r + 0.1))
        ring.fill.background()
        set_line(ring, INK, 1.75, cap_round=False)
        ring.shadow.inherit = False
        ring.name = f'{name}_checkcell_ring'
    return s


def unit(a_deg):
    a = math.radians(a_deg)
    return (math.sin(a), -math.cos(a))  # 0 deg = up, clockwise


def add(p, v, k=1.0):
    return (p[0] + v[0] * k, p[1] + v[1] * k)


class Geo:
    """Lengths scale with the cell radius so every panel keeps the same proportions."""

    def __init__(self, r):
        self.r = r
        k = r / 0.40
        self.fab_half = 0.075 * k   # half the spread of the Fab arms on the membrane
        self.hinge = 0.115 * k      # membrane -> hinge
        self.fc = 0.135 * k         # hinge -> Fc end
        self.gap = 0.19 * k         # Fc end to Fc end across a bridge
        self.w_igg = 2.75 * k ** 0.5
        self.w_ahg = 3.0 * k ** 0.5
        self.tip = 0.036 * k
        self.reach = r + self.hinge + self.fc  # cell centre -> Fc end
        self.D = 2 * self.reach + self.gap     # centre-to-centre distance of bridged cells


def igg_at(shapes, base, d, g, name):
    """IgG bound by its Fab arms at `base` on a membrane; Fc points along d (outward)."""
    w = (-d[1], d[0])
    h = add(base, d, g.hinge)
    f = add(h, d, g.fc)
    grp = shapes.add_group_shape()
    line(grp.shapes, add(base, w, -g.fab_half), h, IGG, g.w_igg, f'{name}_Fab_L')
    line(grp.shapes, add(base, w, g.fab_half), h, IGG, g.w_igg, f'{name}_Fab_R')
    line(grp.shapes, h, f, IGG, g.w_igg, f'{name}_Fc')
    grp.name = name
    return f


def igg_on_cell(shapes, c, ang, g, name):
    d = unit(ang)
    return igg_at(shapes, add(c, d, g.r), d, g, name)


def ahg(shapes, p1, p2, v, g, name):
    """Anti-IgG (AHG): its two binding tips at p1 and p2 (the Fc ends it binds); body opens toward v."""
    m = ((p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2)
    h = add(m, v, g.hinge)
    s = add(h, v, g.fc)
    grp = shapes.add_group_shape()
    line(grp.shapes, p1, h, AHG, g.w_ahg, f'{name}_Fab_1')
    line(grp.shapes, p2, h, AHG, g.w_ahg, f'{name}_Fab_2')
    line(grp.shapes, h, s, AHG, g.w_ahg, f'{name}_Fc')
    for i, p in enumerate((p1, p2)):
        t = grp.shapes.add_shape(MSO_SHAPE.OVAL, emu(p[0] - g.tip), emu(p[1] - g.tip), emu(2 * g.tip), emu(2 * g.tip))
        t.fill.solid()
        t.fill.fore_color.rgb = AHG
        t.line.fill.background()
        t.shadow.inherit = False
        t.name = f'{name}_binding_site_{i + 1}'
    grp.name = name
    return grp


def ahg_free(shapes, c, ang, g, name):
    u = unit(ang + 90)
    v = unit(ang + 180)
    half = g.gap / 2
    return ahg(shapes, add(c, u, -half), add(c, u, half), v, g, name)


def diamond(x0, y0, D):
    return {'A': (x0, y0), 'B': (x0 + 0.8 * D, y0 - 0.6 * D), 'C': (x0 + 0.8 * D, y0 + 0.6 * D), 'D': (x0 + 1.6 * D, y0)}


PAIRS = [('A', 'B'), ('A', 'C'), ('B', 'D'), ('C', 'D')]
EXTRA = {'A': [235, 300], 'B': [340, 30], 'C': [150, 205], 'D': [60, 120]}


def facing_angle(p, q):
    return math.degrees(math.atan2(q[0] - p[0], -(q[1] - p[1]))) % 360


def coated_cells(shapes, pos, cluster, g, prefix='', check=False, igg=True):
    """Draw cells at `pos`; IgG orientation follows the bridged layout `cluster`."""
    for cid, c in pos.items():
        rbc(shapes, c, g.r, f'{prefix}cell_{cid}', check=check)
        if not igg:
            continue
        angles = [facing_angle(cluster[cid], cluster[o if p == cid else p]) for p, o in PAIRS if cid in (p, o)]
        for k, a in enumerate(angles + EXTRA[cid]):
            igg_on_cell(shapes, c, a, g, f'{prefix}cell_{cid}_IgG_{k + 1}')


def bridge_points(cluster, pos, p, q, g):
    """Fc ends of the facing IgG on cells p and q at their current positions."""
    a = facing_angle(cluster[p], cluster[q])
    b = facing_angle(cluster[q], cluster[p])
    fp = add(pos[p], unit(a), g.reach)
    fq = add(pos[q], unit(b), g.reach)
    return fp, fq


def side_vec(cluster, p, q):
    """Unit vector perpendicular to p->q, pointing away from the cluster centre."""
    cx = sum(v[0] for v in cluster.values()) / 4
    cy = sum(v[1] for v in cluster.values()) / 4
    a, b = cluster[p], cluster[q]
    dx, dy = b[0] - a[0], b[1] - a[1]
    l = math.hypot(dx, dy)
    v = (-dy / l, dx / l)
    m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)
    if (m[0] - cx) * v[0] + (m[1] - cy) * v[1] < 0:
        v = (-v[0], -v[1])
    return v


def tube(shapes, x, y, w, h, positive, name):
    """Horizontal test tube as in the source figure. Illustrative; not a grading reference."""
    grp = shapes.add_group_shape()
    glass = grp.shapes.add_shape(MSO_SHAPE.FLOWCHART_DELAY, emu(x), emu(y), emu(w), emu(h))
    glass.fill.solid()
    glass.fill.fore_color.rgb = WHITE
    set_line(glass, MUTED, 1.25, cap_round=False)
    glass.shadow.inherit = False
    glass.name = f'{name}_glass'
    liq = grp.shapes.add_shape(MSO_SHAPE.FLOWCHART_DELAY, emu(x + w * 0.35), emu(y + h * 0.12), emu(w * 0.62), emu(h * 0.76))
    liq.fill.solid()
    liq.fill.fore_color.rgb = RGBColor(0xF6, 0xD9, 0xD8) if positive else RGBColor(0xE5, 0x8E, 0x8C)
    liq.line.fill.background()
    liq.shadow.inherit = False
    liq.name = f'{name}_contents'
    if positive:
        cx, cy = x + w * 0.86, y + h * 0.5
        for i, (dx, dy) in enumerate([(0, 0), (0.05, 0.03), (-0.04, 0.035), (0.01, -0.045), (-0.05, -0.02), (0.045, -0.035)]):
            d = grp.shapes.add_shape(MSO_SHAPE.OVAL, emu(cx + dx - 0.035), emu(cy + dy - 0.035), emu(0.07), emu(0.07))
            d.fill.solid()
            d.fill.fore_color.rgb = RED
            d.line.fill.background()
            d.shadow.inherit = False
            d.name = f'{name}_agglutinate_{i + 1}'
    grp.name = name
    return grp


# ---------------------------------------------------------------- slide helpers
def new_slide(prs, title, kicker=None):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.background.fill
    bg.solid()
    bg.fore_color.rgb = WHITE
    if kicker:
        text(s.shapes, 0.5, 0.28, 12.3, 0.3, kicker.upper(), 11, RED, True, name='kicker')
    text(s.shapes, 0.5, 0.55, 12.3, 0.6, title, 26, INK, True, name='title')
    return s


def footer(s, extra=''):
    text(s.shapes, 0.5, 7.08, 12.3, 0.3, f'{SOURCE_LINE}{extra}  ·  Schematic, not to scale.', 9, MUTED, name='footer_source')


def notes(s, body):
    s.notes_slide.notes_text_frame.text = body


def morph(slide, dur_ms=1600):
    """Morph transition (PowerPoint 2019/365) with a fade fallback for other viewers."""
    xml = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
           '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
           f'<p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" '
           f'xmlns:p14="http://schemas.microsoft.com/office/powerpoint/2010/main" spd="slow" p14:dur="{dur_ms}">'
           '<p159:morph option="byObject"/></p:transition></mc:Choice>'
           '<mc:Fallback><p:transition xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" spd="slow">'
           '<p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')
    el = etree.fromstring(xml)
    sld = slide._element
    anchor = sld.find(qn('p:clrMapOvr'))
    if anchor is None:
        anchor = sld.find(qn('p:cSld'))
    anchor.addnext(el)


def legend(s, x, y, items, g):
    """items subset of rbc, igg, ahg, check. Shape AND colour encode identity."""
    labels = {'rbc': 'Red cell (face-on view)', 'igg': 'IgG (Fab arms bound to the cell, Fc outward)',
              'ahg': 'Anti-IgG / AHG (Coombs reagent)', 'check': 'Check cell (antibody-coated reagent cell)'}
    grp = s.shapes.add_group_shape()
    yy = y
    for k in items:
        c = (x + 0.15, yy + 0.15)
        if k == 'rbc':
            rbc(grp.shapes, c, 0.12, 'legend_rbc')
        elif k == 'check':
            rbc(grp.shapes, c, 0.1, 'legend_check', check=True)
        elif k == 'igg':
            igg_at(grp.shapes, (c[0], c[1] + 0.12), (0, -1), Geo(0.40), 'legend_IgG')
        elif k == 'ahg':
            ahg(grp.shapes, (c[0] - 0.07, c[1] - 0.09), (c[0] + 0.07, c[1] - 0.09), (0, 1), Geo(0.40), 'legend_AHG')
        text(grp.shapes, x + 0.4, yy + 0.05, 4.2, 0.25, labels[k], 11, INK)
        yy += 0.36
    grp.name = 'legend'
    return grp


# ---------------------------------------------------------------- slides
def slide_title(prs):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = WHITE
    rect(s.shapes, 0, 0, 13.333, 7.5, PANEL, 'title_band')
    text(s.shapes, 0.8, 1.2, 11.5, 0.4, 'DIRECT ANTIGLOBULIN TEST (DAT)', 14, RED, True, name='kicker')
    text(s.shapes, 0.8, 1.7, 11.5, 1.4, 'How anti-human globulin reveals red cells coated in vivo', 40, INK, True, name='title')
    text(s.shapes, 0.8, 3.35, 7.2, 1.6,
         'Editable mechanism figures reconstructed from the DAT infographic (DAT2.pdf, p. 1): the antiglobulin reaction, '
         'the five-step procedure as a Morph sequence, check-cell validation, and the classic patterns of response.', 16, MUTED, name='subtitle')
    g = Geo(0.42)
    cl = diamond(9.1, 4.3, g.D)
    coated_cells(s.shapes, cl, cl, g, prefix='hero_')
    for i, (p, q) in enumerate(PAIRS):
        fp, fq = bridge_points(cl, cl, p, q, g)
        ahg(s.shapes, fp, fq, side_vec(cl, p, q), g, f'hero_AHG_{i + 1}')
    text(s.shapes, 0.8, 6.6, 11.5, 0.6,
         'All artwork is native, editable PowerPoint shapes. Schematic, not to scale. Molecule numbers are illustrative, not measured.',
         11, MUTED, name='disclaimer')
    notes(s, 'Title. Source: DAT2.pdf, The Blood Project infographic (written by Dr. Bentley Rodrigue; graphic design by Janie Vu). '
             'Figures are original reconstructions in native shapes; the infographic artwork itself is not copied.')


def slide_reaction(prs):
    s = new_slide(prs, 'The Antiglobulin Reaction (Anti-IgG)', 'Source figure, redrawn')
    g = Geo(0.33)
    # left: coated, dispersed
    cl_l = diamond(1.35, 3.25, g.D)
    disp = {'A': (1.0, 3.35), 'B': (2.45, 2.55), 'C': (2.2, 4.3), 'D': (3.75, 3.45)}
    coated_cells(s.shapes, disp, cl_l, g, prefix='left_')
    text(s.shapes, 0.55, 2.55, 0.6, 0.3, 'IgG', 13, INK, True, name='label_IgG')
    text(s.shapes, 0.6, 4.95, 3.9, 0.6, ['In vivo red cells coated', 'with IgG antibodies'], 15, INK, True, PP_ALIGN.CENTER, name='caption_left')
    tube(s.shapes, 1.2, 5.75, 2.7, 0.42, False, 'tube_negative')
    text(s.shapes, 0.6, 6.25, 3.9, 0.3, 'No agglutination', 13, RED, italic=True, align=PP_ALIGN.CENTER, name='tube_negative_label')
    # centre: reagent addition
    arr = s.shapes.add_shape(MSO_SHAPE.RIGHT_ARROW, emu(4.75), emu(3.1), emu(3.3), emu(0.32))
    arr.fill.solid()
    arr.fill.fore_color.rgb = RGBColor(0xD9, 0x4A, 0x4A)
    arr.line.fill.background()
    arr.shadow.inherit = False
    arr.name = 'arrow_addition_of_AHG'
    for i, (cx, cy, a) in enumerate([(5.6, 2.35, 20), (6.3, 2.1, -25), (7.0, 2.4, 35)]):
        ahg_free(s.shapes, (cx, cy), a, Geo(0.40), f'reagent_AHG_{i + 1}')
    text(s.shapes, 4.75, 3.55, 3.3, 0.3, 'Anti-IgG', 14, INK, True, PP_ALIGN.CENTER, name='label_anti_IgG')
    text(s.shapes, 4.75, 3.85, 3.3, 0.3, 'Addition of AHG (Coombs Reagent)', 13, MUTED, align=PP_ALIGN.CENTER, name='label_addition')
    # right: crosslinked agglutinate
    cl_r = diamond(9.0, 3.3, g.D)
    coated_cells(s.shapes, cl_r, cl_r, g, prefix='right_')
    for i, (p, q) in enumerate(PAIRS):
        fp, fq = bridge_points(cl_r, cl_r, p, q, g)
        ahg(s.shapes, fp, fq, side_vec(cl_r, p, q), g, f'right_AHG_bridge_{i + 1}')
    text(s.shapes, 8.55, 4.95, 4.2, 0.6, ['Crosslinking causing', 'agglutination of red cells'], 15, INK, True, PP_ALIGN.CENTER, name='caption_right')
    tube(s.shapes, 9.3, 5.75, 2.7, 0.42, True, 'tube_positive')
    text(s.shapes, 8.55, 6.25, 4.2, 0.3, 'Agglutination', 13, RED, italic=True, align=PP_ALIGN.CENTER, name='tube_positive_label')
    legend(s, 4.75, 4.45, ['rbc', 'igg', 'ahg'], g)
    footer(s, ', figure “The Antiglobulin Reaction (Anti-IgG)”')
    notes(s, 'Reconstruction of the source figure (DAT2.pdf p. 1, y ≈ 1010–1310 pt): in vivo IgG-coated red cells, '
             'no agglutination → Anti-IgG, addition of AHG (Coombs reagent) → crosslinking causing agglutination. '
             'Mechanism text: Proximate Mechanisms panel — AHG binds antibodies on one red cell and on another, creating a linking bridge; '
             'aggregates become visible.\n\nNot in the source (standard immunology, not literature-verified in this file): '
             'IgG is drawn bound to the cell by its Fab arms with Fc outward, and AHG bridges Fc ends. '
             'Colour deviation: the source draws Anti-IgG red; here purple with round binding tips for contrast against red cells. '
             'Tubes are illustrative; the source gives no grading criteria. Cell, antibody and molecule counts are illustrative.')


STEPS = [
    ('invivo', '1', 'In vivo: IgG is bound to the patient’s red cells',
     'The DAT asks whether red cells are coated (in vivo) with immunoglobulin, complement, or both. The test detects this coating; it does not create it.',
     'Term Definition'),
    ('sample', '1', 'Red cells are taken from the patient’s sample',
     'Unbound antibody is still present around the cells.', 'Method › Steps · Step 1'),
    ('wash', '1', 'Washing removes lingering, unbound antibodies',
     '“The cells are washed to remove any lingering, unbound antibodies.” IgG bound to the cells remains.', 'Method › Steps · Step 1'),
    ('add', '2', 'Washed cells are suspended; AHG (Coombs reagent) is added',
     'The reagent may be polyspecific (anti-IgG + anti-C3d) or monospecific (anti-IgG or anti-C3d). Anti-IgG is shown.',
     'Method › Steps · Step 2; Principle of the Test'),
    ('bind1', '2', 'AHG binds antibody on one red cell…',
     '“When anti-human globulin (AHG) binds to antibodies or complement on one red cell’s surface…”', 'Proximate Mechanisms'),
    ('spin', '3', 'Centrifuged: AHG bridges antibody on neighbouring cells',
     '“…and then to those on the surface of another, it can create a linking bridge between the red cells.”',
     'Method › Steps · Step 3; Proximate Mechanisms'),
    ('read', '4', 'Read: visible aggregates = agglutination (positive DAT)',
     'Agglutination is graded by strength from Negative to 4+. The source does not describe the criteria for each grade.',
     'Method › Steps · Step 4'),
]


def slide_step(prs, idx, key, step_no, title, body, ref):
    s = new_slide(prs, title, f'DAT procedure · Step {step_no} of 5 · frame {idx + 1} of {len(STEPS)}')
    in_vivo = key == 'invivo'
    stage = rect(s.shapes, 0.5, 1.3, 8.6, 5.55, VIVO_BG if in_vivo else VITRO_BG, '!!stage_background')
    alt_text(stage, 'Scene background')
    text(s.shapes, 0.7, 1.42, 8, 0.3, 'IN VIVO · patient’s circulation' if in_vivo else 'IN VITRO · test tube in the laboratory',
         11, MUTED, True, name='!!stage_label')
    g = Geo(0.40)
    cluster = diamond(2.6, 3.85, g.D)
    disp = {'A': (1.55, 3.0), 'B': (4.55, 2.45), 'C': (3.7, 5.15), 'D': (7.35, 4.1)}
    clustered = key in ('spin', 'read')
    pos = cluster if clustered else disp
    # Unbound IgG in plasma: present in vivo / in the sample, moved out of the scene by washing.
    if key in ('invivo', 'sample', 'wash'):
        free = [(2.9, 3.6, 30), (5.9, 3.0, 300), (5.4, 5.3, 200), (2.1, 5.7, 120), (6.5, 6.2, 80)]
        for i, (x, y, a) in enumerate(free):
            if key == 'wash':
                x = 10.6 + i * 0.35  # carried off-stage to the right by the wash
            d = unit(a)
            igg_at(s.shapes, (x, y), d, g, f'!!plasma_IgG_{i + 1}')
    # cells + bound IgG (named with !! so Morph pairs them across frames)
    for cid, c in pos.items():
        rbc(s.shapes, c, g.r, f'!!cell_{cid}')
        angles = [facing_angle(cluster[cid], cluster[o if p == cid else p]) for p, o in PAIRS if cid in (p, o)]
        for k, a in enumerate(angles + EXTRA[cid]):
            igg_on_cell(s.shapes, c, a, g, f'!!cell_{cid}_IgG_{k + 1}')
    # AHG
    if key in ('add', 'bind1', 'spin', 'read'):
        free_pos = [(3.0, 2.0, 15), (6.1, 2.15, -30), (2.0, 4.55, 40), (5.9, 5.4, -15)]
        for i, (p, q) in enumerate(PAIRS):
            name = f'!!AHG_{i + 1}'
            if key == 'add':
                ahg_free(s.shapes, free_pos[i][:2], free_pos[i][2], g, name)
            elif key == 'bind1':
                a = facing_angle(cluster[p], cluster[q])
                fp = add(pos[p], unit(a), g.reach)
                fq = add(fp, unit(a), g.gap)
                ahg(s.shapes, fp, fq, side_vec(cluster, p, q), g, name)
            else:
                fp, fq = bridge_points(cluster, pos, p, q, g)
                ahg(s.shapes, fp, fq, side_vec(cluster, p, q), g, name)
    if key == 'wash':
        text(s.shapes, 6.9, 1.42, 2.1, 0.3, 'wash →', 12, TEAL, True, PP_ALIGN.RIGHT, name='!!cue')
    if key == 'spin':
        text(s.shapes, 6.9, 1.42, 2.1, 0.3, '↻ centrifuge', 12, TEAL, True, PP_ALIGN.RIGHT, name='!!cue')
    if key == 'read':
        text(s.shapes, 5.6, 6.35, 3.35, 0.35, 'Agglutination — positive', 15, RED, True, PP_ALIGN.RIGHT, name='!!result')
        tube(s.shapes, 6.3, 2.0, 2.4, 0.38, True, '!!tube')
    # caption panel
    rect(s.shapes, 9.35, 1.3, 3.5, 5.55, PANEL, '!!caption_panel')
    text(s.shapes, 9.6, 1.5, 3.05, 0.3, f'STEP {step_no}', 12, RED, True, name='!!caption_step')
    text(s.shapes, 9.6, 1.85, 3.05, 1.2, title, 17, INK, True, name='!!caption_title')
    text(s.shapes, 9.6, 3.2, 3.05, 2.6, body, 13, INK, name='!!caption_body')
    text(s.shapes, 9.6, 6.1, 3.05, 0.6, f'p. 1 · {ref}', 10, MUTED, name='!!caption_ref')
    legend(s, 0.7, 6.05, ['igg', 'ahg'] if key in ('add', 'bind1', 'spin', 'read') else ['igg'], g).name = '!!legend'
    footer(s)
    if idx > 0:
        morph(s)
    notes(s, f'Frame {idx + 1}/{len(STEPS)} — {title}. Source: DAT2.pdf p. 1, {ref}. '
             'Transition: Morph (PowerPoint 2019/365); other viewers fall back to Fade. Objects share “!!” names across frames so Morph pairs them. '
             'Motion is illustrative and does not represent reaction kinetics. IgG orientation (Fab on membrane, Fc outward) and '
             'AHG binding to Fc are standard immunology, not stated in the source.')


def slide_checkcells(prs):
    s = new_slide(prs, 'Validating a negative DAT: check cells', 'Method › Steps · Step 5  ·  Proximate Mechanisms')
    g = Geo(0.38)
    for col, (x0, ok) in enumerate([(0.5, True), (6.75, False)]):
        pre = 'valid' if ok else 'invalid'
        rect(s.shapes, x0, 1.35, 6.05, 4.6, VITRO_BG, f'{pre}_panel')
        text(s.shapes, x0 + 0.25, 1.5, 5.6, 0.35, 'Active AHG present' if ok else 'No usable AHG (e.g., not added, or inactive)', 15, INK, True, name=f'{pre}_heading')
        # patient cells: not coated, non-reactive
        for i, c in enumerate([(x0 + 0.85, 2.75), (x0 + 0.85, 4.35), (x0 + 1.95, 3.55)]):
            rbc(s.shapes, c, g.r, f'{pre}_patient_cell_{i + 1}')
        text(s.shapes, x0 + 0.25, 5.05, 2.5, 0.6, ['Patient cells:', 'no agglutination'], 11, MUTED, name=f'{pre}_patient_label')
        # check cells: IgG-coated reagent cells
        if ok:
            e, f_ = (x0 + 3.55, 3.55), (x0 + 3.55 + g.D, 3.55)
        else:
            e, f_ = (x0 + 3.45, 2.85), (x0 + 4.95, 4.35)
        cl = {'E': (0, 0), 'F': (g.D, 0)}
        for cid, c in (('E', e), ('F', f_)):
            rbc(s.shapes, c, g.r, f'{pre}_check_cell_{cid}', check=True)
            base_angles = [90 if cid == 'E' else 270, 200 if cid == 'E' else 20, 330 if cid == 'E' else 150]
            for k, a in enumerate(base_angles):
                igg_on_cell(s.shapes, c, a, g, f'{pre}_check_cell_{cid}_IgG_{k + 1}')
        if ok:
            fp, fq = add(e, (1, 0), g.reach), add(f_, (-1, 0), g.reach)
            ahg(s.shapes, fp, fq, (0, -1), g, f'{pre}_AHG_bridge')
            ahg_free(s.shapes, (x0 + 2.5, 2.1), 25, g, f'{pre}_AHG_free_1')
        text(s.shapes, x0 + 2.9, 5.05, 3.0, 0.6, ['Check cells:', 'agglutinate' if ok else 'do NOT agglutinate'], 11, MUTED, name=f'{pre}_check_label')
        verdict = 'Negative result validated' if ok else 'Concern for possible technical error'
        rect(s.shapes, x0, 6.05, 6.05, 0.6, RGBColor(0xE3, 0xF2, 0xE7) if ok else RGBColor(0xFB, 0xE5, 0xE2), f'{pre}_verdict_box')
        text(s.shapes, x0 + 0.25, 6.17, 5.6, 0.4, verdict, 15, TEAL if ok else RED, True, name=f'{pre}_verdict')
    legend(s, 9.0, 0.25, ['check', 'igg', 'ahg'], g)
    footer(s, ', Method › Steps (Step 5) and Proximate Mechanisms')
    notes(s, 'Source: “Negative reactions should always be validated by adding antibody-coated reagent cells (check cells) to the non-reactive solution. '
             'Lack of agglutination with the addition of check cells should trigger concern for possible technical error.” (Proximate Mechanisms). '
             'False-negative causes listed in the source include failure to add AHG and inactive AHG due to improper storage/handling. '
             'Which errors check cells detect is not specified in the source; the right panel is a teaching example. Check cells are drawn IgG-coated.')


def slide_patterns(prs):
    s = new_slide(prs, 'Classic patterns of response', 'Interpreting a positive polyspecific DAT')
    def box(x, y, w, h, label, fill, name, color=WHITE, size=14):
        b = rect(s.shapes, x, y, w, h, fill, name, radius=None)
        tf = b.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        r = p.add_run()
        r.text = label
        r.font.name, r.font.size, r.font.bold = FONT, Pt(size), True
        r.font.color.rgb = color
        return b
    b1 = box(5.17, 1.3, 3.0, 0.5, 'Positive polyspecific DAT', INK, 'box_positive_poly')
    b2 = box(5.17, 2.1, 3.0, 0.5, 'Perform monospecific DAT', INK, 'box_monospecific')
    b3 = box(5.17, 2.9, 3.0, 0.5, 'What is positive?', RED, 'box_what_positive')
    cols = [
        ('Anti-IgG', ['Warm Autoimmune Hemolytic Anemia (WAIHA)', 'Alloimmune hemolytic anemia (i.e., Acute or delayed hemolytic transfusion reaction)',
                      'Hemolytic disease of the fetus and newborn (HDFN)', 'Drug induced hemolytic anemia', 'Passive acquisition']),
        ('Anti-IgG & Anti-C3', ['Warm Autoimmune Hemolytic Anemia (WAIHA)', 'Mixed Autoimmune hemolytic anemia', 'Drug induced hemolytic anemia']),
        ('Anti-C3', ['Cold Agglutinin Disease', 'Paroxysmal cold hemoglobinuria', 'Drug induced hemolytic anemia']),
    ]
    heads = []
    for i, (h, items) in enumerate(cols):
        x = 0.75 + i * 4.1
        heads.append(box(x + 0.45, 3.95, 3.0, 0.5, h, RED, f'box_col_{i + 1}_header'))
        tb = text(s.shapes, x + 0.2, 4.65, 3.6, 2.3, ['• ' + it for it in items], 13, INK, name=f'list_col_{i + 1}')
        tb.text_frame.paragraphs[0].space_after = Pt(4)
    def connect(a, b, name, a_idx=2, b_idx=0):
        c = s.shapes.add_connector(MSO_CONNECTOR.ELBOW, 0, 0, 0, 0)
        c.begin_connect(a, a_idx)
        c.end_connect(b, b_idx)
        set_line(c, INK if a is not b3 else RED, 2, cap_round=False)
        c.line._get_or_add_ln().append(etree.fromstring('<a:tailEnd xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" type="triangle"/>'))
        c.name = name
    connect(b1, b2, 'arrow_poly_to_mono')
    connect(b2, b3, 'arrow_mono_to_question')
    for i, h in enumerate(heads):
        connect(b3, h, f'arrow_question_to_col_{i + 1}')
    footer(s, ', “Classic Patterns of Response”')
    notes(s, 'Flowchart and lists reproduced from the source panel “Classic Patterns of Response” (wording as printed; the source writes '
             '“Anti-C3” here and “anti-C3d” elsewhere). Drug-induced hemolytic anemia appears in all three columns: the pattern narrows '
             'possibilities and does not make a diagnosis. The source has no branch for both monospecific reagents negative.')


def slide_sources(prs):
    s = new_slide(prs, 'Evidence, conventions and limits', 'Notes for presenters')
    rows = [
        ('Mechanism (AHG bridges coated cells → agglutination)', 'Source: Principle of the Test; Proximate Mechanisms; figure'),
        ('Five steps; Negative to 4+ grading; check cells', 'Source: Method › Steps 1–5; Proximate Mechanisms'),
        ('Classic patterns flowchart and lists', 'Source: Classic Patterns of Response'),
        ('IgG bound via Fab, Fc outward; AHG binds Fc', 'Standard immunology — NOT stated in the source; not literature-verified here'),
        ('Face-on red cell with central pallor', 'Schematic morphology; not to scale'),
        ('Molecule and cell counts; motion timing', 'Illustrative only; not measured stoichiometry or kinetics'),
        ('Anti-IgG colour (purple, source uses red)', 'Changed for contrast; identity also encoded by round binding tips'),
        ('Grade criteria, wash/centrifuge settings', 'Not given in the source — not drawn'),
        ('“Delay in adding AHG after washing”', 'Listed under BOTH false negative and false positive in the source — unresolved'),
    ]
    y = 1.35
    for i, (a, b) in enumerate(rows):
        fill = PANEL if i % 2 == 0 else WHITE
        rect(s.shapes, 0.5, y, 12.33, 0.5, fill, f'row_{i + 1}_bg')
        text(s.shapes, 0.7, y + 0.12, 5.6, 0.35, a, 12, INK, True, name=f'row_{i + 1}_item')
        text(s.shapes, 6.5, y + 0.12, 6.2, 0.35, b, 12, FLAG if 'NOT' in b or 'BOTH' in b else MUTED, name=f'row_{i + 1}_basis')
        y += 0.52
    text(s.shapes, 0.5, 6.15, 12.3, 0.8,
         ['Source: “Direct Antiglobulin Test (DAT)”, The Blood Project — Encyclopedia of Blood (infographic). Written by Dr. Bentley Rodrigue; graphic design by Janie Vu. '
          'The infographic contains no reference list. Figures here are original reconstructions; redistribution terms of the source were not verified.'],
         10, MUTED, name='source_attribution')
    notes(s, 'Evidence map for every visual convention used in this deck.')


def build(out):
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(int(13.333 * E)), Emu(int(7.5 * E))
    slide_title(prs)
    slide_reaction(prs)
    for i, st in enumerate(STEPS):
        slide_step(prs, i, *st)
    slide_checkcells(prs)
    slide_patterns(prs)
    slide_sources(prs)
    prs.core_properties.title = 'DAT mechanism figures'
    prs.core_properties.author = 'Research-Agent (AI-assisted draft for Dr. Alanazi)'
    prs.save(out)


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else 'dat-mechanism-figures.pptx')
