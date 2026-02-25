export interface MatchResult {
  winner: 'cristiano' | 'messi';
  score: { left: number; right: number };
  date: string;
}

const STORAGE_KEY = 'messi-vs-cristiano-match-history';
const MAX_RESULTS = 5;

export function saveMatchResult(result: MatchResult): void {
  const history = getMatchHistory();
  history.unshift(result);
  if (history.length > MAX_RESULTS) history.length = MAX_RESULTS;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage may be unavailable
  }
}

export function getMatchHistory(): MatchResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getRivalryTally(): { cristiano: number; messi: number } {
  const history = getMatchHistory();
  return {
    cristiano: history.filter((r) => r.winner === 'cristiano').length,
    messi: history.filter((r) => r.winner === 'messi').length,
  };
}
