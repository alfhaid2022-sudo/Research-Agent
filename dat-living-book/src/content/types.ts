// Content model for a living-book chapter. A new chapter is added by creating a
// folder under src/content/<chapter-id>/ that exports a `Chapter` and registering
// it in src/content/registry.ts. Nothing in the UI is DAT-specific except the
// interactive components referenced by `InteractiveKey`.

/** A locator inside the original source document. */
export interface SourcePanel {
  id: string;
  /** Page number in the source PDF (1-based). */
  page: number;
  /** Panel heading exactly as printed in the source. */
  label: string;
  /** Vertical extent of the panel on the page, in PDF points (top-left origin). */
  y0: number;
  y1: number;
}

export interface SourceRef {
  panel: string; // SourcePanel.id
  /** Optional finer locator, e.g. "Step 5" or "column: Anti-C3". */
  detail?: string;
}

export interface SourceDocument {
  id: string;
  title: string;
  publisher: string;
  authors: string[];
  pageCount: number;
  pageSizePt: { width: number; height: number };
  pdfPath: string;
  pageImagePath: (page: number) => string;
  panels: SourcePanel[];
}

/** Text whose wording follows the source (paraphrased or quoted). */
export interface SourcedParagraph {
  text: string;
  refs: SourceRef[];
  /** true when `text` reproduces source wording verbatim (shown in quotation style). */
  quote?: boolean;
}

/** An explanation that is NOT in the source (analogy, background). Always rendered with a label. */
export interface TeachingNote {
  title: string;
  text: string;
}

/** A problem, gap or internal inconsistency found in the source. */
export interface SourceFlag {
  id: string;
  title: string;
  text: string;
  refs: SourceRef[];
}

export type InteractiveKey =
  | 'coating-gallery'
  | 'procedure-animation'
  | 'crosslink-animation'
  | 'reaction-explorer'
  | 'virtual-lab-link'
  | 'factoid-cards'
  | 'ahg-production'
  | 'troubleshooter'
  | 'results-map'
  | 'pattern-flowchart'
  | 'detection-limits'
  | 'check-cell-animation'
  | 'history-timeline'
  | 'attributions';

export interface Section {
  id: string;
  number: number;
  title: string;
  /** One-line learning objective (authored for this book, derived from the panel content). */
  objective: string;
  refs: SourceRef[];
  explain: SourcedParagraph[];
  mechanism?: { key: InteractiveKey; intro: string };
  interact?: { key: InteractiveKey; intro: string };
  interpret: SourcedParagraph[];
  /** Quiz item ids used as the section's knowledge check. */
  check: string[];
  teachingNotes?: TeachingNote[];
  flags?: string[]; // SourceFlag ids
}

export interface GlossaryEntry {
  term: string;
  aka?: string[];
  definition: string;
  /** 'source' = definition taken from the source; 'teaching' = general background added for this book. */
  origin: 'source' | 'teaching';
  refs: SourceRef[];
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  refs: SourceRef[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  refs: SourceRef[];
}

export interface CaseOption {
  label: string;
  correct: boolean;
  feedback: string;
  refs: SourceRef[];
  next?: string; // node id
}

export interface CaseNode {
  id: string;
  prompt: string;
  /** Optional illustrative observation shown before the decision. */
  observation?: string;
  options: CaseOption[];
}

export interface CaseStudy {
  id: string;
  title: string;
  setting: string;
  start: string;
  nodes: CaseNode[];
  wrapUp: string;
  refs: SourceRef[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  source: SourceDocument;
  sections: Section[];
  glossary: GlossaryEntry[];
  quiz: QuizItem[];
  flashcards: Flashcard[];
  cases: CaseStudy[];
  flags: SourceFlag[];
  /** Topics a learner might expect that the source does NOT cover. */
  notCovered: string[];
}
