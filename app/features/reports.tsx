import { Download, FileText, Send, ShieldAlert } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { AppButton } from '@/components/AppButton';
import { ScoreInfoButton, ScoreInfoType } from '@/components/ScoreInfoButton';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const reportSections = [
  'Sporcu Bilgileri',
  'Yarış Dereceleri',
  'PB Gelişimi',
  'AI Koç Yorumu',
  'Antrenör Notu',
  'Beslenme Önerisi',
  'KVKK/Gizlilik Uyarısı',
];

export default function ReportsScreen() {
  const { currentUser } = useSession();
  const [message, setMessage] = useState('');
  const fullName = `${currentUser.firstName} ${currentUser.lastName}`.trim();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View>
          <Text style={styles.title}>PDF Rapor</Text>
          <Text style={styles.subtitle}>Premium performans raporu Önizlemesi</Text>
        </View>

        <View style={styles.previewShell}>
          <View style={styles.reportPage}>
            <View style={styles.reportHeader}>
              <AppLogo size={40} showTitle={false} />
              <View>
                <Text style={styles.reportTitle}>SwimLab Raporu</Text>
                <Text style={styles.reportDate}>Mock Önizleme ? Mayıs 2026</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <SummaryItem label="Sporcu" value={fullName || 'Profil bekleniyor'} />
              <SummaryItem label="Yarış derecesi" value="-" />
              <SummaryItem label="PB" value="-" />
              <SummaryItem label="FINA" value="-" hint="Dünya derecelerine göre performans puanı" infoType="fina" />
              <SummaryItem label="Rudolph" value="-" hint="Yaş grubu performans değerlendirme puanı" infoType="rudolph" />
              <SummaryItem label="Gelişim" value="-" />
              <SummaryItem label="Hazırlık Skoru" value="-" />
            </View>

            <View style={styles.sectionList}>
              {reportSections.map((section) => (
                <View key={section} style={styles.sectionRow}>
                  <View style={styles.dot} />
                  <Text style={styles.sectionText}>{section}</Text>
                </View>
              ))}
            </View>

            <View style={styles.warning}>
              <ShieldAlert color={colors.gold} size={20} />
              <Text style={styles.warningText}>Bu rapor sporcu verisi içerir. Yalnızca yetkili sporcu, veli ve antrenörle paylaşılmalıdır.</Text>
            </View>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.actions}>
          <AppButton title="PDF Oluştur" icon={FileText} onPress={() => setMessage('Rapor hazırlandı')} />
          <AppButton title="PDF Paylaş" icon={Send} variant="secondary" onPress={() => setMessage('Paylaşım bağlantısı hazırlandı')} />
          <AppButton title="PDF İndir" icon={Download} variant="secondary" onPress={() => setMessage('İndirme özelliği yakında aktif olacak')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryItem({ label, value, hint, infoType }: { label: string; value: string; hint?: string; infoType?: ScoreInfoType }) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryLabelRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        {infoType ? <ScoreInfoButton type={infoType} /> : null}
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
      {hint ? <Text style={styles.summaryHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 112 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginTop: 6, fontWeight: '700' },
  previewShell: {
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: spacing.md,
    shadowColor: colors.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 4,
  },
  reportPage: {
    borderRadius: 20,
    backgroundColor: '#F8FCFF',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  reportHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  reportTitle: { color: colors.background, fontWeight: '900', fontSize: 21 },
  reportDate: { color: '#476173', marginTop: 4, fontWeight: '700' },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryItem: { width: '48%', minHeight: 86, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(2,21,38,0.10)', backgroundColor: '#EEF7FA', padding: spacing.md, justifyContent: 'space-between', gap: 5 },
  summaryLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  summaryLabel: { color: '#476173', fontWeight: '800', fontSize: 12 },
  summaryValue: { color: colors.background, fontWeight: '900', fontSize: 18 },
  summaryHint: { color: '#476173', fontWeight: '700', fontSize: 10, lineHeight: 14 },
  sectionList: { gap: spacing.sm },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 30 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.cyan },
  sectionText: { color: colors.background, fontWeight: '800' },
  warning: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.goldSoft, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.25)', padding: spacing.md },
  warningText: { flex: 1, color: colors.background, lineHeight: 21, fontWeight: '700' },
  message: { color: colors.cyan, fontWeight: '900', textAlign: 'center', backgroundColor: colors.cyanSoft, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  actions: { gap: spacing.md },
});

