export type CoachTopic = 'Teknik' | 'Yarış' | 'Antrenman' | 'Recovery' | 'Beslenme' | 'Mental hazırlık' | 'Sakatlık önleme';

export type CoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  topic?: CoachTopic;
};

export type AthleteCoachContext = {
  firstName?: string;
  age?: string;
  category?: string;
  primaryStroke?: string;
  pb?: string;
};

const topicKeywords: Array<{ topic: CoachTopic; words: string[] }> = [
  { topic: 'Teknik', words: ['serbest', 'kelebek', 'kurbağa', 'kurbağalama', 'sırt', 'sırtüstü', 'start', 'dönüş', 'nefes', 'drill', 'kol', 'ayak'] },
  { topic: 'Yarış', words: ['yarış', 'pb', 'split', 'tempo', 'seri', 'kulvar', 'müsabaka', 'final'] },
  { topic: 'Antrenman', words: ['antrenman', 'set', 'sprint', 'dayanıklılık', 'pace', 'yük', 'interval'] },
  { topic: 'Recovery', words: ['recovery', 'toparlanma', 'yorgun', 'uyku', 'dinlenme', 'mobilite'] },
  { topic: 'Beslenme', words: ['beslenme', 'protein', 'karbonhidrat', 'su', 'hidrasyon', 'öğün'] },
  { topic: 'Sakatlık önleme', words: ['omuz', 'aşil', 'ağrı', 'sakatlık', 'incinme', 'bel', 'diz'] },
  { topic: 'Mental hazırlık', words: ['mental', 'stres', 'heyecan', 'odak', 'korku', 'motivasyon'] },
];

export async function getCoachResponse(question: string, context?: AthleteCoachContext): Promise<CoachMessage> {
  const topic = detectTopic(question);
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    topic,
    content: buildMockAnswer(question, topic, context),
  };
}

export async function askAiCoach(question: string, context?: AthleteCoachContext): Promise<CoachMessage> {
  return getCoachResponse(question, context);
}

function detectTopic(question: string): CoachTopic {
  const normalized = question.toLocaleLowerCase('tr-TR');
  return topicKeywords.find((item) => item.words.some((word) => normalized.includes(word)))?.topic ?? 'Antrenman';
}

function buildMockAnswer(question: string, topic: CoachTopic, context?: AthleteCoachContext) {
  const profileHint = buildProfileHint(context);
  const normalized = question.toLocaleLowerCase('tr-TR');

  if (normalized.includes('nefes')) {
    return `${profileHint}Nefesi geç alma eğilimi varsa ilk 25 m'de baş pozisyonunu sabit tut ve 6x50 tek taraf nefes drill dene. Her 50'nin son 12.5 m bölümünde nefes sayını sabit tutarak ritim kaybını kontrol et.`;
  }

  if (normalized.includes('start')) {
    return `${profileHint}Start için 6 tekrar 15 m çıkış çalışması yap. Suya girişten sonra ilk 5 kulaçta başı sabit tut, ilk nefesi acele alma ve kopuş hızını koru.`;
  }

  if (normalized.includes('dönüş')) {
    return `${profileHint}Dönüşte zaman kaybı varsa 8x25 m duvar yaklaşımı çalış: son 5 m'de kafa pozisyonunu bozma, ayak temasını hızlı yap ve çıkışta streamline süresini koru.`;
  }

  if (normalized.includes('split') || normalized.includes('tempo') || normalized.includes('pb') || normalized.includes('yarış')) {
    return `${profileHint}Yarış planında ilk bölüm kontrollü, orta bölüm ritimli, son 15 m güçlü bitiş olmalı. 100m serbest için ikinci 50 m split farkını +1.5 saniye içinde tutmayı hedefle.`;
  }

  if (normalized.includes('beslenme') || normalized.includes('su') || normalized.includes('protein')) {
    return `${profileHint}Yarış veya sert antrenman gününde ana öğünü 3-4 saat önce planla. Antrenman sonrası 20-25 g protein, karbonhidrat ve elektrolit ekle; idrar rengini hidrasyon kontrolü için takip et.`;
  }

  if (normalized.includes('omuz') || normalized.includes('aşil') || normalized.includes('ağrı')) {
    return `${profileHint}Ağrı artıyorsa yükü düşür ve antrenöre bildir. Omuz için düşük dirençli dış rotasyon, skapula aktivasyonu ve 8 dakikalık mobilite rutini ekle; ağrı keskinse sağlık uzmanına danış.`;
  }

  if (normalized.includes('recovery') || normalized.includes('toparlanma') || normalized.includes('yorgun')) {
    return `${profileHint}Bugün recovery odaklı git: 15-20 dk düşük yoğunluk, 8 dk mobilite, yeterli sıvı ve erken uyku. Bir sonraki sert sette nabız ve his skorunu takip et.`;
  }

  if (normalized.includes('mental') || normalized.includes('heyecan') || normalized.includes('odak')) {
    return `${profileHint}Yarış öncesi 3 nefes döngüsü, kısa hedef cümlesi ve ilk 15 m planına odaklan. Sonuç yerine uygulanabilir iki teknik ipucunu düşün: çıkış ve ritim.`;
  }

  const byTopic: Record<CoachTopic, string> = {
    Teknik: 'Teknik cevap: 6x50 drill + 4x25 kontrollü tempo ile hatayı izole et. Her tekrarda tek odak seç ve video varsa baş/kalça hizasını kontrol et.',
    Yarış: 'Yarış cevabı: Isınmada 2 kısa race pace tekrar yap, ilk bölümde acele etme ve son 15 m için kulaç ritmini sabitle.',
    Antrenman: 'Antrenman cevabı: Bugün 8x50 orta tempo + 6x25 sprint ekle. Kalite düşerse dinlenmeyi 15 saniye uzat.',
    Recovery: 'Recovery cevabı: 10 dk mobilite, düşük yoğunluklu yüzme ve uyku takibi ekle. Yorgunluk yüksekse sprint hacmini azalt.',
    Beslenme: 'Beslenme cevabı: Antrenman sonrası karbonhidrat + protein kombinasyonu ve elektrolit planı uygula.',
    'Mental hazırlık': 'Mental hazırlık cevabı: Yarış planını 3 kısa anahtara indir: çıkış, ritim, bitiriş. Her birini görselleştir.',
    'Sakatlık önleme': 'Sakatlık önleme cevabı: Ağrı sinyallerini takip et, omuz ve ayak bileği mobilitesini ihmal etme, keskin ağrıda yükü durdur.',
  };

  return `${profileHint}${byTopic[topic]}`;
}

function buildProfileHint(context?: AthleteCoachContext) {
  if (!context) return '';
  const parts = [
    context.primaryStroke ? `${context.primaryStroke}` : '',
    context.pb ? `PB: ${context.pb}` : '',
    context.age ? `${context.age} yaş` : '',
    context.category,
  ].filter(Boolean);

  return parts.length ? `${parts.join(' • ')} için: ` : '';
}
