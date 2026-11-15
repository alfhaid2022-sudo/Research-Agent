import type { CaseStudy } from '../types';

// ILLUSTRATIVE TEACHING CASES — invented scenarios, not real patients.
// Every judgement in the feedback is tied to a statement in the source.
export const datCases: CaseStudy[] = [
  {
    id: 'case-silent-tube',
    title: 'The silent tube',
    setting:
      'A trainee runs a DAT on a sample sent during a hemolysis workup. After washing, adding polyspecific AHG and centrifuging, no agglutination is seen.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        prompt: 'What is the next step?',
        observation: 'Tube read: no agglutination.',
        options: [
          {
            label: 'Report the DAT as negative',
            correct: false,
            feedback:
              'Not yet. The source says negative reactions should be validated using antibody-coated reagent cells before they are trusted.',
            refs: [{ panel: 'steps', detail: 'Step 5' }],
            next: 'n1',
          },
          {
            label: 'Add antibody-coated reagent cells (check cells) to the non-reactive tube',
            correct: true,
            feedback: 'Correct — step 5 and the Proximate Mechanisms panel both require validating negatives with check cells.',
            refs: [{ panel: 'steps', detail: 'Step 5' }, { panel: 'proximate' }],
            next: 'n2',
          },
          {
            label: 'Centrifuge harder until something appears',
            correct: false,
            feedback: 'Over-centrifugation is listed in the source as a cause of a false-positive DAT.',
            refs: [{ panel: 'results', detail: 'False positive' }],
            next: 'n1',
          },
        ],
      },
      {
        id: 'n2',
        prompt: 'The check cells do NOT agglutinate. How do you interpret this?',
        observation: 'After adding check cells and re-reading: still no agglutination.',
        options: [
          {
            label: 'True negative — no coating on the patient’s cells',
            correct: false,
            feedback:
              'Check cells are already antibody-coated, so they should react if active AHG is in the tube. Their failure means the test itself is in doubt.',
            refs: [{ panel: 'proximate' }],
            next: 'n2',
          },
          {
            label: 'Possible technical error — the negative result is not valid',
            correct: true,
            feedback:
              'Correct. The source: lack of agglutination with check cells should trigger concern for possible technical error. Failure to add AHG and inactive AHG are among the listed false-negative causes.',
            refs: [{ panel: 'proximate' }, { panel: 'results', detail: 'False negative' }],
            next: 'n3',
          },
          {
            label: 'DAT-negative hemolytic anemia',
            correct: false,
            feedback:
              'That is a true-negative category in the source, but it cannot be concluded from a test whose check cells failed.',
            refs: [{ panel: 'results', detail: 'True negative' }, { panel: 'proximate' }],
            next: 'n2',
          },
        ],
      },
      {
        id: 'n3',
        prompt: 'Which items on the source’s false-negative list would you review first?',
        options: [
          {
            label: 'Whether AHG was actually added, and whether the AHG was stored and handled properly',
            correct: true,
            feedback:
              'Reasonable: both are listed false-negative causes, and both concern the reagent that the check cells depend on. (Which errors check cells detect is not spelled out in the source — this is reasoning, not a quoted rule.)',
            refs: [{ panel: 'results', detail: 'False negative' }],
          },
          {
            label: 'Nonspecific binding of reagents',
            correct: false,
            feedback: 'Nonspecific binding is listed as a false-positive cause, not a false-negative one.',
            refs: [{ panel: 'results', detail: 'False positive' }],
            next: 'n3',
          },
        ],
      },
    ],
    wrapUp:
      'A negative reading is only as good as its validation. Repeat the test once the technical cause is addressed.',
    refs: [{ panel: 'steps' }, { panel: 'proximate' }, { panel: 'results' }],
  },
  {
    id: 'case-pattern',
    title: 'Following the pattern',
    setting: 'A polyspecific DAT on an illustrative patient sample is positive, and the check is not needed because the reading is positive.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        prompt: 'What does the source’s algorithm do next after a positive polyspecific DAT?',
        options: [
          {
            label: 'Perform a monospecific DAT',
            correct: true,
            feedback: 'Correct — positive polyspecific DAT → perform monospecific DAT → what is positive?',
            refs: [{ panel: 'patterns' }],
            next: 'n2',
          },
          {
            label: 'Conclude the patient has warm AIHA',
            correct: false,
            feedback:
              'A positive polyspecific DAT appears in many conditions and in healthy donors and hospitalized patients without hemolysis. It does not give a diagnosis.',
            refs: [{ panel: 'factoids' }, { panel: 'results', detail: 'True positive' }],
            next: 'n1',
          },
          {
            label: 'Add check cells',
            correct: false,
            feedback: 'Check cells validate negative reactions. This reaction is positive.',
            refs: [{ panel: 'steps', detail: 'Step 5' }],
            next: 'n1',
          },
        ],
      },
      {
        id: 'n2',
        prompt: 'Monospecific result: anti-C3 positive, anti-IgG negative. Which list does the source give?',
        observation: 'Anti-IgG: no agglutination. Anti-C3d: agglutination.',
        options: [
          {
            label: 'Cold agglutinin disease, paroxysmal cold hemoglobinuria, drug-induced hemolytic anemia',
            correct: true,
            feedback: 'Correct — this is the anti-C3 column.',
            refs: [{ panel: 'patterns', detail: 'column: Anti-C3' }],
            next: 'n3',
          },
          {
            label: 'HDFN, passive acquisition, alloimmune hemolytic anemia',
            correct: false,
            feedback: 'Those are in the anti-IgG column.',
            refs: [{ panel: 'patterns', detail: 'column: Anti-IgG' }],
            next: 'n2',
          },
          {
            label: 'WAIHA and mixed autoimmune hemolytic anemia',
            correct: false,
            feedback: 'Those are in the anti-IgG & anti-C3 column.',
            refs: [{ panel: 'patterns', detail: 'column: Anti-IgG & Anti-C3' }],
            next: 'n2',
          },
        ],
      },
      {
        id: 'n3',
        prompt: 'What does the source say a positive anti-C3d reaction implies about the antibody bound in vivo?',
        options: [
          {
            label: 'An IgM antibody was bound',
            correct: true,
            feedback:
              'Correct — the source’s inference. Note the source does not tell you which antigen that antibody targets.',
            refs: [{ panel: 'proximate' }, { panel: 'factoids' }],
          },
          {
            label: 'An IgG antibody was bound',
            correct: false,
            feedback: 'The source links IgG to a positive anti-IgG reaction, which was negative here.',
            refs: [{ panel: 'proximate' }],
            next: 'n3',
          },
        ],
      },
    ],
    wrapUp:
      'The pattern narrows the list; drug-induced hemolytic anemia appears in every column, so clinical information is still needed.',
    refs: [{ panel: 'patterns' }, { panel: 'proximate' }],
  },
  {
    id: 'case-donor',
    title: 'Positive, but well',
    setting:
      'In an illustrative scenario, a healthy blood donor with no evidence of hemolysis has a positive DAT on routine testing.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        prompt: 'Which statement is supported by the source?',
        options: [
          {
            label: 'A positive DAT can be found in healthy donors without hemolysis (1 in 1,000 to 1 in 14,000)',
            correct: true,
            feedback: 'Correct — a positive DAT is not, by itself, evidence of hemolysis.',
            refs: [{ panel: 'factoids' }],
            next: 'n2',
          },
          {
            label: 'A positive DAT proves hemolysis is occurring',
            correct: false,
            feedback:
              'The source says positives occur in healthy donors without hemolysis, and that not all DAT-positive hospitalized patients are hemolyzing.',
            refs: [{ panel: 'factoids' }],
            next: 'n1',
          },
        ],
      },
      {
        id: 'n2',
        prompt: 'The reaction is weak. Can strength alone tell you how severe any hemolysis is?',
        options: [
          {
            label: 'Not reliably — strength “generally” correlates with severity',
            correct: true,
            feedback: 'Correct — the source qualifies the relationship with “generally”.',
            refs: [{ panel: 'factoids' }, { panel: 'proximate' }],
          },
          {
            label: 'Yes — grade maps exactly to severity',
            correct: false,
            feedback: 'The source does not claim an exact mapping, and it does not give criteria for each grade.',
            refs: [{ panel: 'factoids' }, { panel: 'proximate' }],
            next: 'n2',
          },
        ],
      },
    ],
    wrapUp: 'Interpret the DAT with the clinical picture: a positive result shows coating, not disease.',
    refs: [{ panel: 'factoids' }],
  },
  {
    id: 'case-ivig',
    title: 'Borrowed antibody',
    setting:
      'In an illustrative scenario, a patient recently received an immunoglobulin preparation (IVIG). The monospecific DAT shows anti-IgG positive only.',
    start: 'n1',
    nodes: [
      {
        id: 'n1',
        prompt: 'Which of these is listed by the source as a cause consistent with this result?',
        observation: 'Anti-IgG: agglutination. Anti-C3d: no agglutination.',
        options: [
          {
            label: 'Passive transfer of antibody in immunoglobulin preparations (e.g., IVIG)',
            correct: true,
            feedback:
              'Correct — listed as a true-positive cause and as “passive acquisition” in the anti-IgG column. The same column also lists WAIHA, alloimmune HA, HDFN and drug-induced HA.',
            refs: [{ panel: 'results', detail: 'True positive' }, { panel: 'patterns', detail: 'column: Anti-IgG' }],
            next: 'n2',
          },
          {
            label: 'Cold agglutinin disease',
            correct: false,
            feedback: 'Cold agglutinin disease is listed under the anti-C3 pattern, which is negative here.',
            refs: [{ panel: 'patterns', detail: 'column: Anti-C3' }],
            next: 'n1',
          },
        ],
      },
      {
        id: 'n2',
        prompt: 'Can the DAT alone tell you which of the anti-IgG-pattern causes is responsible?',
        options: [
          {
            label: 'No — the pattern lists several causes, and the DAT does not identify the antigenic target',
            correct: true,
            feedback:
              'Correct. Follow-up investigations are outside this source and are not described in this book.',
            refs: [{ panel: 'patterns' }, { panel: 'factoids' }],
          },
          {
            label: 'Yes — anti-IgG positive means passive transfer',
            correct: false,
            feedback: 'The anti-IgG column lists five possibilities; passive acquisition is only one.',
            refs: [{ panel: 'patterns', detail: 'column: Anti-IgG' }],
            next: 'n2',
          },
        ],
      },
    ],
    wrapUp: 'Medication and transfusion history help interpret an anti-IgG pattern; the DAT itself cannot separate the listed causes.',
    refs: [{ panel: 'patterns' }, { panel: 'results' }],
  },
];
