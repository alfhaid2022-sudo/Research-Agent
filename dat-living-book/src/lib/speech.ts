// Thin wrapper over the browser Web Speech API. Always user-triggered.
export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

export function speakSequence(
  lines: string[],
  onLine: (index: number) => void,
  onDone: () => void,
  rate = 1,
): () => void {
  if (!speechSupported()) {
    onDone();
    return () => {};
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  let cancelled = false;
  const speakAt = (i: number) => {
    if (cancelled) return;
    if (i >= lines.length) {
      onDone();
      return;
    }
    onLine(i);
    const u = new SpeechSynthesisUtterance(lines[i]);
    u.lang = 'en-US';
    u.rate = rate;
    u.onend = () => speakAt(i + 1);
    u.onerror = () => {
      if (!cancelled) onDone();
    };
    synth.speak(u);
  };
  speakAt(0);
  return () => {
    cancelled = true;
    synth.cancel();
  };
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+(?=[A-Z0-9“"(])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
