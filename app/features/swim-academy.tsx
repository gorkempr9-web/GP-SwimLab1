import { AlertTriangle, CheckCircle2, ChevronRight, Dumbbell, Gauge, Plus, Waves, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AcademyInfographicCard } from '@/components/AcademyInfographicCard';
import { AppLogo } from '@/components/AppLogo';
import { drylandAnimationPlaceholders, getSwimAcademyDrillDetail, SwimAcademyAnimation, SwimAcademyCard, SwimAcademyDrillDetail, swimAcademyCards, SwimStyle, swimStyles } from '@/data/swimAcademy';
import { useLocale } from '@/locales';
import { addAcademyDrillToTrainingPlan } from '@/services/academyTraining';
import { spacing, typography } from '@/theme/tokens';

const palette = {
  navy: '#071626',
  cyan: '#38BDF8',
  orange: '#F97316',
  white: '#FFFFFF',
};

export default function SwimAcademyScreen() {
  const { t } = useLocale();
  const [activeStyle, setActiveStyle] = useState<SwimStyle>('freestyle');
  const [selectedCard, setSelectedCard] = useState<SwimAcademyCard | null>(null);
  const [message, setMessage] = useState('');
  const visibleCards = useMemo(() => swimAcademyCards.filter((card) => card.style === activeStyle), [activeStyle]);
  const activeLabel = swimStyles.find((style) => style.id === activeStyle)?.label ?? 'Serbest';

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppLogo compact={true} size={42} showSlogan={false} />
          <Text style={styles.heroKicker}>Swim Academy</Text>
          <Text style={styles.heroTitle}>{t('swimAcademyLibrary')}</Text>
          <Text style={styles.heroText}>4 temel stil için profesyonel eğitim kartları, antrenör notları ve uygulama adımları.</Text>
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleTabs}>
          {swimStyles.map((style) => {
            const active = activeStyle === style.id;
            return (
              <Pressable key={style.id} style={[styles.styleTab, active && styles.styleTabActive]} onPress={() => setActiveStyle(style.id)}>
                <Waves color={active ? palette.navy : style.color} size={16} />
                <Text style={[styles.styleTabText, active && styles.styleTabTextActive]}>{style.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{activeLabel}</Text>
          <Text style={styles.sectionMeta}>{visibleCards.length} kart</Text>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {visibleCards.map((card) => (
          <AcademyInfographicCard key={card.id} card={card} styleName={activeLabel} compact={true} onPress={() => setSelectedCard(card)} />
        ))}
      </ScrollView>

      <DetailModal
        card={selectedCard}
        styleName={activeLabel}
        onClose={() => setSelectedCard(null)}
        closeLabel={t('close')}
        addLabel={t('addToTrainingPlan')}
        onAddToPlan={() => {
          if (selectedCard) addAcademyDrillToTrainingPlan(selectedCard);
          setMessage(t('academyDrillAdded'));
        }}
      />
    </SafeAreaView>
  );
}

const detailTabs = ['Özet', 'Driller', 'Kara Çalışması', 'Sık Hatalar', 'Antrenör Notu'] as const;
type DetailTab = typeof detailTabs[number];

function DetailModal({ card, styleName, onClose, closeLabel, addLabel, onAddToPlan }: { card: SwimAcademyCard | null; styleName: string; onClose: () => void; closeLabel: string; addLabel: string; onAddToPlan: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('Özet');
  const [selectedDrill, setSelectedDrill] = useState<SwimAcademyDrillDetail | null>(null);
  return (
    <Modal visible={Boolean(card)} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {card ? (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <Text style={styles.modalKicker}>Swim Academy</Text>
                  <Text style={styles.modalTitle}>{card.title}</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <X color={palette.white} size={20} />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
                <AcademyInfographicCard card={card} styleName={styleName} />
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.detailTabs}>
                  {detailTabs.map((tab) => (
                    <Pressable key={tab} style={[styles.detailTab, activeTab === tab && styles.detailTabActive]} onPress={() => setActiveTab(tab)}>
                      <Text style={[styles.detailTabText, activeTab === tab && styles.detailTabTextActive]}>{tab}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <DetailTabContent card={card} activeTab={activeTab} onSelectDrill={setSelectedDrill} />
                <Pressable
                  style={styles.addPlanButton}
                  onPress={() => {
                    onAddToPlan();
                    onClose();
                  }}
                >
                  <Plus color={palette.navy} size={18} />
                  <Text style={styles.addPlanText}>{addLabel}</Text>
                </Pressable>
                <Pressable style={styles.closeWide} onPress={onClose}>
                  <Text style={styles.closeWideText}>{closeLabel}</Text>
                </Pressable>
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
      <DrillDetailModal drill={selectedDrill} onClose={() => setSelectedDrill(null)} />
    </Modal>
  );
}

function DetailTabContent({ card, activeTab, onSelectDrill }: { card: SwimAcademyCard; activeTab: DetailTab; onSelectDrill: (drill: SwimAcademyDrillDetail) => void }) {
  if (activeTab === 'Driller') return <DrillDetailList drills={card.waterDrills} onSelectDrill={onSelectDrill} />;
  if (activeTab === 'Kara \u00c7al\u0131\u015fmas\u0131') return <DrylandSection items={card.dryland} />;
  if (activeTab === 'S\u0131k Hatalar') return <DetailSection title="S\u0131k yap\u0131lan hatalar" items={card.commonMistakes} danger={true} />;
  if (activeTab === 'Antren\u00f6r Notu') {
    return (
      <View style={styles.tipBox}>
        <Dumbbell color={palette.orange} size={18} />
        <Text style={styles.tipText}>{card.coachTip}</Text>
      </View>
    );
  }
  return (
    <>
      <Text style={styles.modalDescription}>{card.description}</Text>
      <DetailSection title="Ad\u0131m ad\u0131m uygulama" items={card.steps} />
      <DetailSection title="Faydalar" items={card.benefits} />
    </>
  );
}

function DrylandSection({ items }: { items: string[] }) {
  return (
    <View style={styles.drylandStack}>
      <DetailSection title="Kara \u00e7al\u0131\u015fmas\u0131" items={items} />
      <View style={styles.detailSection}>
        <Text style={styles.detailTitle}>{'Kara animasyon haz\u0131rl\u0131\u011f\u0131'}</Text>
        <Text style={styles.animationMuted}>{'Bu egzersizler i\u00e7in uygulamaya ait vekt\u00f6r animasyon alan\u0131 haz\u0131rland\u0131. Harici video veya embed kullan\u0131lmaz.'}</Text>
        <View style={styles.drylandAnimationGrid}>
          {drylandAnimationPlaceholders.map((item) => (
            <View key={item.name} style={styles.drylandAnimationCard}>
              <Dumbbell color={palette.orange} size={18} />
              <Text style={styles.drylandAnimationTitle}>{item.name}</Text>
              <Text style={styles.drylandAnimationText}>{item.correctCue}</Text>
              <Text style={styles.animationAssetText}>{item.animationAsset}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function DrillDetailList({ drills, onSelectDrill }: { drills: string[]; onSelectDrill: (drill: SwimAcademyDrillDetail) => void }) {
  return (
    <View style={styles.drillList}>
      {drills.map((drill, index) => {
        const detail = getSwimAcademyDrillDetail(drill);
        return (
          <Pressable key={drill} style={styles.drillDetailCard} onPress={() => onSelectDrill(detail)}>
            <Text style={styles.drillTitle}>{index + 1}. {detail.name}</Text>
            <Text style={styles.drillText}>{detail.purpose}</Text>
            <Text style={styles.drillMeta}>\u00d6nerilen uygulama: {detail.recommendedPractice}</Text>
            <Text style={styles.drillMeta}>Seviye: {detail.level}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DetailSection({ title, items, danger = false }: { title: string; items: string[]; danger?: boolean }) {
  return (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, danger && styles.dangerTitle]}>{title}</Text>
      {items.map((item, index) => (
        <Text key={`${title}-${item}`} style={styles.detailItem}>{index + 1}. {item}</Text>
      ))}
    </View>
  );
}

function DrillDetailModal({ drill, onClose }: { drill: SwimAcademyDrillDetail | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'Bilgi' | 'Animasyon'>('Bilgi');

  return (
    <Modal visible={Boolean(drill)} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.drillModalBackdrop}>
        <View style={styles.drillModalCard}>
          {drill ? (
            <ScrollView contentContainerStyle={styles.drillModalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <Text style={styles.modalKicker}>{'Drill Detay\u0131'}</Text>
                  <Text style={styles.modalTitle}>{drill.name}</Text>
                </View>
                <Pressable style={styles.closeButton} onPress={onClose}>
                  <X color={palette.white} size={20} />
                </Pressable>
              </View>
              <View style={styles.drillModalTabs}>
                {(['Bilgi', 'Animasyon'] as const).map((tab) => (
                  <Pressable key={tab} style={[styles.drillModalTab, activeTab === tab && styles.drillModalTabActive]} onPress={() => setActiveTab(tab)}>
                    <Text style={[styles.drillModalTabText, activeTab === tab && styles.drillModalTabTextActive]}>{tab === 'Animasyon' ? '\ud83c\udfa5 Animasyon' : 'Bilgi'}</Text>
                  </Pressable>
                ))}
              </View>
              {activeTab === 'Animasyon' ? (
                <AnimationPanel animation={drill.animation} drillName={drill.name} />
              ) : (
                <>
                  <DrillInfo label={'Ama\u00e7'} value={drill.purpose} />
                  <DrillInfo label={'Nas\u0131l Yap\u0131l\u0131r'} value={drill.howTo} />
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>{'Teknik Kazan\u0131m'}</Text>
                    {drill.technicalGain.map((item) => <Text key={item} style={styles.detailItem}>{'\u2022 '}{item}</Text>)}
                  </View>
                  <DrillInfo label={'\u00d6nerilen Uygulama'} value={drill.recommendedPractice} />
                  <DrillInfo label="Seviye" value={drill.level} />
                  <DrillInfo label={'S\u0131k Yap\u0131lan Hata'} value={drill.commonMistake} danger={true} />
                </>
              )}
              <Pressable style={styles.closeWide} onPress={onClose}>
                <Text style={styles.closeWideText}>Kapat</Text>
              </Pressable>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function AnimationPanel({ animation, drillName }: { animation?: SwimAcademyAnimation; drillName: string }) {
  const [speed, setSpeed] = useState<'0.5x' | '1x' | '2x'>('1x');
  const activeAnimation = animation ?? {
    animationType: 'vector-placeholder' as const,
    animationAsset: '',
    viewAngle: 'Yan profil',
    movementArrows: [{ label: 'Hareket y\u00f6n\u00fc', direction: 'ileri', description: 'Drill hareket y\u00f6n\u00fc vekt\u00f6r animasyon i\u00e7in haz\u0131r.' }],
    keyPoints: [{ label: 'Kritik nokta', description: 'Teknik odak noktalar\u0131 burada i\u015faretlenecek.' }],
    commonMistakes: ['Hareketi aceleye getirmek'],
    relatedDrylandAnimations: [],
    correctCue: 'Do\u011fru hareket a\u00e7\u0131klamas\u0131 animasyon asseti eklendi\u011finde g\u00f6rsel olarak desteklenecek.',
    incorrectCue: 'Hatal\u0131 hareket a\u00e7\u0131klamas\u0131 burada kar\u015f\u0131la\u015ft\u0131rmal\u0131 verilecek.',
  };

  return (
    <View style={styles.animationPanel}>
      <View style={styles.animationHeader}>
        <View>
          <Text style={styles.animationKicker}>{activeAnimation.viewAngle}</Text>
          <Text style={styles.animationTitle}>{drillName}</Text>
        </View>
        <Gauge color={palette.orange} size={22} />
      </View>
      <View style={styles.animationStage}>
        <View style={styles.swimmerLine} />
        <View style={styles.swimmerHead} />
        <View style={styles.swimmerBody} />
        <View style={styles.swimmerArmLeft} />
        <View style={styles.swimmerArmRight} />
        <View style={styles.swimmerWake} />
        <View style={styles.keyPointMarkerOne}>
          <Text style={styles.keyPointMarkerText}>1</Text>
        </View>
        <View style={styles.keyPointMarkerTwo}>
          <Text style={styles.keyPointMarkerText}>2</Text>
        </View>
        <View style={styles.motionArrow}>
          <ChevronRight color={palette.navy} size={20} />
        </View>
      </View>
      <Text style={styles.animationPlaceholderText}>{'Animasyon yak\u0131nda eklenecek'}</Text>
      <Text style={styles.animationMuted}>{'Bu alan YouTube/Vimeo yerine uygulamaya ait vekt\u00f6r asset sistemiyle \u00e7al\u0131\u015facak.'}</Text>
      <View style={styles.speedRow}>
        {(['0.5x', '1x', '2x'] as const).map((item) => (
          <Pressable key={item} style={[styles.speedButton, speed === item && styles.speedButtonActive]} onPress={() => setSpeed(item)}>
            <Text style={[styles.speedText, speed === item && styles.speedTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.animationMetaRow}>
        <Text style={styles.animationMetaLabel}>{'Asset'}</Text>
        <Text style={styles.animationAssetText}>{activeAnimation.animationAsset || 'placeholder'}</Text>
      </View>
      <View style={styles.animationSubsection}>
        <Text style={styles.detailTitle}>{'Hareket y\u00f6n\u00fc oklar\u0131'}</Text>
        {activeAnimation.movementArrows.map((arrow) => (
          <View key={`${arrow.label}-${arrow.direction}`} style={styles.arrowCard}>
            <ChevronRight color={palette.orange} size={16} />
            <View style={styles.arrowTextGroup}>
              <Text style={styles.arrowTitle}>{arrow.label} · {arrow.direction}</Text>
              <Text style={styles.arrowDescription}>{arrow.description}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.animationSubsection}>
        <Text style={styles.detailTitle}>{'Kritik nokta i\u015faretleri'}</Text>
        {activeAnimation.keyPoints.map((point) => (
          <View key={point.label} style={styles.keyPointCard}>
            <Text style={styles.keyPointBadge}>{point.label.slice(0, 1).toUpperCase()}</Text>
            <Text style={styles.keyPointText}>{point.label}: {point.description}</Text>
          </View>
        ))}
      </View>
      <View style={styles.correctIncorrectRow}>
        <View style={styles.correctBox}>
          <CheckCircle2 color="#34D399" size={18} />
          <Text style={styles.correctIncorrectTitle}>Do\u011fru</Text>
          <Text style={styles.correctIncorrectText}>{activeAnimation.correctCue}</Text>
        </View>
        <View style={styles.incorrectBox}>
          <AlertTriangle color={palette.orange} size={18} />
          <Text style={styles.correctIncorrectTitle}>Hatal\u0131</Text>
          <Text style={styles.correctIncorrectText}>{activeAnimation.incorrectCue}</Text>
        </View>
      </View>
    </View>
  );
}

function DrillInfo({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <View style={styles.detailSection}>
      <Text style={[styles.detailTitle, danger && styles.dangerTitle]}>{label}</Text>
      <Text style={styles.detailItem}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.navy },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  hero: { borderRadius: 26, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.34)', backgroundColor: 'rgba(255,255,255,0.04)', padding: spacing.lg, gap: spacing.sm },
  heroKicker: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  heroTitle: { ...typography.h1, color: palette.white },
  heroText: { color: 'rgba(255,255,255,0.76)', fontWeight: '800', lineHeight: 21 },
  styleTabs: { gap: spacing.sm, paddingRight: spacing.lg },
  styleTab: { minHeight: 42, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.34)', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  styleTabActive: { backgroundColor: palette.cyan, borderColor: palette.cyan },
  styleTabText: { color: palette.white, fontWeight: '900' },
  styleTabTextActive: { color: palette.navy },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: palette.white, fontWeight: '900', fontSize: 22 },
  sectionMeta: { color: palette.cyan, fontWeight: '900' },
  message: { color: palette.white, fontWeight: '900', backgroundColor: 'rgba(249, 115, 22, 0.16)', borderRadius: 16, padding: spacing.md },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.58)', justifyContent: 'flex-end' },
  drillModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.70)', justifyContent: 'center', padding: spacing.lg },
  drillModalCard: { maxHeight: '86%', borderRadius: 28, backgroundColor: palette.navy, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.35)', padding: spacing.lg },
  drillModalContent: { gap: spacing.md, paddingBottom: spacing.md },
  modalCard: { maxHeight: '88%', borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: palette.navy, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.35)', padding: spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, alignItems: 'flex-start' },
  modalTitleGroup: { flex: 1, minWidth: 0 },
  modalKicker: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  modalTitle: { color: palette.white, fontWeight: '900', fontSize: 27, lineHeight: 32, marginTop: 4 },
  closeButton: { width: 38, height: 38, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  modalContent: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xl },
  modalDescription: { color: 'rgba(255,255,255,0.82)', fontWeight: '800', lineHeight: 22 },
  detailSection: { borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md, gap: 8 },
  detailTabs: { gap: spacing.sm, paddingRight: spacing.lg },
  detailTab: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.28)', paddingHorizontal: spacing.md, paddingVertical: 9, backgroundColor: 'rgba(255,255,255,0.05)' },
  detailTabActive: { backgroundColor: palette.cyan, borderColor: palette.cyan },
  detailTabText: { color: palette.white, fontWeight: '900', fontSize: 12 },
  detailTabTextActive: { color: palette.navy },
  detailTitle: { color: palette.cyan, fontWeight: '900', fontSize: 15 },
  dangerTitle: { color: palette.orange },
  detailItem: { color: palette.white, fontWeight: '800', lineHeight: 20 },
  tipBox: { borderRadius: 20, backgroundColor: 'rgba(249, 115, 22, 0.12)', padding: spacing.md, flexDirection: 'row', gap: spacing.sm },
  tipText: { color: palette.white, flex: 1, fontWeight: '900', lineHeight: 20 },
  drillList: { gap: spacing.sm },
  drillDetailCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.22)', backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md, gap: 7 },
  drillTitle: { color: palette.cyan, fontWeight: '900', fontSize: 15 },
  drillText: { color: palette.white, fontWeight: '800', lineHeight: 20 },
  drillMeta: { color: 'rgba(255,255,255,0.72)', fontWeight: '800', lineHeight: 18 },
  drylandStack: { gap: spacing.md },
  drylandAnimationGrid: { gap: spacing.sm },
  drylandAnimationCard: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.26)', backgroundColor: 'rgba(249, 115, 22, 0.08)', padding: spacing.md, gap: 7 },
  drylandAnimationTitle: { color: palette.white, fontWeight: '900', fontSize: 14 },
  drylandAnimationText: { color: 'rgba(255,255,255,0.76)', fontWeight: '800', lineHeight: 19 },
  drillModalTabs: { flexDirection: 'row', gap: spacing.sm },
  drillModalTab: { flex: 1, minHeight: 42, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.26)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  drillModalTabActive: { backgroundColor: palette.cyan, borderColor: palette.cyan },
  drillModalTabText: { color: palette.white, fontWeight: '900' },
  drillModalTabTextActive: { color: palette.navy },
  animationPanel: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.30)', backgroundColor: 'rgba(255,255,255,0.05)', padding: spacing.md, gap: spacing.md },
  animationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  animationKicker: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  animationTitle: { color: palette.white, fontWeight: '900', fontSize: 20, marginTop: 3 },
  animationStage: { height: 190, borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.22)', backgroundColor: 'rgba(7, 22, 38, 0.92)', justifyContent: 'center' },
  swimmerLine: { position: 'absolute', left: 18, right: 18, top: 112, height: 2, backgroundColor: 'rgba(56, 189, 248, 0.40)' },
  swimmerHead: { position: 'absolute', left: 170, top: 73, width: 28, height: 28, borderRadius: 14, backgroundColor: palette.white, borderWidth: 3, borderColor: palette.cyan },
  swimmerBody: { position: 'absolute', left: 86, top: 91, width: 104, height: 18, borderRadius: 999, backgroundColor: palette.cyan, transform: [{ rotate: '-8deg' }] },
  swimmerArmLeft: { position: 'absolute', left: 78, top: 76, width: 80, height: 10, borderRadius: 999, backgroundColor: palette.white, transform: [{ rotate: '-24deg' }] },
  swimmerArmRight: { position: 'absolute', left: 102, top: 115, width: 82, height: 9, borderRadius: 999, backgroundColor: 'rgba(56, 189, 248, 0.72)', transform: [{ rotate: '15deg' }] },
  swimmerWake: { position: 'absolute', left: 42, top: 128, width: 150, height: 6, borderRadius: 999, backgroundColor: palette.orange, transform: [{ rotate: '-4deg' }] },
  keyPointMarkerOne: { position: 'absolute', left: 78, top: 60, width: 26, height: 26, borderRadius: 13, backgroundColor: palette.orange, alignItems: 'center', justifyContent: 'center' },
  keyPointMarkerTwo: { position: 'absolute', right: 76, top: 112, width: 26, height: 26, borderRadius: 13, backgroundColor: palette.cyan, alignItems: 'center', justifyContent: 'center' },
  keyPointMarkerText: { color: palette.navy, fontWeight: '900' },
  motionArrow: { position: 'absolute', right: 24, top: 77, width: 40, height: 28, borderRadius: 999, backgroundColor: palette.cyan, alignItems: 'center', justifyContent: 'center' },
  animationPlaceholderText: { color: palette.white, fontWeight: '900', fontSize: 17, textAlign: 'center' },
  animationMuted: { color: 'rgba(255,255,255,0.68)', fontWeight: '800', lineHeight: 19 },
  speedRow: { flexDirection: 'row', gap: spacing.sm },
  speedButton: { flex: 1, minHeight: 40, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.30)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  speedButtonActive: { backgroundColor: palette.cyan, borderColor: palette.cyan },
  speedText: { color: palette.white, fontWeight: '900' },
  speedTextActive: { color: palette.navy },
  animationMetaRow: { borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', padding: spacing.sm, gap: 4 },
  animationMetaLabel: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  animationAssetText: { color: 'rgba(255,255,255,0.62)', fontWeight: '800', fontSize: 11, lineHeight: 16 },
  animationSubsection: { gap: spacing.sm },
  arrowCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: 14, backgroundColor: 'rgba(56, 189, 248, 0.09)', padding: spacing.sm },
  arrowTextGroup: { flex: 1, minWidth: 0 },
  arrowTitle: { color: palette.white, fontWeight: '900' },
  arrowDescription: { color: 'rgba(255,255,255,0.72)', fontWeight: '800', marginTop: 2, lineHeight: 18 },
  keyPointCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.06)', padding: spacing.sm },
  keyPointBadge: { width: 26, height: 26, borderRadius: 13, overflow: 'hidden', backgroundColor: palette.orange, color: palette.navy, textAlign: 'center', textAlignVertical: 'center', fontWeight: '900' },
  keyPointText: { color: palette.white, flex: 1, fontWeight: '800', lineHeight: 18 },
  correctIncorrectRow: { gap: spacing.sm },
  correctBox: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.36)', backgroundColor: 'rgba(52, 211, 153, 0.10)', padding: spacing.md, gap: 6 },
  incorrectBox: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(249, 115, 22, 0.36)', backgroundColor: 'rgba(249, 115, 22, 0.10)', padding: spacing.md, gap: 6 },
  correctIncorrectTitle: { color: palette.white, fontWeight: '900' },
  correctIncorrectText: { color: 'rgba(255,255,255,0.76)', fontWeight: '800', lineHeight: 19 },
  addPlanButton: { minHeight: 46, borderRadius: 16, backgroundColor: palette.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  addPlanText: { color: palette.navy, fontWeight: '900' },
  closeWide: { minHeight: 46, borderRadius: 16, backgroundColor: palette.cyan, alignItems: 'center', justifyContent: 'center' },
  closeWideText: { color: palette.navy, fontWeight: '900' },
});
