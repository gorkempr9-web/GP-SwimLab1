import { Megaphone } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { clubAds } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ClubAdsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Kulüp Reklam Paneli</Text>
        <Text style={styles.subtitle}>Kulüp duyuruları, sponsor kartları ve kampanya alanları.</Text>
        {clubAds.map((ad) => (
          <View key={ad.id} style={styles.card}>
            <Megaphone color={colors.gold} size={28} />
            <Text style={styles.cardTitle}>{ad.title}</Text>
            <Text style={styles.body}>{ad.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.md },
  card: { backgroundColor: '#082A44', borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  body: { color: colors.muted, lineHeight: 22 },
});
