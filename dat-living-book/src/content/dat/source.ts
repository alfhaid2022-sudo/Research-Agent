import type { SourceDocument, SourceFlag } from '../types';

// Panel coordinates were measured from `pdftotext -bbox` on DAT2.pdf
// (single page, 792 x 4068 pt). Each range is the panel heading through the
// last line of its body text, with a small margin.
export const datSource: SourceDocument = {
  id: 'dat2',
  title: 'Direct Antiglobulin Test (DAT)',
  publisher: 'The Blood Project — Encyclopedia of Blood (infographic)',
  authors: ['Written by Dr. Bentley Rodrigue', 'Graphic design by Janie Vu'],
  pageCount: 1,
  pageSizePt: { width: 792, height: 4068 },
  pdfPath: 'source/DAT2.pdf',
  pageImagePath: (page) => `source/DAT2-p${page}.png`,
  panels: [
    { id: 'title', page: 1, label: 'Direct Antiglobulin Test (DAT) — title', y0: 40, y1: 300 },
    { id: 'term', page: 1, label: 'Term Definition', y0: 310, y1: 490 },
    { id: 'principle', page: 1, label: 'Method › Principle of the Test', y0: 610, y1: 985 },
    { id: 'steps', page: 1, label: 'Method › Steps', y0: 610, y1: 985 },
    { id: 'reaction', page: 1, label: 'The Antiglobulin Reaction (Anti-IgG) — figure', y0: 1010, y1: 1310 },
    { id: 'factoids', page: 1, label: 'Factoids', y0: 1330, y1: 1800 },
    { id: 'ahg', page: 1, label: 'Factoids › How anti-human globulin is made', y0: 1850, y1: 1945 },
    { id: 'results', page: 1, label: '− Result / + Result', y0: 2025, y1: 2500 },
    { id: 'patterns', page: 1, label: 'Classic Patterns of Response', y0: 2540, y1: 3110 },
    { id: 'proximate', page: 1, label: 'Proximate Mechanisms', y0: 3180, y1: 3530 },
    { id: 'history', page: 1, label: 'History of Medicine', y0: 3600, y1: 3925 },
    { id: 'attributions', page: 1, label: 'Notes / Attributions', y0: 3955, y1: 4068 },
  ],
};

export function panelById(id: string) {
  const p = datSource.panels.find((x) => x.id === id);
  if (!p) throw new Error(`Unknown source panel: ${id}`);
  return p;
}

export const datFlags: SourceFlag[] = [
  {
    id: 'delay-both-lists',
    title: '“Delay in the addition of AHG after washing” appears under both false negative and false positive',
    text:
      'The − Result panel lists this delay as a cause of a false-negative DAT, and the + Result panel lists the same delay as a cause of a false-positive DAT. The source gives no mechanism for either. This book reports both listings as printed and does not choose between them; the virtual lab treats a delay only as a technique error that invalidates the result. Check this point against a current technical manual before teaching it.',
    refs: [{ panel: 'results', detail: 'False negative & false positive lists' }],
  },
  {
    id: 'grading-criteria',
    title: 'Grading criteria for “Negative to 4+” are not described',
    text:
      'The source states that agglutination is graded from Negative to 4+ and that strength generally correlates with severity of hemolysis, but it does not describe what each grade looks like. The simulator therefore records results as agglutination present/absent and does not assign grades.',
    refs: [{ panel: 'steps', detail: 'Step 4' }, { panel: 'proximate' }],
  },
  {
    id: 'procedure-parameters',
    title: 'Procedure parameters are not specified',
    text:
      'The source does not name the wash solution, the number of washes, the centrifugation speed or time, cell-suspension strength, sample anticoagulant, or incubation conditions. The virtual lab uses qualitative choices only (e.g., “under-centrifuge / as per procedure / over-centrifuge”) and never invents values.',
    refs: [{ panel: 'steps' }],
  },
  {
    id: 'c3-terminology',
    title: 'Complement reagent is written as anti-C3d, anti-C3 and C3 in different panels',
    text:
      'The Principle and Proximate Mechanisms panels say “anti-C3d”; the Classic Patterns flowchart says “Anti-C3”; the detection-limit line says “molecules of C3”. The wording is preserved as printed in each place.',
    refs: [{ panel: 'principle' }, { panel: 'patterns' }, { panel: 'proximate' }],
  },
  {
    id: 'agh-typo',
    title: 'Typographical errors in the source',
    text:
      'The True Negative list reads “by the AGH reagents” (presumably AHG), and the attributions read “Graphic deign by”. These are reproduced only where quoted.',
    refs: [{ panel: 'results', detail: 'True negative' }, { panel: 'attributions' }],
  },
  {
    id: 'no-references',
    title: 'The source contains no reference list',
    text:
      'Frequencies (e.g., 1 in 1,000 to 1 in 14,000 donors; ~7–8% of hospitalized patients; 97–99% of warm AIHA), detection limits (100–500 IgG; 400–1,100 C3 molecules) and historical dates (1908, 1945) are presented without citations. In this book they are attributed to the infographic only; they have NOT been verified against primary literature.',
    refs: [{ panel: 'factoids' }, { panel: 'proximate' }, { panel: 'history' }],
  },
  {
    id: 'c3d-igm-inference',
    title: 'Read the anti-C3d → IgM inference together with the Classic Patterns panel',
    text:
      'Proximate Mechanisms states that a positive reaction with anti-C3d implies an IgM antibody was bound in vivo. The same source’s Classic Patterns panel also shows anti-IgG and anti-C3 positive together (e.g., warm AIHA, mixed autoimmune HA), so complement on the cell is not presented as occurring only with IgM. Treat the inference as the source’s simplified rule of thumb.',
    refs: [{ panel: 'proximate' }, { panel: 'patterns', detail: 'column: Anti-IgG & Anti-C3' }],
  },
];

export const datNotCovered = [
  'The indirect antiglobulin test (IAT) — the source covers the direct test only, so this book does not compare DAT with IAT.',
  'Elution, antibody identification, or other follow-up investigations after a positive DAT.',
  'Visual criteria for each agglutination grade (1+ to 4+).',
  'Specimen type, wash solution, centrifugation settings, column/gel or other test formats.',
  'Treatment or clinical management of any condition listed.',
];
