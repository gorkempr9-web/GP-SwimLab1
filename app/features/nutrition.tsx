import { CupSoda, Salad, ShieldAlert, Utensils } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { nutritionCards } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme/tokens';

export default function NutritionScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Beslenme ve Diyetisyen</Text>
        <Text style={styles.subtitle}>Günlük öğün planı, recovery öğünü, su takibi ve yarış dönemi beslenmesi.</Text>

        <GlassCard style={styles.hero}>
          <Utensils color={colors.cyan} size={34} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>Bugünkü plan</Text>
            <Text style={styles.heroText}>Ana antrenman sonrası recovery öğünü ve 2.4 L su hedefi takipte.</Text>
          </View>
        </GlassCard>

        {nutritionCards.map((card, index) => (
          <GlassCard key={card.id} style={styles.card}>
            <View style={styles.iconBox}>
              {index === 2 ? <CupSoda color={colors.cyan} size={24} /> : <Salad color={colors.teal} size={24} />}
            </View>
            <View style={styles.body}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <Text style={styles.note}>{card.note}</Text>
              {card.sensitive ? <Text style={styles.sensitiveLabel}>Hassas veri • diyetisyen notu</Text> : null}
            </View>
            <Text style={styles.status}>{card.status}</Text>
          </GlassCard>
        ))}

        <View style={styles.sensitiveBox}>
          <ShieldAlert color={colors.gold} size={22} />
          <Text style={styles.sensitiveText}>Beslenme, sağlık, sakatlık ve diyetisyen notları hassas veri olarak işaretlenir. Bu bilgiler sadece yetkili kişilerle paylaşılmalıdır.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.md, lineHeight: 22 },
  hero: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.cyanSoft },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  heroText: { color: colors.mutedStrong, marginTop: 5, lineHeight: 21 },
  card: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  iconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  note: { color: colors.muted, marginTop: 5, lineHeight: 20 },
  sensitiveLabel: { color: colors.gold, marginTop: 6, fontWeight: '900', fontSize: 12 },
  status: { color: colors.cyan, fontWeight: '900' },
  sensitiveBox: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.goldSoft, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.25)', padding: spacing.md },
  sensitiveText: { flex: 1, color: colors.text, lineHeight: 21, fontWeight: '700' },
});
