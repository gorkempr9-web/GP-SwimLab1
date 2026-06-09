import { Dumbbell, FileText, Waves } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppLogo } from '@/components/AppLogo';
import { SwimAcademyCard } from '@/data/swimAcademy';
import { spacing } from '@/theme/tokens';

const palette = {
  navy: '#071626',
  cyan: '#38BDF8',
  orange: '#F97316',
  white: '#FFFFFF',
};

type AcademyInfographicCardProps = {
  card: SwimAcademyCard;
  styleName: string;
  compact?: boolean;
  onPress?: () => void;
};

export function AcademyInfographicCard({ card, styleName, compact = false, onPress }: AcademyInfographicCardProps) {
  const content = (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.topBar}>
        <View style={styles.titleGroup}>
          <Text style={styles.styleName}>{styleName}</Text>
          <Text style={styles.title}>{card.title}</Text>
        </View>
        <AppLogo compact={true} size={compact ? 20 : 24} showSlogan={false} imageStyle={styles.logoImage} />
      </View>

      <Text style={styles.subtitle}>{card.subtitle}</Text>
      <Text style={styles.description} numberOfLines={compact ? 2 : 3}>{card.description}</Text>

      <View style={styles.visualBox}>
        <View style={styles.visualIcon}>
          <Waves color={palette.cyan} size={compact ? 24 : 30} />
        </View>
        <View style={styles.visualCopy}>
          <Text style={styles.visualTitle}>Görsel eklenecek</Text>
          <Text style={styles.visualText}>Stil ikonu, drill adımı ve hareket açıklama alanı</Text>
        </View>
      </View>

      <View style={styles.infographicGrid}>
        <View style={styles.leftPanel}>
          <Text style={styles.panelTitle}>Faydalar</Text>
          {card.benefits.slice(0, 4).map((benefit) => <Bullet key={benefit} text={benefit} />)}
        </View>
        <View style={styles.stepPanel}>
          <Text style={styles.panelTitleOrange}>4 Drill</Text>
          {card.waterDrills.slice(0, 4).map((drill, index) => (
            <View key={drill} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{drill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.bottomPanels}>
        <MiniInfo icon="dry" title="Kara" value={card.dryland.slice(0, 3).join(' • ')} />
        <MiniInfo icon="gear" title="Ekipman" value={card.equipment} />
      </View>

      <View style={styles.metaRow}>
        <Meta label="Seviye" value={card.level} />
        <Meta label="Süre" value={card.duration} />
      </View>

      <View style={styles.mistakeBox}>
        <Text style={styles.mistakeTitle}>Sık hatalar</Text>
        <Text style={styles.mistakeText} numberOfLines={2}>{card.commonMistakes.slice(0, 3).join(' • ')}</Text>
      </View>

      <View style={styles.coachNote}>
        <FileText color={palette.orange} size={16} />
        <Text style={styles.coachText} numberOfLines={compact ? 2 : 3}>{card.coachNote}</Text>
      </View>
    </View>
  );

  if (!onPress) return content;
  return <Pressable onPress={onPress}>{content}</Pressable>;
}

function Bullet({ text }: { text: string }) {
  return <Text style={styles.bullet}>• {text}</Text>;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function MiniInfo({ icon, title, value }: { icon: 'dry' | 'gear'; title: string; value: string }) {
  return (
    <View style={styles.miniInfo}>
      {icon === 'dry' ? <Dumbbell color={palette.cyan} size={16} /> : <Waves color={palette.orange} size={16} />}
      <View style={styles.miniCopy}>
        <Text style={styles.miniTitle}>{title}</Text>
        <Text style={styles.miniValue} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.34)',
    backgroundColor: palette.navy,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: palette.cyan,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 4,
  },
  cardCompact: { borderRadius: 24 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.md },
  titleGroup: { flex: 1, minWidth: 0 },
  logoImage: { width: 90, height: 24 },
  styleName: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  title: { color: palette.cyan, fontWeight: '900', fontSize: 25, lineHeight: 29, marginTop: 2 },
  subtitle: { color: palette.white, fontWeight: '900', fontSize: 15, lineHeight: 20 },
  description: { color: 'rgba(255,255,255,0.75)', fontWeight: '800', lineHeight: 20 },
  visualBox: { borderRadius: 22, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.30)', backgroundColor: 'rgba(56, 189, 248, 0.10)', padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  visualIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(7, 22, 38, 0.62)', alignItems: 'center', justifyContent: 'center' },
  visualCopy: { flex: 1, minWidth: 0 },
  visualTitle: { color: palette.white, fontWeight: '900' },
  visualText: { color: 'rgba(255,255,255,0.70)', fontWeight: '800', lineHeight: 18, marginTop: 2 },
  infographicGrid: { flexDirection: 'row', gap: spacing.sm },
  leftPanel: { flex: 1, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', padding: spacing.md, gap: 6 },
  stepPanel: { flex: 1, borderRadius: 20, backgroundColor: 'rgba(249, 115, 22, 0.12)', padding: spacing.md, gap: 8 },
  panelTitle: { color: palette.cyan, fontWeight: '900', fontSize: 12 },
  panelTitleOrange: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  bullet: { color: palette.white, fontWeight: '800', lineHeight: 18 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepNumber: { width: 24, height: 24, borderRadius: 999, overflow: 'hidden', backgroundColor: palette.orange, color: palette.navy, textAlign: 'center', lineHeight: 24, fontWeight: '900' },
  stepText: { flex: 1, color: palette.white, fontWeight: '900', lineHeight: 18 },
  bottomPanels: { flexDirection: 'row', gap: spacing.sm },
  miniInfo: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', padding: spacing.sm, flexDirection: 'row', gap: spacing.sm },
  miniCopy: { flex: 1, minWidth: 0 },
  miniTitle: { color: palette.orange, fontWeight: '900', fontSize: 11 },
  miniValue: { color: 'rgba(255,255,255,0.76)', fontWeight: '800', lineHeight: 17 },
  metaRow: { flexDirection: 'row', gap: spacing.sm },
  metaPill: { flex: 1, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', padding: spacing.sm },
  metaLabel: { color: 'rgba(255,255,255,0.60)', fontWeight: '900', fontSize: 11 },
  metaValue: { color: palette.white, fontWeight: '900', marginTop: 2 },
  mistakeBox: { borderRadius: 18, backgroundColor: 'rgba(249, 115, 22, 0.10)', padding: spacing.md, gap: 4 },
  mistakeTitle: { color: palette.orange, fontWeight: '900', fontSize: 12 },
  mistakeText: { color: palette.white, fontWeight: '800', lineHeight: 18 },
  coachNote: { borderRadius: 18, backgroundColor: 'rgba(56, 189, 248, 0.10)', padding: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  coachText: { color: palette.white, flex: 1, fontWeight: '900', lineHeight: 20 },
});
