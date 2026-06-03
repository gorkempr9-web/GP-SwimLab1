import { FileText, Mail, Send } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';

const reportRows = ['Yarış', 'Split', 'PB', 'Madalya', 'Grafik', 'Koç notu', 'Katılım', 'Beslenme notu', 'Veli özeti'];

export default function CompetitionReportScreen() {
  const [message, setMessage] = useState('');
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Yarış Raporlama</Text>
        <Text style={styles.subtitle}>Tek tu? PDF ve payla??m haz?rl???.</Text>

        <GlassCard style={styles.preview}>
          <Text style={styles.previewTitle}>Yarış Raporu</Text>
          <View style={styles.rows}>
            {reportRows.map((row) => <Text key={row} style={styles.row}> •  {row}</Text>)}
          </View>
        </GlassCard>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <AppButton title="PDF oluştur" icon={FileText} onPress={() => setMessage('Yarış raporu PDF mock hazırlandı.')} />
        <View style={styles.actionRow}>
          <AppButton title="Mail" icon={Mail} variant="secondary" onPress={() => setMessage('Mail paylaşımı mock hazır.')} />
          <AppButton title="Kulüp panosu" icon={Send} variant="secondary" onPress={() => setMessage('Kulüp panosuna paylaşım mock hazır.')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  preview: { gap: spacing.md },
  previewTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  rows: { gap: spacing.sm },
  row: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
});

