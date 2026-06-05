import { AlertTriangle, CheckCircle2, FileText, Globe2, Lock, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { reportSecurityIssue, scanLinkSafety, scanTextSafety, validateAttachmentMock } from '@/services/security';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const securityTips = [
  'SwimLab banka bilgisi istemez.',
  'Şifrenizi kimseyle paylaşmayın.',
  'Şüpheli bağlantılara tıklamayın.',
  '18 yaş altı sporcular için veli kontrolü önerilir.',
  'Kişisel sağlık verilerinizi herkese açık alanlarda paylaşmayın.',
];

const reportReasons = ['Şüpheli bağlantı', 'Sahte hesap', 'Uygunsuz mesaj', 'Veri gizliliği', 'Diğer'];

export default function SecurityCenterScreen() {
  const { currentUser } = useSession();
  const [textSample, setTextSample] = useState('gorkem@example.com 05551234567');
  const [urlSample, setUrlSample] = useState('bit.ly/sahte-apk');
  const [fileSample, setFileSample] = useState('sonuc.apk');
  const [message, setMessage] = useState('');

  const textResult = useMemo(() => scanTextSafety(textSample), [textSample]);
  const linkResult = useMemo(() => scanLinkSafety(urlSample), [urlSample]);
  const fileResult = useMemo(() => validateAttachmentMock(fileSample), [fileSample]);
  const score = currentUser.email && currentUser.phone ? 92 : currentUser.email || currentUser.phone ? 78 : 64;
  const directMessagesClosed = currentUser.role === 'athlete';

  const handleReport = (reason: string) => {
    const result = reportSecurityIssue(reason);
    setMessage(result.message);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <ShieldCheck color={colors.cyan} size={32} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Güvenlik Merkezi</Text>
            <Text style={styles.subtitle}>Hesap, veri, mesaj, link ve paylaşım güvenliği için uygulama içi koruma merkezi.</Text>
          </View>
        </View>

        <GlassCard style={styles.scoreCard}>
          <View>
            <Text style={styles.scoreLabel}>Hesap güvenliği</Text>
            <Text style={styles.scoreValue}>{score}/100</Text>
            <Text style={styles.scoreHint}>2 adımlı doğrulama hazır • Son giriş: bugün</Text>
          </View>
          <View style={styles.safeBadge}>
            <CheckCircle2 color={colors.success} size={18} />
            <Text style={styles.safeBadgeText}>Güvenli Hesap</Text>
          </View>
        </GlassCard>

        <View style={styles.grid}>
          <StatusCard title="Telefon doğrulandı" detail={currentUser.phone ? currentUser.phone : 'Beklemede'} safe={Boolean(currentUser.phone)} />
          <StatusCard title="E-posta doğrulandı" detail={currentUser.email ? currentUser.email : 'Beklemede'} safe={Boolean(currentUser.email)} />
          <StatusCard title="KVKK onayları" detail="Aydınlatma + açık rıza" safe={true} />
          <StatusCard title="Veli onayı" detail={currentUser.role === 'athlete' ? '18 yaş altı için önerilir' : 'Rol bazlı kontrol'} safe={currentUser.role !== 'athlete'} />
          <StatusCard title="Veri silme talebi" detail="Profil > KVKK üzerinden" safe={true} />
          <StatusCard title="Direkt mesajlar" detail={directMessagesClosed ? 'Varsayılan kapalı' : 'Rol kontrollü'} safe={true} />
        </View>

        <GlassCard style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <ShieldAlert color={colors.gold} size={22} />
            <Text style={styles.cardTitle}>Uygulama içi içerik kontrolü</Text>
          </View>
          <TextInput value={textSample} onChangeText={setTextSample} placeholder="Metin örneği" placeholderTextColor={colors.muted} style={styles.input} />
          <ResultPill level={textResult.level} message={textResult.message} />
          {textResult.maskedText ? <Text style={styles.maskedText}>Maskeli: {textResult.maskedText}</Text> : null}
        </GlassCard>

        <GlassCard style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <Globe2 color={colors.cyan} size={22} />
            <Text style={styles.cardTitle}>Zararlı link kontrolü</Text>
          </View>
          <TextInput value={urlSample} onChangeText={setUrlSample} placeholder="Link örneği" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />
          <ResultPill level={linkResult.level} message={linkResult.message} />
          <Text style={styles.mutedText}>İzinli domainler: gp-swimlab.app, firebase.google.com, expo.dev, youtube.com, vimeo.com</Text>
        </GlassCard>

        <GlassCard style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <FileText color={colors.danger} size={22} />
            <Text style={styles.cardTitle}>Dosya yükleme hazırlığı</Text>
          </View>
          <TextInput value={fileSample} onChangeText={setFileSample} placeholder="ornek.pdf" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />
          <ResultPill level={fileResult.level} message={fileResult.message} />
          <Text style={styles.mutedText}>İzinli: jpg, jpeg, png, pdf • Riskli: apk, exe, bat, cmd, js, scr, zip</Text>
        </GlassCard>

        <GlassCard style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <Lock color={colors.cyan} size={22} />
            <Text style={styles.cardTitle}>Güvenli Kullanım Rehberi</Text>
          </View>
          {securityTips.map((tip) => (
            <Text key={tip} style={styles.tip}>• {tip}</Text>
          ))}
        </GlassCard>

        <GlassCard style={styles.toolCard}>
          <View style={styles.toolHeader}>
            <AlertTriangle color={colors.gold} size={22} />
            <Text style={styles.cardTitle}>Şüpheli Durumu Bildir</Text>
          </View>
          <View style={styles.reasons}>
            {reportReasons.map((reason) => (
              <Pressable key={reason} style={styles.reasonButton} onPress={() => handleReport(reason)}>
                <Text style={styles.reasonText}>{reason}</Text>
              </Pressable>
            ))}
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </GlassCard>

        <Pressable style={styles.deleteButton} onPress={() => setMessage('Veri silme talebi KVKK ekranına yönlendirilecek.')}>
          <Trash2 color={colors.danger} size={19} />
          <Text style={styles.deleteText}>Veri silme talebi</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusCard({ title, detail, safe }: { title: string; detail: string; safe: boolean }) {
  return (
    <GlassCard style={[styles.statusCard, { borderColor: safe ? 'rgba(52, 211, 153, 0.34)' : 'rgba(251, 191, 36, 0.42)' }]}>
      <CheckCircle2 color={safe ? colors.success : colors.gold} size={19} />
      <Text style={styles.statusTitle}>{title}</Text>
      <Text style={styles.statusDetail} numberOfLines={2}>{detail}</Text>
    </GlassCard>
  );
}

function ResultPill({ level, message }: { level: 'safe' | 'warning' | 'blocked'; message: string }) {
  const tone = level === 'safe' ? colors.success : level === 'warning' ? colors.gold : colors.danger;
  return (
    <View style={[styles.resultPill, { borderColor: tone }]}>
      <Text style={[styles.resultText, { color: tone }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerIcon: { width: 58, height: 58, borderRadius: 22, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21, marginTop: 4 },
  scoreCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  scoreLabel: { color: colors.muted, fontWeight: '900' },
  scoreValue: { color: colors.text, fontWeight: '900', fontSize: 34, marginTop: 3 },
  scoreHint: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  safeBadge: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.34)', backgroundColor: 'rgba(52, 211, 153, 0.1)', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 8 },
  safeBadgeText: { color: colors.success, fontWeight: '900', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusCard: { width: '48%', minHeight: 116, gap: spacing.xs },
  statusTitle: { color: colors.text, fontWeight: '900' },
  statusDetail: { color: colors.muted, fontWeight: '800', lineHeight: 18 },
  toolCard: { gap: spacing.sm },
  toolHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  input: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  resultPill: { borderRadius: 999, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: 8, alignSelf: 'flex-start' },
  resultText: { fontWeight: '900' },
  maskedText: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  mutedText: { color: colors.muted, fontWeight: '700', lineHeight: 19 },
  tip: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 21 },
  reasons: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  reasonButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 9 },
  reasonText: { color: colors.text, fontWeight: '900' },
  message: { color: colors.gold, fontWeight: '900' },
  deleteButton: { minHeight: 50, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', backgroundColor: colors.dangerSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  deleteText: { color: colors.danger, fontWeight: '900' },
});
