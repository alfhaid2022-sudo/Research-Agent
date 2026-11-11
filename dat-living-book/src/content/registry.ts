import type { Chapter } from './types';
import { datChapter } from './dat';

// Converted chapters only. To add a chapter, create src/content/<id>/index.ts
// exporting a Chapter, then append it here. Do not list unconverted material.
export const chapters: Chapter[] = [datChapter];

export const currentChapter = chapters[0];
