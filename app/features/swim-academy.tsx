import { Dumbbell, Plus, Waves, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AcademyInfographicCard } from '@/components/AcademyInfographicCard';
import { AppLogo } from '@/components/AppLogo';
import { getSwimAcademyDrillDetail, SwimAcademyCard, SwimAcademyDrillDetail, swimAcademyCards, SwimStyle, swimStyles } from '@/data/swimAcademy';
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
  if (activeTab === 'Kara \u00c7al\u0131\u015fmas\u0131') return <DetailSection title="Kara \u00e7al\u0131\u015fmas\u0131" items={card.dryland} />;
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
              <DrillInfo label={'Ama\u00e7'} value={drill.purpose} />
              <DrillInfo label={'Nas\u0131l Yap\u0131l\u0131r'} value={drill.howTo} />
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>{'Teknik Kazan\u0131m'}</Text>
                {drill.technicalGain.map((item) => <Text key={item} style={styles.detailItem}>{'\u2022 '}{item}</Text>)}
              </View>
              <DrillInfo label={'\u00d6nerilen Uygulama'} value={drill.recommendedPractice} />
              <DrillInfo label="Seviye" value={drill.level} />
              <DrillInfo label={'S\u0131k Yap\u0131lan Hata'} value={drill.commonMistake} danger={true} />
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
  addPlanButton: { minHeight: 46, borderRadius: 16, backgroundColor: palette.orange, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  addPlanText: { color: palette.navy, fontWeight: '900' },
  closeWide: { minHeight: 46, borderRadius: 16, backgroundColor: palette.cyan, alignItems: 'center', justifyContent: 'center' },
  closeWideText: { color: palette.navy, fontWeight: '900' },
});
