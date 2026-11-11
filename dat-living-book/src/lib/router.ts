import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'section'; id: string }
  | { name: 'lab' }
  | { name: 'cases' }
  | { name: 'quiz' }
  | { name: 'flashcards' }
  | { name: 'glossary' }
  | { name: 'bookmarks' }
  | { name: 'source' };

export function parseHash(h: string): Route {
  const parts = h.replace(/^#\/?/, '').split('/').filter(Boolean);
  switch (parts[0]) {
    case 'section':
      return parts[1] ? { name: 'section', id: parts[1] } : { name: 'home' };
    case 'lab':
    case 'cases':
    case 'quiz':
    case 'flashcards':
    case 'glossary':
    case 'bookmarks':
    case 'source':
      return { name: parts[0] };
    default:
      return { name: 'home' };
  }
}

export function routeKey(r: Route) {
  return r.name === 'section' ? `section/${r.id}` : r.name;
}

export function useRoute(): Route {
  const [r, setR] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const on = () => setR(parseHash(window.location.hash));
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return r;
}

export const go = (key: string) => {
  window.location.hash = `#/${key}`;
};
