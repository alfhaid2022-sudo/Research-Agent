import type { GlossaryEntry } from '../types';

export const datGlossary: GlossaryEntry[] = [
  {
    term: 'Direct antiglobulin test (DAT)',
    aka: ['direct Coombs test'],
    definition:
      'Serologic Blood Bank test used to determine if red cells are coated in vivo with immunoglobulin, complement, or both.',
    origin: 'source',
    refs: [{ panel: 'term' }],
  },
  {
    term: 'Anti-human globulin (AHG)',
    aka: ['Coombs reagent', 'antiglobulin reagent'],
    definition:
      'Reagent that agglutinates red cells coated with antibodies or complement fragments. Made by immunizing animals (commonly rabbits) with human gamma globulin; the animals make antibodies against human gamma globulin and complement, which are purified before use.',
    origin: 'source',
    refs: [{ panel: 'principle' }, { panel: 'ahg' }],
  },
  {
    term: 'Polyspecific AHG',
    definition: 'AHG reagent that includes both anti-IgG and anti-C3d antibodies.',
    origin: 'source',
    refs: [{ panel: 'principle' }],
  },
  {
    term: 'Monospecific AHG',
    definition: 'AHG reagent containing antibodies targeting either IgG or C3d.',
    origin: 'source',
    refs: [{ panel: 'principle' }],
  },
  {
    term: 'Agglutination',
    definition:
      'Clumping of red cells. In the DAT, AHG bound to antibody or complement on one cell and on another forms a linking bridge; as this continues, aggregates (clumps) become visible. Graded from Negative to 4+.',
    origin: 'source',
    refs: [{ panel: 'proximate' }, { panel: 'steps', detail: 'Step 4' }],
  },
  {
    term: 'Crosslinking',
    aka: ['linking bridge'],
    definition: 'AHG attaching to coating on two different red cells at once, joining them.',
    origin: 'source',
    refs: [{ panel: 'reaction' }, { panel: 'proximate' }],
  },
  {
    term: 'Washing',
    definition: 'Step 1 of the DAT: removing lingering, unbound antibodies from the patient’s red cells before AHG is added.',
    origin: 'source',
    refs: [{ panel: 'steps', detail: 'Step 1' }],
  },
  {
    term: 'Check cells',
    aka: ['antibody-coated reagent cells'],
    definition:
      'Antibody-coated reagent cells added to a non-reactive (negative) DAT to validate it. Lack of agglutination after adding check cells should trigger concern for possible technical error.',
    origin: 'source',
    refs: [{ panel: 'steps', detail: 'Step 5' }, { panel: 'proximate' }],
  },
  {
    term: 'In vivo',
    definition: 'In the living body. In the DAT, the red-cell coating happened in vivo, in the patient.',
    origin: 'teaching',
    refs: [{ panel: 'term' }],
  },
  {
    term: 'In vitro',
    definition: 'In the test tube. Used in this book for the laboratory stage of the DAT; the source does not use this term.',
    origin: 'teaching',
    refs: [],
  },
  {
    term: 'IgG',
    definition:
      'Immunoglobulin class detected by anti-IgG. In the source, a positive reaction with anti-IgG implies an IgG antibody was bound to the red cells in vivo.',
    origin: 'source',
    refs: [{ panel: 'proximate' }],
  },
  {
    term: 'IgM',
    definition:
      'Immunoglobulin class. The source states that a positive reaction with anti-C3d implies an IgM antibody was bound to the red cells in vivo.',
    origin: 'source',
    refs: [{ panel: 'proximate' }],
  },
  {
    term: 'C3 / C3d',
    definition:
      'Complement fragment(s) detected by anti-C3d (written “anti-C3” in the Classic Patterns panel). The DAT can detect as low as 400–1,100 molecules of C3 on tested red cells.',
    origin: 'source',
    refs: [{ panel: 'principle' }, { panel: 'patterns' }, { panel: 'proximate' }],
  },
  {
    term: 'Hemolysis',
    definition: 'Destruction of red cells. Bound immunoglobulin and/or complement can lead to it.',
    origin: 'source',
    refs: [{ panel: 'term' }],
  },
  {
    term: 'Warm autoimmune hemolytic anemia (WAIHA)',
    aka: ['warm AIHA'],
    definition:
      'Listed under true positives and in the anti-IgG and anti-IgG & anti-C3 patterns. 97 to 99% of individuals with warm AIHA will have a positive result with anti-IgG, anti-C3d, or both.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns' }, { panel: 'factoids' }],
  },
  {
    term: 'Cold agglutinin disease',
    definition: 'Listed in the anti-C3 pattern of response.',
    origin: 'source',
    refs: [{ panel: 'patterns', detail: 'column: Anti-C3' }],
  },
  {
    term: 'Paroxysmal cold hemoglobinuria (PCH)',
    definition: 'Listed under autoimmune hemolytic anemia (true positives) and in the anti-C3 pattern.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns', detail: 'column: Anti-C3' }],
  },
  {
    term: 'Mixed autoimmune hemolytic anemia',
    definition: 'Listed under true positives and in the anti-IgG & anti-C3 pattern.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns' }],
  },
  {
    term: 'Drug-induced hemolytic anemia',
    definition: 'Listed under true positives and in all three classic patterns; the source also lists drug-mediated DAT-negative hemolytic anemia.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns' }],
  },
  {
    term: 'Hemolytic disease of the fetus and newborn (HDFN)',
    definition:
      'Maternal alloantibodies that cross the placenta and bind to fetal cells. Listed as an alloimmune true-positive cause and in the anti-IgG pattern.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns', detail: 'column: Anti-IgG' }],
  },
  {
    term: 'Hemolytic / serologic transfusion reaction',
    definition:
      'Transfusion-related alloimmune causes of a true-positive DAT: acute hemolytic transfusion reaction, delayed hemolytic or serologic transfusion reaction.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns', detail: 'column: Anti-IgG' }],
  },
  {
    term: 'Passive transfer / passive acquisition',
    definition: 'Antibody received in immunoglobulin preparations (e.g., IVIG); a listed true-positive cause and anti-IgG pattern.',
    origin: 'source',
    refs: [{ panel: 'results' }, { panel: 'patterns', detail: 'column: Anti-IgG' }],
  },
  {
    term: 'IVIG',
    definition: 'An immunoglobulin preparation given as the source’s example of passive transfer of antibody.',
    origin: 'source',
    refs: [{ panel: 'results' }],
  },
  {
    term: 'DAT-negative hemolytic anemia',
    definition: 'Hemolytic anemia with a negative DAT; the source gives IgA-mediated and drug-mediated examples, listed under true negatives.',
    origin: 'source',
    refs: [{ panel: 'results', detail: 'True negative' }],
  },
];
