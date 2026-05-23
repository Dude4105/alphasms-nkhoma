export function normalizeSubjectKey(name: string): string {
  if (!name) return 'unknown';

  // Normalize input for dictionary lookup
  const normalizedName = name.trim();
  const lowerName = normalizedName.toLowerCase();

  const map: Record<string, string> = {
    biology: 'bio',
    mathematics: 'math',
    english: 'eng',
    chichewa: 'chi',
    'physical science': 'phys',
    chemistry: 'chem',
    physics: 'physics',
    history: 'hist',
    geography: 'geog',
    agriculture: 'agri',
    'social studies': 'social',
    'business studies': 'biz',
    'computer studies': 'comp',
    'home economics': 'home',
  };

  if (map[lowerName]) return map[lowerName];

  return lowerName
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 10);
}
