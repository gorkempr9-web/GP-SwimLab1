export type ModerationMode = 'censor' | 'block';

export type ModerationCategory =
  | 'profanity'
  | 'insult'
  | 'bullying'
  | 'threat'
  | 'harassment'
  | 'hate'
  | 'violence'
  | 'sexual'
  | 'doping'
  | 'self_harm';

export type ModerationResult = {
  allowed: boolean;
  original: string;
  sanitized: string;
  categories: ModerationCategory[];
  warning?: string;
};

const turkishProfanity = [
  'amk',
  'aq',
  'salak',
  'aptal',
  'gerizekalı',
  'mal',
  'küfür',
  'pislik',
];

const englishProfanity = [
  'fuck',
  'shit',
  'idiot',
  'stupid',
  'moron',
  'loser',
  'bastard',
];

const riskPatterns: Array<{ terms: string[]; category: ModerationCategory }> = [
  { category: 'insult', terms: ['beceriksiz', 'ezik', 'çöp', 'rezilsin', 'you suck', 'worthless'] },
  { category: 'bullying', terms: ['dalga geç', 'kimse seni istemiyor', 'takımdan atıl', 'quit swimming'] },
  { category: 'threat', terms: ['seni döverim', 'tehdit', 'öldürürüm', 'hurt you', 'kill you'] },
  { category: 'harassment', terms: ['rahatsız edeceğim', 'peşini bırakmam', 'harass'] },
  { category: 'hate', terms: ['nefret söylemi', 'ırkçı', 'racist slur'] },
  { category: 'violence', terms: ['şiddet çağrısı', 'saldırın', 'attack them'] },
  { category: 'sexual', terms: ['cinsel içerik', 'explicit photo', 'nude'] },
  { category: 'doping', terms: ['doping yap', 'steroid kullan', 'use steroids', 'epo kullan'] },
  { category: 'self_harm', terms: ['kendine zarar ver', 'self harm', 'hurt yourself'] },
];

const blockedTerms = [...turkishProfanity, ...englishProfanity];
const communityWarning = 'Topluluk kurallarına aykırı içerik algılandı.';

export function moderateText(text: string, mode: ModerationMode = 'block'): ModerationResult {
  const normalized = normalize(text);
  const categories = new Set<ModerationCategory>();

  for (const term of blockedTerms) {
    if (containsTerm(normalized, term)) {
      categories.add('profanity');
    }
  }

  for (const pattern of riskPatterns) {
    if (pattern.terms.some((term) => containsTerm(normalized, term))) {
      categories.add(pattern.category);
    }
  }

  const sanitized = censorProfanity(text);
  const hasRisk = categories.size > 0;

  return {
    allowed: mode === 'censor' ? !hasBlockingRisk(categories) : !hasRisk,
    original: text,
    sanitized,
    categories: [...categories],
    warning: hasRisk ? communityWarning : undefined,
  };
}

export function censorProfanity(text: string) {
  return blockedTerms.reduce((current, term) => {
    const escaped = escapeRegExp(term);
    return current.replace(new RegExp(escaped, 'giu'), (match) => '*'.repeat(match.length));
  }, text);
}

function hasBlockingRisk(categories: Set<ModerationCategory>) {
  const blocking: ModerationCategory[] = ['bullying', 'threat', 'harassment', 'hate', 'violence', 'sexual', 'doping', 'self_harm'];
  return blocking.some((category) => categories.has(category));
}

function containsTerm(text: string, term: string) {
  return text.includes(normalize(term));
}

function normalize(text: string) {
  return text.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
