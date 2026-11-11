import type { Chapter } from '../types';
import { datSource, datFlags, datNotCovered } from './source';
import { datSections } from './sections';
import { datGlossary } from './glossary';
import { datQuiz, datFlashcards } from './assessment';
import { datCases } from './cases';

export const datChapter: Chapter = {
  id: 'dat',
  title: 'Direct Antiglobulin Test (DAT)',
  subtitle: 'A living edition of the DAT infographic for laboratory science students and blood-bank trainees',
  source: datSource,
  sections: datSections,
  glossary: datGlossary,
  quiz: datQuiz,
  flashcards: datFlashcards,
  cases: datCases,
  flags: datFlags,
  notCovered: datNotCovered,
};
