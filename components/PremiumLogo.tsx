import { LinearGradient } from 'expo-linear-gradient';
import { Waves } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { useLocale } from '@/locales';
import { colors, spacing } from '@/theme/tokens';

export function PremiumLogo({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();

  return (
    <View style={styles.row}>
      <LinearGradient colors={['rgba(12, 229, 232, 0.32)', 'rgba(251, 191, 36, 0.12)']} style={[styles.mark, compact && styles.compactMark]}>
        <Waves color={colors.text} size={compact ? 24 : 32} strokeWidth={2.7} />
      </LinearGradient>
      <View>
        <Text style={[styles.brand, compact && styles.compactBrand]}>{t('appName')}</Text>
        <Text style={styles.tagline}>{t('brandTagline')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  mark: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: colors.cyan,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  compactMark: { width: 52, height: 52, borderRadius: 16 },
  brand: { color: colors.text, fontSize: 24, fontWeight: '900' },
  compactBrand: { fontSize: 20 },
  tagline: { color: colors.cyan, marginTop: 3, fontWeight: '800', fontSize: 12 },
});
