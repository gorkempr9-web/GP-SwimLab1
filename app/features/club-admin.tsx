import { Building2, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { activateInviteCode, cancelInviteCode, createManualInviteCode, generateAthleteCode, generateClubCode, generateCoachCode, generateParentCode, getInviteCodes, inviteClubs, InviteCodeType } from '@/services/invitations';
import { colors, spacing, typography } from '@/theme/tokens';

const adminStats = [
  ['Aktif sporcu', '128'],
  ['Aktif antrenör', '9'],
  ['Yaklaşan yarış', '3'],
  ['Haftalık yük', '42 km'],
  ['Katılım', '91%'],
  ['Yarış sayısı', '18'],
  ['Kulüp duyuruları', '7'],
  ['Kamplar', '2'],
  ['Sponsorlar', '4'],
];

const codeTypes: Array<{ type: InviteCodeType; label: string }> = [
  { type: 'club', label: 'Kulüp' },
  { type: 'coach', label: 'Antrenör' },
  { type: 'athlete', label: 'Sporcu' },
  { type: 'parent', label: 'Veli' },
];

export default function ClubAdminScreen() {
  const [codes, setCodes] = useState(() => getInviteCodes());
  const [manualCode, setManualCode] = useState('');
  const [manualType, setManualType] = useState<InviteCodeType>('athlete');
  const [manualClubId, setManualClubId] = useState(inviteClubs[0]?.id ?? 'mev-koleji');
  const [manualGroup, setManualGroup] = useState('');
  const [message, setMessage] = useState('');

  const generateCode = (type: InviteCodeType) => {
    const groupName = manualGroup.trim() || undefined;
    const record =
      type === 'club'
        ? generateClubCode(manualClubId, groupName)
        : type === 'coach'
          ? generateCoachCode(manualClubId, groupName)
          : type === 'athlete'
            ? generateAthleteCode(manualClubId, groupName)
            : generateParentCode(manualClubId, groupName);
    setCodes(getInviteCodes());
    setMessage(`${record.code} oluşturuldu.`);
  };

  const createManual = () => {
    const result = createManualInviteCode({ code: manualCode, type: manualType, clubId: manualClubId, groupName: manualGroup });
    if (!result.success) {
      setMessage(result.message);
      return;
    }
    setCodes(getInviteCodes());
    setManualCode('');
    setMessage(`${result.record.code} manuel olarak oluşturuldu.`);
  };

  const cancelCode = (code: string) => {
    setCodes(cancelInviteCode(code));
    setMessage(`${code} iptal edildi.`);
  };

  const activateCode = (code: string) => {
    setCodes(activateInviteCode(code));
    setMessage(`${code} aktif yapıldı.`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Building2 color={colors.cyan} size={30} />
          <View>
            <Text style={styles.title}>Kulüp Yönetim Paneli</Text>
            <Text style={styles.subtitle}>Operasyon, yarış, kulüp göstergeleri ve davet kodları.</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {adminStats.map(([label, value]) => (
            <GlassCard key={label} style={styles.card}>
              <Text style={styles.value}>{value}</Text>
              <Text style={styles.label}>{label}</Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard style={styles.invitePanel}>
          <Text style={styles.sectionTitle}>Davet kodu oluştur</Text>
          <Text style={styles.smallLabel}>Kulüp</Text>
          <View style={styles.typeRow}>
            {inviteClubs.map((club) => (
              <Pressable key={club.id} style={[styles.typeChip, manualClubId === club.id && styles.typeChipActive]} onPress={() => setManualClubId(club.id)}>
                <Text style={[styles.typeText, manualClubId === club.id && styles.typeTextActive]}>{club.name}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.smallLabel}>Rol</Text>
          <View style={styles.typeRow}>
            {codeTypes.map((item) => (
              <Pressable key={item.type} style={[styles.typeChip, manualType === item.type && styles.typeChipActive]} onPress={() => setManualType(item.type)}>
                <Text style={[styles.typeText, manualType === item.type && styles.typeTextActive]}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput placeholder="Grup (örn. Performans Grubu)" placeholderTextColor={colors.muted} value={manualGroup} onChangeText={setManualGroup} style={styles.input} />
          <View style={styles.manualRow}>
            <TextInput placeholder="ATH-MEV" placeholderTextColor={colors.muted} value={manualCode} onChangeText={(value) => setManualCode(value.toUpperCase())} autoCapitalize="characters" style={styles.input} />
            <Pressable style={styles.primaryButton} onPress={createManual}>
              <Text style={styles.primaryText}>Manuel Oluştur</Text>
            </Pressable>
          </View>
          <View style={styles.quickRow}>
            {codeTypes.map((item) => (
              <Pressable key={item.type} style={styles.quickButton} onPress={() => generateCode(item.type)}>
                <Text style={styles.quickText}>{item.label} kodu</Text>
              </Pressable>
            ))}
          </View>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </GlassCard>

        <Text style={styles.sectionTitle}>Aktif / pasif davet kodları</Text>
        {codes.map((item) => (
          <GlassCard key={item.code} style={[styles.codeCard, !item.active && styles.codeCardPassive]}>
            <View style={styles.codeHeader}>
              <View>
                <Text style={styles.code}>{item.code}</Text>
                <Text style={styles.codeMeta}>{item.clubName} • {roleLabel(item.type)}{item.groupName ? ` • ${item.groupName}` : ''}</Text>
              </View>
              <Text style={[styles.status, item.active ? styles.active : styles.passive]}>{item.active ? 'Aktif' : 'İptal'}</Text>
            </View>
            <View style={styles.codeFooter}>
              <Text style={styles.usage}>Kullanım: {item.usageCount}{item.maxUses ? ` / ${item.maxUses}` : ''}</Text>
              {item.active ? (
                <Pressable style={styles.cancelButton} onPress={() => cancelCode(item.code)}>
                  <XCircle color={colors.danger} size={16} />
                  <Text style={styles.cancelText}>İptal et</Text>
                </Pressable>
              ) : (
                <Pressable style={styles.reactivateButton} onPress={() => activateCode(item.code)}>
                  <Text style={styles.reactivateText}>Aktif yap</Text>
                </Pressable>
              )}
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function roleLabel(type: InviteCodeType) {
  if (type === 'club') return 'Kulüp Kodu';
  if (type === 'coach') return 'Antrenör Kodu';
  if (type === 'parent') return 'Veli Kodu';
  return 'Sporcu Kodu';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: { width: '48%', minHeight: 92, justifyContent: 'center' },
  value: { color: colors.cyan, fontWeight: '900', fontSize: 24 },
  label: { color: colors.mutedStrong, fontWeight: '900', marginTop: 5 },
  invitePanel: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  smallLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  typeChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  typeText: { color: colors.mutedStrong, fontWeight: '900' },
  typeTextActive: { color: colors.background },
  manualRow: { gap: spacing.sm },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '900' },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: colors.background, fontWeight: '900' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickText: { color: colors.text, fontWeight: '900' },
  message: { color: colors.gold, fontWeight: '900' },
  codeCard: { gap: spacing.md },
  codeCardPassive: { opacity: 0.65 },
  codeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  code: { color: colors.text, fontWeight: '900', fontSize: 18 },
  codeMeta: { color: colors.muted, fontWeight: '800', marginTop: 4 },
  status: { fontWeight: '900' },
  active: { color: colors.success },
  passive: { color: colors.danger },
  codeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  usage: { color: colors.cyan, fontWeight: '900' },
  cancelButton: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', backgroundColor: colors.dangerSoft, paddingHorizontal: spacing.md, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  cancelText: { color: colors.danger, fontWeight: '900' },
  reactivateButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 8 },
  reactivateText: { color: colors.cyan, fontWeight: '900' },
});
