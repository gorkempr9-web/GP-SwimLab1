import { router } from 'expo-router';
import { Clock3, Medal, Plus } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { EmptyState } from '@/components/EmptyState';
import { GlassCard } from '@/components/GlassCard';
import { raceDayItems } from '@/services/clubCompetition';
import { colors, spacing, typography } from '@/theme/tokens';

export default function RaceDayBoardScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Günü Panosu</Text>
        <Text style={styles.subtitle}>Canlı akış, ısınma, heat, kulvar ve durum takibi.</Text>
        {raceDayItems.length === 0 ? (
          <>
            <EmptyState
              icon={Clock3}
              title="Bugün aktif yarış bulunmuyor."
              detail="Yarış listesi oluşturulduğunda heat, kulvar, ısınma ve durum bilgileri burada görünecek."
              tone={colors.coral}
            />
            <AppButton title="Yarış Listesi Oluştur" icon={Plus} onPress={() => router.push('/features/competition-roster')} />
          </>
        ) : null}
        {raceDayItems.map((item) => (
          <GlassCard key={item.id} style={styles.card}>
            <View style={styles.timeBox}>
              <Clock3 color={colors.coral} size={18} />
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.athlete}>{item.athlete}</Text>
              <Text style={styles.meta}>{item.event} • Kulvar {item.lane} • Seri {item.heat}</Text>
            </View>
            <View style={styles.statusPill}>
              <Medal color={colors.gold} size={15} />
              <Text style={styles.status}>{item.status}</Text>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  timeBox: { width: 66, alignItems: 'center', gap: 5 },
  time: { color: colors.coral, fontWeight: '900' },
  copy: { flex: 1 },
  athlete: { color: colors.text, fontWeight: '900', fontSize: 17 },
  meta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  statusPill: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.coralSoft, paddingHorizontal: spacing.sm, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  status: { color: colors.text, fontWeight: '900', fontSize: 12 },
});
