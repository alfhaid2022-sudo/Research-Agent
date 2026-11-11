import type { Section } from '../types';

// Order follows the source infographic from top to bottom.
// `quote: true` paragraphs reproduce source wording; everything else is a
// close paraphrase that keeps the source's qualifications ("generally",
// "typically", "can", "not all").
export const datSections: Section[] = [
  {
    id: 'definition',
    number: 1,
    title: 'What the DAT asks',
    objective: 'State what the DAT detects, where the coating happens, and why it is ordered.',
    refs: [{ panel: 'term' }],
    explain: [
      {
        text:
          'Sometimes referred to as the direct Coombs test, the DAT is a serologic test performed in the Blood Bank. It is used to determine if red cells are coated (in vivo) with immunoglobulin, complement, or both.',
        refs: [{ panel: 'term' }],
        quote: true,
      },
      {
        text:
          'The DAT is typically ordered during a workup for hemolysis, because bound immunoglobulin and/or complement can lead to the destruction of red cells.',
        refs: [{ panel: 'term' }],
      },
      {
        text:
          'Two places matter. The coating happens in vivo — on the cells while they are in the patient. The test itself happens in the laboratory, where the coating is detected; the test does not create it.',
        refs: [{ panel: 'term' }, { panel: 'reaction', detail: '“In vivo red cells coated with IgG antibodies”' }],
      },
    ],
    mechanism: {
      key: 'coating-gallery',
      intro: 'Choose what is bound to the red cell. The DAT asks whether any of these coatings are present.',
    },
    interpret: [
      {
        text:
          'A DAT result answers a question about the patient’s own red cells: is immunoglobulin, complement, or both already on them?',
        refs: [{ panel: 'term' }],
      },
      {
        text: 'Ordering context in the source: a workup for hemolysis.',
        refs: [{ panel: 'term' }],
      },
    ],
    check: ['q-what', 'q-in-vivo'],
    teachingNotes: [
      {
        title: 'In vivo vs in vitro',
        text:
          '“In vivo” means in the living body; “in vitro” means in the test tube. The source uses only the term “in vivo”; “in vitro” is added here to name the laboratory stage.',
      },
    ],
  },
  {
    id: 'principle',
    number: 2,
    title: 'Principle of the test',
    objective: 'Explain why anti-human globulin causes agglutination of coated cells, and contrast polyspecific with monospecific reagent.',
    refs: [{ panel: 'principle' }],
    explain: [
      {
        text:
          'The DAT relies on the principle of agglutination. The addition of anti-human globulin (AHG) to a red cell sample will cause agglutination if the red cells are coated with antibodies or complement fragments.',
        refs: [{ panel: 'principle' }],
        quote: true,
      },
      {
        text:
          'The AHG reagent can be polyspecific — containing both anti-IgG and anti-C3d — or monospecific, targeting either IgG or C3d.',
        refs: [{ panel: 'principle' }],
      },
    ],
    mechanism: {
      key: 'crosslink-animation',
      intro: 'Watch AHG find the coating and link neighbouring cells. Switch the coating off to see the contrast.',
    },
    interact: {
      key: 'reaction-explorer',
      intro: 'Pair a coating with a reagent. A reagent can only bridge cells through a target it recognises.',
    },
    interpret: [
      {
        text:
          'Agglutination with polyspecific reagent says the cells carry IgG, C3d, or both — but not which. Monospecific reagents separate the two.',
        refs: [{ panel: 'principle' }, { panel: 'patterns' }],
      },
      {
        text:
          'A negative result with a monospecific reagent is negative only for that target (e.g., anti-IgG cannot report C3d).',
        refs: [{ panel: 'principle' }],
      },
    ],
    check: ['q-poly', 'q-mono'],
    flags: ['c3-terminology'],
  },
  {
    id: 'steps',
    number: 3,
    title: 'The five steps',
    objective: 'Sequence the DAT procedure and give the purpose of each step, including validation of negatives.',
    refs: [{ panel: 'steps' }],
    explain: [
      {
        text:
          '1. Red blood cells are taken from a patient’s sample; the cells are washed to remove any lingering, unbound antibodies.',
        refs: [{ panel: 'steps', detail: 'Step 1' }],
        quote: true,
      },
      {
        text:
          '2. These washed cells are suspended, and an anti-human globulin reagent (also called the Coombs reagent) is added to the solution.',
        refs: [{ panel: 'steps', detail: 'Step 2' }],
        quote: true,
      },
      { text: '3. The solution is centrifuged.', refs: [{ panel: 'steps', detail: 'Step 3' }], quote: true },
      {
        text:
          '4. The sample is evaluated for agglutination. The agglutination can be graded based on strength (Negative to 4+).',
        refs: [{ panel: 'steps', detail: 'Step 4' }],
        quote: true,
      },
      {
        text: '5. Negative reactions should be validated using the addition of antibody-coated reagent cells.',
        refs: [{ panel: 'steps', detail: 'Step 5' }],
        quote: true,
      },
    ],
    mechanism: {
      key: 'procedure-animation',
      intro: 'The whole procedure, step by step. Each caption cites the step it shows.',
    },
    interact: {
      key: 'virtual-lab-link',
      intro: 'Run the procedure yourself in the guided virtual lab, including the mistakes the source warns about.',
    },
    interpret: [
      {
        text:
          'Step 5 matters: a negative reading is only trusted after antibody-coated reagent cells (check cells) are added and agglutinate.',
        refs: [{ panel: 'steps', detail: 'Step 5' }, { panel: 'proximate' }],
      },
    ],
    check: ['q-wash', 'q-step5'],
    flags: ['procedure-parameters', 'grading-criteria'],
    teachingNotes: [
      {
        title: 'Why washing protects the reagent (teaching model)',
        text:
          'The source says washing removes unbound antibodies but does not say why that matters. A standard teaching explanation is that free human globulin left in the tube can bind (neutralise) the AHG before it reaches the cells. The virtual lab uses this model and labels it as such.',
      },
    ],
  },
  {
    id: 'reaction',
    number: 4,
    title: 'The antiglobulin reaction',
    objective: 'Describe how anti-IgG cross-links IgG-coated red cells into visible agglutinates.',
    refs: [{ panel: 'reaction' }, { panel: 'proximate' }],
    explain: [
      {
        text:
          'The source figure shows red cells coated in vivo with IgG antibodies: on their own they show no agglutination. Anti-IgG — the AHG (Coombs reagent) — is added, and crosslinking causes agglutination of the red cells.',
        refs: [{ panel: 'reaction' }],
      },
      {
        text:
          'When anti-human globulin (AHG) binds to antibodies or complement on one red cell’s surface, and then to those on the surface of another, it can create a linking bridge between the red cells. As the process continues, aggregates (or clumps) of red cells are visible.',
        refs: [{ panel: 'proximate' }],
        quote: true,
      },
    ],
    mechanism: {
      key: 'crosslink-animation',
      intro: 'The source figure, set in motion: coated cells → AHG added → crosslinking → agglutination.',
    },
    interpret: [
      {
        text:
          'Visible clumping is the read-out. The IgG coating alone does not clump the cells in the figure; the bridge formed by AHG does.',
        refs: [{ panel: 'reaction' }],
      },
    ],
    check: ['q-bridge'],
    teachingNotes: [
      {
        title: 'About the drawings',
        text:
          'Cells and antibodies here are schematic, not to scale, and not microscopy. Real red cells carry far more molecules than are drawn.',
      },
    ],
  },
  {
    id: 'factoids',
    number: 5,
    title: 'Factoids: what a positive DAT does and does not mean',
    objective: 'Interpret a positive DAT in context, and describe how AHG reagent is produced.',
    refs: [{ panel: 'factoids' }, { panel: 'ahg' }],
    explain: [
      {
        text: 'A positive DAT can be found in 1 in 1,000 to 1 in 14,000 healthy blood donors without hemolysis.',
        refs: [{ panel: 'factoids' }],
        quote: true,
      },
      {
        text: 'The DAT is positive in ∼7 to 8% of all hospitalized patients; not all of these patients are hemolyzing.',
        refs: [{ panel: 'factoids' }],
        quote: true,
      },
      {
        text: '97 to 99% of individuals with warm AIHA will have a positive result with anti-IgG, anti-C3d, or both.',
        refs: [{ panel: 'factoids' }],
        quote: true,
      },
      {
        text: 'A positive DAT does not tell us the antigenic target of a discovered bound antibody, only that one is present.',
        refs: [{ panel: 'factoids' }],
        quote: true,
      },
      {
        text: 'The strength of the DAT positivity generally correlates with the severity of hemolysis.',
        refs: [{ panel: 'factoids' }],
        quote: true,
      },
    ],
    mechanism: {
      key: 'ahg-production',
      intro: 'Where the reagent comes from, as described in the source.',
    },
    interact: {
      key: 'factoid-cards',
      intro: 'Each card states a fact. Flip it to see the misreading it protects against.',
    },
    interpret: [
      {
        text: 'Positive DAT ≠ hemolysis: positives occur in healthy donors and in hospitalized patients who are not hemolyzing.',
        refs: [{ panel: 'factoids' }],
      },
      {
        text: 'Positive DAT ≠ antibody identity: the DAT shows that something is bound, not what antigen it targets.',
        refs: [{ panel: 'factoids' }],
      },
      {
        text: 'Strength is a guide, not a rule: it “generally” correlates with severity.',
        refs: [{ panel: 'factoids' }, { panel: 'proximate' }],
      },
    ],
    check: ['q-donors', 'q-hospital', 'q-target', 'q-ahg-made'],
    flags: ['no-references'],
  },
  {
    id: 'results',
    number: 6,
    title: 'True and false results',
    objective: 'Classify causes of false-negative, true-negative, false-positive and true-positive DATs.',
    refs: [{ panel: 'results' }],
    explain: [
      {
        text:
          'False negative causes listed in the source: improper or under-washing; under-centrifuging the sample; failure to add AHG reagents; addition of inactive AHG reagents due to improper storage and handling; delay in the addition of AHG after washing.',
        refs: [{ panel: 'results', detail: 'False negative' }],
      },
      {
        text:
          'True negative: no antibody or complement detected on the surface of the red cells by the AHG reagents. The source also lists DAT-negative hemolytic anemia (i.e., IgA mediated, drug mediated) here.',
        refs: [{ panel: 'results', detail: 'True negative' }],
      },
      {
        text:
          'False positive causes listed in the source: nonspecific binding of the DAT reagents; delay in the addition of AHG after washing; over-centrifugation.',
        refs: [{ panel: 'results', detail: 'False positive' }],
      },
      {
        text:
          'True positive causes: autoimmune hemolytic anemia (warm, cold, mixed, paroxysmal cold hemoglobinuria); drug-induced hemolytic anemia; alloimmune causes — transfusion related (e.g., acute hemolytic transfusion reaction, delayed hemolytic or serologic transfusion reaction) and maternal alloantibodies that cross the placenta and bind to fetal cells (hemolytic disease of the fetus/newborn); and passive transfer of antibody in immunoglobulin preparations (e.g., IVIG).',
        refs: [{ panel: 'results', detail: 'True positive' }],
      },
    ],
    mechanism: {
      key: 'results-map',
      intro: 'The source’s four result categories. Select a cause to see where it sits.',
    },
    interact: {
      key: 'troubleshooter',
      intro: 'Introduce one technical error at a time and see how the reading changes — and whether check cells would catch it.',
    },
    interpret: [
      {
        text:
          'A negative DAT in a patient with hemolysis is not automatically a technical failure: the source lists DAT-negative hemolytic anemia (IgA-mediated, drug-mediated) under true negatives.',
        refs: [{ panel: 'results', detail: 'True negative' }],
      },
      {
        text: 'A positive DAT has technical and biological explanations; both lists must be considered.',
        refs: [{ panel: 'results' }],
      },
    ],
    check: ['q-false-pos', 'q-false-neg', 'q-dat-neg-ha'],
    flags: ['delay-both-lists', 'agh-typo'],
  },
  {
    id: 'patterns',
    number: 7,
    title: 'Classic patterns of response',
    objective: 'Use monospecific results to place a positive polyspecific DAT into the source’s three classic patterns.',
    refs: [{ panel: 'patterns' }],
    explain: [
      {
        text:
          'The source’s algorithm: positive polyspecific DAT → perform monospecific DAT → what is positive? Anti-IgG, anti-IgG & anti-C3, or anti-C3.',
        refs: [{ panel: 'patterns' }],
      },
      {
        text:
          'Anti-IgG only: warm autoimmune hemolytic anemia (WAIHA); alloimmune hemolytic anemia (i.e., acute or delayed hemolytic transfusion reaction); hemolytic disease of the fetus and newborn (HDFN); drug-induced hemolytic anemia; passive acquisition.',
        refs: [{ panel: 'patterns', detail: 'column: Anti-IgG' }],
      },
      {
        text: 'Anti-IgG & anti-C3: WAIHA; mixed autoimmune hemolytic anemia; drug-induced hemolytic anemia.',
        refs: [{ panel: 'patterns', detail: 'column: Anti-IgG & Anti-C3' }],
      },
      {
        text: 'Anti-C3 only: cold agglutinin disease; paroxysmal cold hemoglobinuria; drug-induced hemolytic anemia.',
        refs: [{ panel: 'patterns', detail: 'column: Anti-C3' }],
      },
    ],
    interact: {
      key: 'pattern-flowchart',
      intro: 'Walk the algorithm. Choose the monospecific result and see which conditions the source lists.',
    },
    interpret: [
      {
        text:
          'Each pattern lists several conditions, and drug-induced hemolytic anemia appears in all three. The pattern narrows possibilities; it does not make a diagnosis on its own.',
        refs: [{ panel: 'patterns' }],
      },
    ],
    check: ['q-pattern-c3', 'q-pattern-igg'],
    flags: ['c3-terminology'],
  },
  {
    id: 'mechanisms',
    number: 8,
    title: 'Proximate mechanisms',
    objective: 'Relate the reagent that reacted to the antibody class bound in vivo, state detection limits, and explain check cells.',
    refs: [{ panel: 'proximate' }],
    explain: [
      {
        text:
          'The type of bound antibody can be inferred from the reagent that caused the positive reaction; a positive reaction with anti-IgG implies an IgG antibody was bound to the red cells in vivo, and a positive reaction with anti-C3d implies an IgM antibody was bound to the red cells in vivo.',
        refs: [{ panel: 'proximate' }],
        quote: true,
      },
      {
        text: 'On tested red cells, the DAT can detect as low as 100–500 molecules of IgG and 400–1,100 molecules of C3.',
        refs: [{ panel: 'proximate' }],
      },
      {
        text:
          'Negative reactions should always be validated by adding antibody-coated reagent cells (check cells) to the non-reactive solution. Lack of agglutination with the addition of check cells should trigger concern for possible technical error.',
        refs: [{ panel: 'proximate' }],
        quote: true,
      },
    ],
    mechanism: {
      key: 'check-cell-animation',
      intro: 'Validating a negative: what check cells reveal in a valid and an invalid tube.',
    },
    interact: {
      key: 'detection-limits',
      intro: 'Move the coating level and compare it with the detection range the source gives.',
    },
    interpret: [
      {
        text:
          'A negative DAT means coating was not detected — the source’s detection limits show that very low coating can fall below what the test can see.',
        refs: [{ panel: 'proximate' }],
      },
    ],
    check: ['q-c3d-igm', 'q-limit', 'q-checkcells-fail'],
    flags: ['c3d-igm-inference', 'no-references'],
  },
  {
    id: 'history',
    number: 9,
    title: 'History of medicine',
    objective: 'Place the antiglobulin principle in its history as given by the source.',
    refs: [{ panel: 'history' }],
    explain: [
      {
        text:
          'In 1945, Coombs, Mourant, and Race described the use of anti-human globulin serum for the detection of red cell-bound non-agglutinating antibodies. This test (the Coombs test) was rapidly applied and was helpful in numerous discoveries, including describing blood groups, hemolytic anemia caused by antibodies, and hemolytic disease of the fetus and newborn (HDFN).',
        refs: [{ panel: 'history' }],
        quote: true,
      },
      {
        text: 'Interestingly, it seems that this principle was described several decades earlier by Moreschi in 1908.',
        refs: [{ panel: 'history' }],
        quote: true,
      },
      {
        text: 'The DAT is still in use and remains one of the most valuable tools in the Blood Bank.',
        refs: [{ panel: 'history' }],
        quote: true,
      },
    ],
    interact: { key: 'history-timeline', intro: 'Select an event on the timeline.' },
    interpret: [
      {
        text:
          '“Non-agglutinating antibodies” is the key phrase: the antiglobulin reagent made visible a binding that did not on its own clump cells — the same idea shown in the reaction figure.',
        refs: [{ panel: 'history' }, { panel: 'reaction' }],
      },
    ],
    check: ['q-history'],
    flags: ['no-references'],
  },
  {
    id: 'about-source',
    number: 10,
    title: 'Notes, attributions and source limits',
    objective: 'Know where this material comes from and what it does not cover.',
    refs: [{ panel: 'attributions' }],
    explain: [
      {
        text: 'Source infographic: “Direct Antiglobulin Test (DAT)”, The Blood Project — Encyclopedia of Blood. Written by Dr. Bentley Rodrigue; graphic design by Janie Vu.',
        refs: [{ panel: 'attributions' }],
      },
    ],
    interact: { key: 'attributions', intro: 'Source details, flagged issues, and topics outside the source.' },
    interpret: [],
    check: [],
  },
];
