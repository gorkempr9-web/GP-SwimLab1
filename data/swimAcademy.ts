export type SwimStyle = 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';

export type SwimAcademyCard = {
  id: string;
  style: SwimStyle;
  title: string;
  subtitle: string;
  benefits: string[];
  waterDrills: string[];
  dryland: string[];
  commonMistakes: string[];
  level: string;
  duration: string;
  equipment: string;
  coachNote: string;
  description: string;
  steps: string[];
  coachTip: string;
};

export type AcademyAnimationType = 'vector-placeholder' | 'svg-sequence' | 'lottie' | 'frame-sequence';

export type AcademyMovementArrow = {
  label: string;
  direction: string;
  description: string;
};

export type AcademyKeyPoint = {
  label: string;
  description: string;
};

export type SwimAcademyAnimation = {
  animationType: AcademyAnimationType;
  animationAsset: string;
  viewAngle: string;
  movementArrows: AcademyMovementArrow[];
  keyPoints: AcademyKeyPoint[];
  commonMistakes: string[];
  relatedDrylandAnimations: string[];
  correctCue: string;
  incorrectCue: string;
};

export type DrylandAnimationPlaceholder = SwimAcademyAnimation & {
  name: string;
};

export const swimStyles: Array<{ id: SwimStyle; label: string; color: string }> = [
  { id: 'freestyle', label: 'Serbest', color: '#38BDF8' },
  { id: 'breaststroke', label: 'Kurbağalama', color: '#F97316' },
  { id: 'backstroke', label: 'Sırtüstü', color: '#FFFFFF' },
  { id: 'butterfly', label: 'Kelebek', color: '#38BDF8' },
];

const defaults = {
  benefits: ['Teknik verimi artırır', 'Yarış ritmini güçlendirir', 'Enerji kaybını azaltır', 'Hareket kalitesini geliştirir'],
  dryland: ['Core aktivasyon', 'Mobilite akışı', 'Elastik bant kontrolü'],
  commonMistakes: ['Pozisyonu aceleye getirmek', 'Ritmi bozmak', 'Drilli yarış temposuna fazla hızlı taşımak'],
  steps: ['Tekniği düşük tempoda kur.', 'Drill sırasında tek odak seç.', 'Kısa tekrarlarla kaliteyi koru.', 'Tam stile geçip hissi test et.'],
};

function makeCard(input: {
  id: string;
  style: SwimStyle;
  title: string;
  subtitle: string;
  waterDrills: string[];
  description: string;
  benefits?: string[];
  dryland?: string[];
  commonMistakes?: string[];
  level?: string;
  duration?: string;
  equipment?: string;
  coachNote?: string;
  steps?: string[];
  coachTip?: string;
}): SwimAcademyCard {
  return {
    benefits: defaults.benefits,
    dryland: defaults.dryland,
    commonMistakes: defaults.commonMistakes,
    level: 'Orta',
    duration: '12-18 dk',
    equipment: 'Opsiyonel ekipman',
    coachNote: 'Drill kalitesi düşerse tekrar sayısını azalt, tekniği temiz tut.',
    steps: defaults.steps,
    coachTip: 'Önce hissi, sonra hızı inşa et.',
    ...input,
  };
}

export const swimAcademyCards: SwimAcademyCard[] = [
  makeCard({
    id: 'freestyle-high-elbow-catch',
    style: 'freestyle',
    title: 'High Elbow Catch',
    subtitle: 'Ön kolu erken dikleştir, suyu geriye taşı.',
    benefits: ['Daha güçlü su tutuşu', 'Daha verimli çekiş', 'Daha az enerji kaybı', 'Daha uzun kulaç'],
    waterDrills: ['Tek Kol Serbest', 'Catch-Up Drill', 'Fist Drill', 'Paddle Kontrollü Çekiş'],
    dryland: ['Elastik Bant Çekiş', 'Plank Reach', 'Lat Aktivasyon'],
    commonMistakes: ['Dirseği düşürmek', 'Eli aşağı bastırmak', 'Baş pozisyonunu oynatmak'],
    level: 'Orta / Performans',
    duration: '15-20 dk',
    equipment: 'Şnorkel, pull buoy, lastik',
    coachNote: 'Her 25m sonunda sporcudan su tutuş hissini tarif etmesini iste.',
    description: 'Serbest stilde suyu kaybetmeden etkili çekiş başlatmayı öğretir.',
    steps: ['Omuzu gevşek tut.', 'El suya girdikten sonra bileği sabitle.', 'Dirseği yüksek bırakıp ön kolu dikleştir.', 'Suyu kalçaya doğru geriye taşı.'],
    coachTip: 'Tempo artmadan önce formu kilitle; hız sonradan gelir.',
  }),
  makeCard({
    id: 'freestyle-body-position',
    style: 'freestyle',
    title: 'Body Position',
    subtitle: 'Yüksek kalça, uzun hat, düşük direnç.',
    waterDrills: ['Superman Glide', '6 Kick Switch', 'Side Kick', 'Streamline Push'],
    benefits: ['Daha az sürtünme', 'Daha iyi nefes kontrolü', 'Ekonomik yüzüş', 'Daha stabil yön'],
    dryland: ['Hollow body hold', 'Glute bridge', 'Dead bug'],
    commonMistakes: ['Kalçayı düşürmek', 'Çeneyi kaldırmak', 'Fazla bel çukuru'],
    level: 'Başlangıç / Orta',
    equipment: 'Tahta, şnorkel',
    description: 'Doğru vücut pozisyonu tüm serbest teknik çalışmalarının temelidir.',
    coachTip: 'Baş düzelse bile kalça düşüyorsa core aktivasyonuna dön.',
  }),
  makeCard({
    id: 'freestyle-kick-power',
    style: 'freestyle',
    title: 'Freestyle Kick Power',
    subtitle: 'Kalçadan başlayan küçük ve hızlı ayak.',
    waterDrills: ['Vertical Kick', 'Kick Board Sprint', 'Side Kick', 'Fin Sprint'],
    benefits: ['Daha iyi denge', 'Sprintte hız artışı', 'Ritim kontrolü', 'Kalça pozisyonu'],
    dryland: ['Hip flexor band kick', 'Single-leg bridge', 'Ankle mobility'],
    commonMistakes: ['Dizden tekme atmak', 'Ayağı çok geniş açmak', 'Bileği sert tutmak'],
    level: 'Tüm seviyeler',
    equipment: 'Tahta, palet',
    description: 'Serbest ayak gücü hem su üstü ritmi hem de vücut pozisyonunu destekler.',
    coachTip: 'Güçlü ayak her zaman büyük ayak değildir; küçük ve hızlı düşün.',
  }),
  makeCard({
    id: 'freestyle-breathing-timing',
    style: 'freestyle',
    title: 'Breathing Timing',
    subtitle: 'Nefes geç değil, ritim içinde alınır.',
    waterDrills: ['3 Kulaç Nefes', '5 Kulaç Nefes', 'Yan Nefes', 'Bilateral Breathing'],
    benefits: ['Tempo kaybı azalır', 'Baş pozisyonu korunur', 'Yarışta daha sakin ritim', 'Rotasyon kalitesi artar'],
    dryland: ['Thoracic rotation', 'Neck mobility', 'Box breathing'],
    commonMistakes: ['Baş kaldırmak', 'Nefesi çok geç almak', 'Kol girişini geciktirmek'],
    level: 'Başlangıç / Orta',
    equipment: 'Şnorkel opsiyonel',
    description: 'Nefes zamanlaması serbest stilde ritim ve yön kontrolünü doğrudan etkiler.',
    coachTip: 'Nefesi başı kaldırmak yerine rotasyona eşlik etmek gibi anlat.',
  }),
  makeCard({
    id: 'freestyle-start-technique',
    style: 'freestyle',
    title: 'Start Technique',
    subtitle: 'Patlayıcı çıkış, temiz giriş, güçlü breakout.',
    waterDrills: ['Track Start', 'Reaction Start', 'Streamline Dive', 'Underwater Kick'],
    benefits: ['İlk 15m hızlanır', 'Reaksiyon gelişir', 'Yarış başlangıcı netleşir', 'Breakout kalitesi artar'],
    dryland: ['Box jump', 'Split squat jump', 'Med ball throw'],
    commonMistakes: ['Çok derin giriş', 'Streamline bozmak', 'Breakoutta erken nefes'],
    level: 'Orta / Performans',
    equipment: 'Start bloğu',
    description: 'Start tekniği yarışın ilk metrelerinde ücretsiz hız kazanma alanıdır.',
    coachTip: 'Kötü giriş iyi reaksiyonu boşa harcar; kaliteyi öncele.',
  }),
  makeCard({
    id: 'breast-frog-kick-mobility',
    style: 'breaststroke',
    title: 'Frog Kick Mobility',
    subtitle: 'Kalça ve ayak bileği mobilitesiyle etkili itiş.',
    waterDrills: ['Frog Mobility', 'Frog Hold', 'Frog Pulse', 'Resistance Band Kick'],
    benefits: ['Daha güçlü itiş', 'Diz yükü azalır', 'Glide daha verimli olur', 'Ayak tabanı suyu daha iyi yakalar'],
    dryland: ['Hip opener', 'Adductor rockback', 'Ankle external rotation'],
    commonMistakes: ['Dizi çok açmak', 'Ayağı içe kapatmak', 'İtişi yarım bırakmak'],
    level: 'Başlangıç / Orta',
    equipment: 'Tahta',
    description: 'Kurbağalama ayak stilin ana itiş kaynağıdır ve mobiliteyle desteklenmelidir.',
    coachTip: 'Diz değil ayak tabanı suyu iter.',
  }),
  makeCard({
    id: 'breast-glide-position',
    style: 'breaststroke',
    title: 'Glide Position',
    subtitle: 'Her itişten sonra uzun ve sakin süzül.',
    waterDrills: ['Long Glide', 'Kick Glide Count', 'Streamline Breast Kick', 'Pause Glide Drill'],
    benefits: ['Daha ekonomik yüzüş', 'Tempo kontrolü', 'Direnç azalır', 'Süzülme kalitesi artar'],
    description: 'Glide pozisyonu kurbağalamada hızın korunmasını sağlar.',
    coachTip: 'Fazla glide de hız öldürür; amaç uzun ama canlı kalmak.',
  }),
  makeCard({
    id: 'breast-pull-out',
    style: 'breaststroke',
    title: 'Pull-Out Technique',
    subtitle: 'Su altında tek güçlü çekiş ve kontrollü çıkış.',
    waterDrills: ['Pull-Out Sequence', 'Dolphin + Pull', 'Breakout Timing', 'Streamline Pull-Out'],
    benefits: ['Dönüş sonrası hız', 'Start sonrası avantaj', 'Daha iyi streamline', 'Breakout verimi'],
    level: 'Performans',
    equipment: 'Lastik, pull buoy',
    description: 'Pull-out start ve dönüşlerden sonra kritik hız bölümüdür.',
    coachTip: 'Yüzeye çıkışta ilk kulaç suyu kaçırmamalı.',
  }),
  makeCard({
    id: 'breast-timing',
    style: 'breaststroke',
    title: 'Breaststroke Timing',
    subtitle: 'Çek, nefes, ayak, süzül ritmini bağla.',
    waterDrills: ['1 Pull 2 Kick', 'Timing Count', 'Pause Drill', 'Fast Hands Drill'],
    benefits: ['Stil akıcılığı', 'Enerji tasarrufu', 'Diskalifiye riski azalır', 'Ritim netleşir'],
    description: 'Kurbağalama zamanlaması stilin hız ve verimliliğini belirler.',
    coachTip: 'Kurbağalama güçten önce zamanlama stilidir.',
  }),
  makeCard({
    id: 'breast-turn-finish',
    style: 'breaststroke',
    title: 'Turn & Finish',
    subtitle: 'Çift el temas, hızlı dönüş, net bitiriş.',
    waterDrills: ['Two-Hand Touch', 'Compact Turn', 'Finish Reach', 'Wall Push Streamline'],
    benefits: ['Kural güvenliği', 'Dönüş hızı', 'Finish kalitesi', 'Son metre kontrolü'],
    description: 'Kurbağalama dönüş ve bitiriş, teknik kural hassasiyeti yüksek bölümlerdir.',
    coachTip: 'Son metrelerde panik değil uzunluk kazandır.',
  }),
  makeCard({
    id: 'back-body-rotation',
    style: 'backstroke',
    title: 'Body Rotation',
    subtitle: 'Omuz-kalça rotasyonu ile uzun çekiş.',
    waterDrills: ['6 Kick Switch', 'Single Arm Backstroke', 'Shoulder Roll Drill', 'Rotation Line Drill'],
    benefits: ['Daha uzun kulaç', 'Omuz rahatlığı', 'Daha iyi yön kontrolü', 'Su tutuşu güçlenir'],
    description: 'Sırtüstü rotasyon kolun suyu daha etkili yakalamasını sağlar.',
    coachTip: 'Sırtüstünde rota baştan değil gövdeden gelir.',
  }),
  makeCard({
    id: 'back-kick',
    style: 'backstroke',
    title: 'Backstroke Kick',
    subtitle: 'Yüzeye yakın, sürekli ve küçük ayak.',
    waterDrills: ['Streamline Back Kick', 'Cup on Forehead', 'Kick Tempo Build', 'Wall Kick Hold'],
    benefits: ['Kalça pozisyonu', 'Ritim sürekliliği', 'Yön stabilitesi', 'Daha temiz çizgi'],
    description: 'Sırtüstü ayak vücut çizgisini ve yarış ritmini korur.',
    coachTip: 'Sıçrayan su çoksa diz fazla çalışıyor olabilir.',
  }),
  makeCard({
    id: 'back-entry-position',
    style: 'backstroke',
    title: 'Entry Position',
    subtitle: 'Serçe parmakla temiz giriş, omuz çizgisiyle çekiş.',
    waterDrills: ['Single Arm Entry', '12 O’clock Line', 'Catch Hold Drill', 'Pinkie Entry Drill'],
    benefits: ['Su tutuşu iyileşir', 'Omuz stresi azalır', 'Çapraz yüzüş azalır', 'Çekiş yönü netleşir'],
    description: 'Doğru giriş sırtüstünde çekişin yönünü ve dengeyi belirler.',
    coachTip: 'Geniş giriş güç değil yön kaybı yaratır.',
  }),
  makeCard({
    id: 'back-start',
    style: 'backstroke',
    title: 'Start Technique',
    subtitle: 'Patlayıcı itiş ve temiz sırtüstü giriş.',
    waterDrills: ['Back Start Repeats', 'Arch Entry', 'Underwater Breakout', 'Reaction Start'],
    benefits: ['İlk 15m avantajı', 'Daha hızlı breakout', 'Güvenli başlangıç', 'Streamline kalitesi'],
    level: 'Performans',
    description: 'Sırtüstü start patlayıcı kuvvet ve vücut yayını birlikte ister.',
    coachTip: 'Yüksek kalça daha temiz giriş demektir.',
  }),
  makeCard({
    id: 'back-turn',
    style: 'backstroke',
    title: 'Backstroke Turn',
    subtitle: 'Son kulaç sayımı ve hızlı takla dönüş.',
    waterDrills: ['Flag Count', 'Flip Turn Timing', 'Underwater Push-Off', 'Backstroke Finish Count'],
    benefits: ['Dönüş hızı', 'Mesafe kontrolü', 'Diskalifiye riski azalır', 'İtiş kalitesi artar'],
    description: 'Sırtüstü dönüş mesafe algısı ve takla hızını birleştirir.',
    coachTip: 'Dönüşte hız, duvara yakınlık kadar kompaktlıktan gelir.',
  }),
  makeCard({
    id: 'fly-body-dolphin',
    style: 'butterfly',
    title: 'Body Dolphin',
    subtitle: 'Dalga gövdeden başlar, ayakta tamamlanır.',
    waterDrills: ['Body Dolphin', 'Vertical Dolphin', 'Streamline Dolphin', 'Chest Press Drill'],
    benefits: ['Daha akıcı kelebek', 'Bel yükü azalır', 'Ritim güçlenir', 'Ayak-gövde bağlantısı kurulur'],
    description: 'Body dolphin kelebek stilinin temel ritim motorudur.',
    coachTip: 'Kelebekte dalga büyük değil akıllı olmalı.',
  }),
  makeCard({
    id: 'fly-double-kick',
    style: 'butterfly',
    title: 'Double Kick Timing',
    subtitle: 'Birinci ayak girişte, ikinci ayak itişte.',
    waterDrills: ['2 Kick 1 Pull', 'Single Arm Fly', 'Kick-Pull Timing', 'Rhythm Fly Drill'],
    benefits: ['Ritim netleşir', 'Kol toparlanması kolaylaşır', 'Yorgunluk azalır', 'Tempo korunur'],
    description: 'Çift ayak zamanlaması kelebekte akıcılığın anahtarıdır.',
    coachTip: 'İkinci ayak yoksa kollar sudan ağır çıkar.',
  }),
  makeCard({
    id: 'fly-breathing',
    style: 'butterfly',
    title: 'Breathing Rhythm',
    subtitle: 'Nefes kısa, baş düşük, ritim kesintisiz.',
    waterDrills: ['2 Down 1 Breathe', 'Low Breath Fly', 'Single Arm Breath Timing', 'No Breath 25'],
    benefits: ['Kalça düşmez', 'Tempo korunur', 'Daha az enerji kaybı', 'Toparlanma rahatlar'],
    description: 'Kelebek nefesi ritmi bozmayacak kadar kısa ve kontrollü olmalıdır.',
    coachTip: 'Nefes için yukarı değil ileri bak.',
  }),
  makeCard({
    id: 'fly-arm-recovery',
    style: 'butterfly',
    title: 'Arm Recovery',
    subtitle: 'Rahat omuz, geniş toparlanma, yumuşak giriş.',
    waterDrills: ['One Arm Fly', '3 Right 3 Left 3 Full', 'Relaxed Recovery', 'Wide Recovery Drill'],
    benefits: ['Omuz yorgunluğu azalır', 'Giriş kalitesi artar', 'Ritim korunur', 'Suda akış güçlenir'],
    description: 'Arm recovery omuz sağlığı ve ritim için kritik fazdır.',
    coachTip: 'Toparlanma güç gösterisi değil dinlenme fazıdır.',
  }),
  makeCard({
    id: 'fly-underwater-dolphin',
    style: 'butterfly',
    title: 'Underwater Dolphin',
    subtitle: 'Streamline içinde güçlü ve kontrollü su altı.',
    waterDrills: ['Streamline Dolphin', '8 Kick Breakout', 'Depth Control Dolphin', '15m Underwater Drill'],
    benefits: ['Start/dönüş hızı', 'Yarış avantajı', 'Core kuvveti', 'Breakout kontrolü'],
    level: 'Performans',
    description: 'Underwater dolphin kelebek ve sırtüstü yarışlarda önemli hız alanıdır.',
    coachTip: '15m kuralını değil hız kalitesini antrenman odağı yap.',
  }),
];


export type SwimAcademyDrillDetail = {
  name: string;
  purpose: string;
  howTo: string;
  technicalGain: string[];
  recommendedPractice: string;
  level: string;
  commonMistake: string;
  animation?: SwimAcademyAnimation;
};

function animation(input: {
  style: SwimStyle | 'dryland';
  slug: string;
  viewAngle: string;
  movementArrows: AcademyMovementArrow[];
  keyPoints: AcademyKeyPoint[];
  commonMistakes: string[];
  relatedDrylandAnimations?: string[];
  correctCue: string;
  incorrectCue: string;
}): SwimAcademyAnimation {
  return {
    animationType: 'vector-placeholder',
    animationAsset: `assets/academy/animations/${input.style}/${input.slug}.placeholder.json`,
    viewAngle: input.viewAngle,
    movementArrows: input.movementArrows,
    keyPoints: input.keyPoints,
    commonMistakes: input.commonMistakes,
    relatedDrylandAnimations: input.relatedDrylandAnimations ?? [],
    correctCue: input.correctCue,
    incorrectCue: input.incorrectCue,
  };
}

const animationMap: Record<string, SwimAcademyAnimation> = {
  'Catch-Up Drill': animation({
    style: 'freestyle',
    slug: 'catch-up-drill',
    viewAngle: 'Yan profil / su seviyesi',
    movementArrows: [
      { label: 'Uzama', direction: 'ileri', description: 'Öndeki kol sabit kalır ve vücut uzun hattı korur.' },
      { label: 'Çekiş', direction: 'geriye', description: 'Aktif kol suyu kalçaya doğru taşır.' },
    ],
    keyPoints: [
      { label: 'Öndeki el', description: 'Kollar önde buluşmadan değişim yapılmaz.' },
      { label: 'Kalça hattı', description: 'Kalça su yüzeyine yakın tutulur.' },
    ],
    commonMistakes: ['Kolları erken değiştirmek', 'Baş pozisyonunu kaldırmak'],
    relatedDrylandAnimations: ['Plank Reach', 'Band External Rotation'],
    correctCue: 'Kol değişimi önde tamamlanır, vücut çizgisi uzun kalır.',
    incorrectCue: 'Kollar erken değişirse kulaç kısalır ve denge bozulur.',
  }),
  'Fist Drill': animation({
    style: 'freestyle',
    slug: 'fist-drill',
    viewAngle: 'Ön-yan profil',
    movementArrows: [
      { label: 'Ön kol', direction: 'aşağı-geriye', description: 'Yumruk kapalıyken su tutuş ön kolla hissedilir.' },
      { label: 'Rotasyon', direction: 'sağ-sol', description: 'Gövde rotasyonu çekişi destekler.' },
    ],
    keyPoints: [
      { label: 'Yumruk', description: 'El kapalı, bilek kontrollü kalır.' },
      { label: 'Dirsek', description: 'Dirsek düşmeden çekiş yolu korunur.' },
    ],
    commonMistakes: ['Yumrukla hız zorlamak', 'Ön kolu suya bastırmak'],
    relatedDrylandAnimations: ['Band External Rotation'],
    correctCue: 'Sporcu suyu avuçla değil ön kolla hissetmeye odaklanır.',
    incorrectCue: 'Hız zorlandığında vücut pozisyonu ve catch hissi kaybolur.',
  }),
  'Single Arm': animation({
    style: 'freestyle',
    slug: 'single-arm',
    viewAngle: 'Yan profil',
    movementArrows: [
      { label: 'Tek kol çekiş', direction: 'dairesel ileri-geriye', description: 'Aktif kol tam kulaç yapar.' },
      { label: 'Gövde rotasyonu', direction: 'yan dönüş', description: 'Omuz ve kalça birlikte döner.' },
    ],
    keyPoints: [
      { label: 'Sabit kol', description: 'Önde veya yanda sabit kalır.' },
      { label: 'Nefes', description: 'Rotasyonla birlikte sakin alınır.' },
    ],
    commonMistakes: ['Sabit kolu düşürmek', 'Gövdeyi fazla döndürmek'],
    relatedDrylandAnimations: ['Plank Reach'],
    correctCue: 'Aktif kolun yolu net, sabit kol kontrollüdür.',
    incorrectCue: 'Sabit kol düşerse denge ve çekiş hattı bozulur.',
  }),
  'Tek Kol Serbest': animation({
    style: 'freestyle',
    slug: 'single-arm',
    viewAngle: 'Yan profil',
    movementArrows: [
      { label: 'Tek kol çekiş', direction: 'dairesel ileri-geriye', description: 'Aktif kol tam kulaç yapar.' },
      { label: 'Gövde rotasyonu', direction: 'yan dönüş', description: 'Omuz ve kalça birlikte döner.' },
    ],
    keyPoints: [
      { label: 'Sabit kol', description: 'Önde veya yanda sabit kalır.' },
      { label: 'Nefes', description: 'Rotasyonla birlikte sakin alınır.' },
    ],
    commonMistakes: ['Sabit kolu düşürmek', 'Gövdeyi fazla döndürmek'],
    relatedDrylandAnimations: ['Plank Reach'],
    correctCue: 'Aktif kolun yolu net, sabit kol kontrollüdür.',
    incorrectCue: 'Sabit kol düşerse denge ve çekiş hattı bozulur.',
  }),
  '6 Kick Switch': animation({
    style: 'freestyle',
    slug: 'six-kick-switch',
    viewAngle: 'Üst-yan profil',
    movementArrows: [
      { label: '6 ayak', direction: 'ritmik küçük vuruş', description: 'Yan pozisyonda altı kontrollü ayak vuruşu yapılır.' },
      { label: 'Switch', direction: 'karşı yana dönüş', description: 'Kulaçla diğer yana geçilir.' },
    ],
    keyPoints: [
      { label: 'Yan denge', description: 'Omuz çizgisi su yüzeyine yakın kalır.' },
      { label: 'Geçiş', description: 'Baş sabit, dönüş gövdeden gelir.' },
    ],
    commonMistakes: ['Geçişte başı kaldırmak', 'Ayak ritmini büyütmek'],
    relatedDrylandAnimations: ['Plank Reach'],
    correctCue: 'Altı ayak sonrası kontrollü geçiş ve stabil baş pozisyonu korunur.',
    incorrectCue: 'Baş kalkarsa kalça düşer ve switch gecikir.',
  }),
  'Frog Mobility': animation({
    style: 'breaststroke',
    slug: 'frog-mobility',
    viewAngle: 'Ön profil',
    movementArrows: [
      { label: 'Dış rotasyon', direction: 'dışa açılma', description: 'Kalça ve ayak bileği kontrollü açılır.' },
      { label: 'Toparlanma', direction: 'merkeze dönüş', description: 'Hareket ağrısız aralıkta geri alınır.' },
    ],
    keyPoints: [
      { label: 'Diz hattı', description: 'Diz zorlanmadan kontrollü kalır.' },
      { label: 'Ayak tabanı', description: 'İtiş yönü için dışa dönük farkındalık kurulur.' },
    ],
    commonMistakes: ['Ağrıya rağmen zorlamak', 'Dizi çok açmak'],
    relatedDrylandAnimations: ['Wall Slide', 'Squat Jump'],
    correctCue: 'Mobilite ağrısız, kontrollü ve simetrik uygulanır.',
    incorrectCue: 'Dizden zorlamak hareket kalitesini ve güvenliği bozar.',
  }),
  'Frog Hold': animation({
    style: 'breaststroke',
    slug: 'frog-hold',
    viewAngle: 'Ön profil',
    movementArrows: [
      { label: 'Tut', direction: 'sabit pozisyon', description: 'Ayaklar dışa dönük kısa süre bekler.' },
      { label: 'Nefes', direction: 'sakin ritim', description: 'Pozisyon nefesle kontrollü tutulur.' },
    ],
    keyPoints: [
      { label: 'Bel', description: 'Bel boşluğu artırılmaz.' },
      { label: 'Ayak açısı', description: 'Ayak tabanı suyu yakalayacak açıdadır.' },
    ],
    commonMistakes: ['Bel boşluğunu artırmak', 'Pozisyonu kasarak tutmak'],
    relatedDrylandAnimations: ['Wall Slide'],
    correctCue: 'Pozisyon kısa, kontrollü ve rahat tutulur.',
    incorrectCue: 'Bel ve diz gerilimi artıyorsa pozisyon bozulmuştur.',
  }),
  'Body Dolphin': animation({
    style: 'butterfly',
    slug: 'body-dolphin',
    viewAngle: 'Yan profil',
    movementArrows: [
      { label: 'Göğüs baskısı', direction: 'aşağı-ileri', description: 'Dalga gövdeden başlar.' },
      { label: 'Kalça-ayak', direction: 'akış devamı', description: 'Hareket kalçadan ayağa aktarılır.' },
    ],
    keyPoints: [
      { label: 'Core', description: 'Dalga belden kırılmadan taşınır.' },
      { label: 'Ayak', description: 'Dizden tekme yerine vücut dalgası takip edilir.' },
    ],
    commonMistakes: ['Sadece dizden ayak vurmak', 'Dalgayı fazla büyütmek'],
    relatedDrylandAnimations: ['Plank Reach', 'Squat Jump'],
    correctCue: 'Dalga gövdeden başlar, ayakta tamamlanır.',
    incorrectCue: 'Dizden tekme atmak kelebek ritmini koparır.',
  }),
  'Body Rotation': animation({
    style: 'backstroke',
    slug: 'body-rotation',
    viewAngle: 'Üst-yan profil',
    movementArrows: [
      { label: 'Omuz-kalça', direction: 'sağ-sol rotasyon', description: 'Omuz ve kalça aynı ritimde döner.' },
      { label: 'Çekiş', direction: 'kalçaya doğru', description: 'Rotasyon çekiş yolunu uzatır.' },
    ],
    keyPoints: [
      { label: 'Baş', description: 'Baş sabit ve yukarı bakar.' },
      { label: 'Gövde', description: 'Rotasyon gövdeden gelir, sadece omuzdan değil.' },
    ],
    commonMistakes: ['Sadece omuzla dönmek', 'Başı oynatmak'],
    relatedDrylandAnimations: ['Band External Rotation', 'Wall Slide'],
    correctCue: 'Baş sabit, omuz-kalça birlikte döner.',
    incorrectCue: 'Baş oynarsa yön ve rotasyon kontrolü bozulur.',
  }),
};

export const drylandAnimationPlaceholders: DrylandAnimationPlaceholder[] = [
  {
    name: 'Band External Rotation',
    ...animation({
      style: 'dryland',
      slug: 'band-external-rotation',
      viewAngle: 'Ön profil',
      movementArrows: [{ label: 'Dış rotasyon', direction: 'dışa', description: 'Dirsek sabitken ön kol dışa açılır.' }],
      keyPoints: [{ label: 'Dirsek', description: 'Gövdeye yakın ve sabit kalır.' }],
      commonMistakes: ['Dirseği gövdeden uzaklaştırmak', 'Omzu yukarı çekmek'],
      correctCue: 'Küçük aralıkta kontrollü omuz rotasyonu.',
      incorrectCue: 'Hareket omuzdan değil koldan savrularak yapılır.',
    }),
  },
  {
    name: 'Plank Reach',
    ...animation({
      style: 'dryland',
      slug: 'plank-reach',
      viewAngle: 'Yan-üst profil',
      movementArrows: [{ label: 'Uzan', direction: 'ileri', description: 'Plank pozisyonunda kol kontrollü uzanır.' }],
      keyPoints: [{ label: 'Kalça', description: 'Kalça sallanmadan sabit tutulur.' }],
      commonMistakes: ['Kalçayı düşürmek', 'Gövdeyi çevirmek'],
      correctCue: 'Core sabit, kol uzun ve kontrollü.',
      incorrectCue: 'Kalça sallanırsa yüzme hattına aktarım azalır.',
    }),
  },
  {
    name: 'Wall Slide',
    ...animation({
      style: 'dryland',
      slug: 'wall-slide',
      viewAngle: 'Ön profil',
      movementArrows: [{ label: 'Yukarı kaydır', direction: 'yukarı', description: 'Kollar duvar temasını koruyarak yukarı kayar.' }],
      keyPoints: [{ label: 'Kaburga', description: 'Kaburga dışarı taşmadan nötr kalır.' }],
      commonMistakes: ['Bel boşluğunu artırmak', 'Bileği duvardan koparmak'],
      correctCue: 'Omuz hareketi kontrollü ve uzun uygulanır.',
      incorrectCue: 'Belden telafi etmek omuz mobilitesini gizler.',
    }),
  },
  {
    name: 'Squat Jump',
    ...animation({
      style: 'dryland',
      slug: 'squat-jump',
      viewAngle: 'Yan profil',
      movementArrows: [{ label: 'Patla', direction: 'yukarı', description: 'Çöküş sonrası dikey patlayıcı sıçrama yapılır.' }],
      keyPoints: [{ label: 'Diz', description: 'Dizler içe kapanmadan takip eder.' }],
      commonMistakes: ['Dizleri içe düşürmek', 'Yumuşak inişi kaçırmak'],
      correctCue: 'Patlayıcı çıkış ve kontrollü yumuşak iniş.',
      incorrectCue: 'Sert iniş ve diz kapanması sakatlık riskini artırır.',
    }),
  },
];

const drillDetailMap: Record<string, SwimAcademyDrillDetail> = {
  'Catch-Up Drill': detail('Catch-Up Drill', 'Kula? uzunlu?unu ve ?ndeki kol stabilitesini geli?tirmek.', 'Bir kol ?nde beklerken di?er kol tam kula? yapar. Kollar sadece ?nde bulu?unca de?i?ir.', ['Daha uzun kula?', 'Daha iyi denge', 'Daha verimli ?eki?'], '4 x 50m d???k-orta tempo', 'Ba?lang?? / Orta', 'Kollar? ?nde bulu?turmadan erken de?i?tirmek.'),
  'Fist Drill': detail('Fist Drill', '?n kol ile su tutu? hissini geli?tirmek.', 'Eller yumruk yap?l?r ve y?z?c? ?eki?i avu? yerine ?n koluyla hissetmeye ?al???r.', ['?n kol fark?ndal???', 'Daha temiz catch', 'Su kayb?n? azaltma'], '4 x 25m + 4 x 25m normal y?z??', 'Orta', 'Yumrukla h?z? zorlay?p v?cut pozisyonunu bozmak.'),
  'Single Arm': detail('Single Arm', 'Tek kol ?eki? yolunu izole etmek.', 'Bir kol ?nde veya yanda sabit kal?rken di?er kol tam kula? yapar.', ['?eki? yolu kontrol?', 'Rotasyon dengesi', 'Nefes zamanlamas?'], '6 x 25m sa?/sol d?n???ml?', 'Ba?lang?? / Orta', 'Sabit kolu d???rmek veya g?vdeyi fazla d?nd?rmek.'),
  'Tek Kol Serbest': detail('Single Arm', 'Tek kol ?eki? yolunu izole etmek.', 'Bir kol ?nde veya yanda sabit kal?rken di?er kol tam kula? yapar.', ['?eki? yolu kontrol?', 'Rotasyon dengesi', 'Nefes zamanlamas?'], '6 x 25m sa?/sol d?n???ml?', 'Ba?lang?? / Orta', 'Sabit kolu d???rmek veya g?vdeyi fazla d?nd?rmek.'),
  '6 Kick Switch': detail('6 Kick Switch', 'Yan pozisyon dengesi ve rotasyon zamanlamas?n? geli?tirmek.', 'Y?z?c? yan pozisyonda 6 ayak vurur, sonra kontroll? kula?la di?er yana ge?er.', ['Rotasyon kontrol?', 'Yan denge', 'Nefes pozisyonu'], '6 x 25m teknik tempo', 'Ba?lang?? / Orta', 'Ge?i? s?ras?nda ba?? kald?rmak.'),
  'Superman Glide': detail('Superman Glide', 'Uzun v?cut hatt? ve d???k diren? pozisyonu kurmak.', '?ki kol ?nde uzat?l?r, y?z?c? streamline?a yak?n pozisyonda sakin ayakla ilerler.', ['V?cut hatt?', 'Kal?a y?ksekli?i', 'Denge'], '4 x 25m', 'Ba?lang??', 'Kal?ay? d???rmek veya ?eneyi kald?rmak.'),
  'Side Kick': detail('Side Kick', 'Yan pozisyonda denge ve nefes kontrol?n? geli?tirmek.', 'Y?z?c? bir kol ?nde, di?er kol yanda olacak ?ekilde yan pozisyonda ayak vurur.', ['Yan denge', 'Kal?a pozisyonu', 'Nefes rahatl???'], '4 x 25m sa?/sol', 'Ba?lang?? / Orta', 'Omzu suya g?mmek veya ba?? fazla ?evirmek.'),
  'Vertical Kick': detail('Vertical Kick', 'Ayak g?c? ve kal?a kaynakl? vuru?u geli?tirmek.', 'Derin alanda dik pozisyonda, eller g???ste veya yukar?da ayak vurulur.', ['Ayak g?c?', 'Core kontrol?', 'Ritim'], '6 x 20 sn, 20 sn dinlenme', 'Orta / Performans', 'Dizden tekme atmak.'),
  'Bilateral Breathing': detail('Bilateral Breathing', '?ki tarafa nefes alarak simetrik y?z?? geli?tirmek.', 'Y?z?c? 3 veya 5 kula?ta bir d?n???ml? nefes al?r.', ['Simetri', 'Ritim', 'Y?n kontrol?'], '6 x 50m 3/5 nefes d?zeni', 'Orta', 'Nefes al?rken ba?? yukar? kald?rmak.'),
  'Body Rotation': detail('Body Rotation', 'S?rt?st?nde g?vde rotasyonunu ve omuz rahatl???n? geli?tirmek.', 'Y?z?c? kal?a ve omzu birlikte d?nd?rerek kontroll? s?rt?st? y?zer.', ['Uzun kula?', 'Omuz rahatl???', 'Su tutu?u'], '6 x 25m teknik tempo', 'Orta', 'Sadece omuzla d?n?p kal?ay? sabit b?rakmak.'),
  'Single Arm Backstroke': detail('Single Arm Backstroke', 'S?rt?st? tek kol giri? ve ?eki? yolunu izole etmek.', 'Bir kol yanda veya yukar?da sabitken di?er kol s?rt?st? kula? yapar.', ['Giri? pozisyonu', '?eki? yolu', 'Rotasyon'], '6 x 25m sa?/sol', 'Ba?lang?? / Orta', 'Kol giri?ini ba??n arkas?na ?aprazlamak.'),
  '6 Kick Rotation': detail('6 Kick Rotation', 'S?rt?st?nde rotasyon ge?i?ini ayak ritmiyle ba?lamak.', 'Y?z?c? 6 ayak sonras? kontroll? rotasyonla di?er yana ge?er.', ['Rotasyon zamanlamas?', 'Ayak ritmi', 'Denge'], '4 x 50m', 'Orta', 'Ge?i?te ba?? oynatmak.'),
  'Frog Mobility': detail('Frog Mobility', 'Kurba?alama ayak i?in kal?a ve ayak bile?i a??kl???n? geli?tirmek.', 'Kara veya suda kurba?a pozisyonunda kontroll? d?? rotasyon yap?l?r.', ['Mobilite', 'Diz y?k?n? azaltma', 'Ayak taban? y?n?'], '2-3 set x 8 tekrar', 'Ba?lang?? / Orta', 'A?r?ya ra?men hareketi zorlamak.'),
  'Frog Hold': detail('Frog Hold', 'Kurba?alama ayak pozisyonunu statik olarak hissettirmek.', 'Ayaklar d??a d?n?k pozisyonda k?sa s?re kontroll? beklenir.', ['Pozisyon fark?ndal???', 'Kal?a kontrol?', 'Ayak a??s?'], '3 x 20 sn', 'Ba?lang??', 'Bel bo?lu?unu art?rmak.'),
  'Frog Pulse': detail('Frog Pulse', 'Kurba?alama ayakta k???k iti? hissini ??retmek.', 'Frog pozisyonunda k?sa ve kontroll? pulse hareketleri yap?l?r.', ['?ti? hissi', 'Ayak taban? kullan?m?', 'Mobilite kontrol?'], '3 x 10 tekrar', 'Orta', 'Dizi fazla a?mak.'),
  'Resistance Band Kick': detail('Resistance Band Kick', 'Kurba?alama ayak kuvvetini kontroll? diren?le geli?tirmek.', 'Lastik diren?le ayak d??a-d?n?? ve iti? hareketi kontroll? yap?l?r.', ['Kuvvet', 'Hareket yolu', 'Kontroll? iti?'], '3 x 8 tekrar', 'Orta / Performans', 'Direnci art?r?p formu bozmak.'),
  'Glide Drill': detail('Glide Drill', 'Kurba?alama s?z?lme pozisyonunu geli?tirmek.', 'Her ayak iti?inden sonra streamline?da k?sa s?re ak?? korunur.', ['S?z?lme', 'Diren? azaltma', 'Tempo kontrol?'], '6 x 25m', 'Ba?lang?? / Orta', 'Fazla bekleyip h?z? tamamen ?ld?rmek.'),
  'Body Dolphin': detail('Body Dolphin', 'Kelebek dalga hareketini g?vdeden ba?latmak.', 'Kollar streamline veya yanda, dalga g???s-kal?a-ayak s?ras?yla uygulan?r.', ['G?vde dalgas?', 'Core kontrol?', 'Ritim'], '6 x 25m', 'Ba?lang?? / Orta', 'Dalga yerine sadece dizden ayak vurmak.'),
  'Double Kick Drill': detail('Double Kick Drill', 'Kelebekte iki ayak zamanlamas?n? ??retmek.', 'Birinci ayak kol giri?inde, ikinci ayak ?eki? sonunda vurgulan?r.', ['Zamanlama', 'Ritim', 'Kol toparlanmas?'], '4 x 25m + 4 x 25m tam stil', 'Orta', '?kinci aya?? atlay?p kollar? a??r ??karmak.'),
  'Single Arm Fly': detail('Single Arm Fly', 'Kelebek kol yolunu ve nefes ritmini izole etmek.', 'Tek kol kelebek yap?l?r, di?er kol ?nde veya yanda sabit kal?r.', ['Kol yolu', 'Nefes ritmi', 'G?vde dalgas?'], '6 x 25m sa?/sol', 'Orta', 'Tek kolu serbest koluna ?evirmek.'),
  'Underwater Dolphin': detail('Underwater Dolphin', 'Streamline i?inde g??l? su alt? dalgas? geli?tirmek.', 'Y?z?c? streamline pozisyonunda kontroll? dolphin kick yapar.', ['Su alt? h?z?', 'Core g?c?', 'Breakout kontrol?'], '6 x 15m', 'Orta / Performans', 'Streamline?? bozmak veya ?ok derine inmek.'),
};

function detail(name: string, purpose: string, howTo: string, technicalGain: string[], recommendedPractice: string, level: string, commonMistake: string): SwimAcademyDrillDetail {
  return { name, purpose, howTo, technicalGain, recommendedPractice, level, commonMistake, animation: animationMap[name] };
}

export function getSwimAcademyDrillDetail(name: string): SwimAcademyDrillDetail {
  return drillDetailMap[name] ?? detail(
    name,
    'Tekni?in belirli bir b?l?m?n? izole ederek hareket kalitesini geli?tirmek.',
    'Drill d???k tempoda uygulan?r. Sporcu tek bir teknik oda?a dikkat eder ve form bozulursa tekrar k?sa tutulur.',
    ['Teknik fark?ndal?k', 'Daha kontroll? ritim', 'Daha temiz uygulama'],
    '4 x 25m teknik tempo',
    'Ba?lang?? / Orta',
    'Drilli yar?? temposunda aceleyle yapmak.'
  );
}
