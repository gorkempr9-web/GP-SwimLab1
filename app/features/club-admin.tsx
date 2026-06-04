import { Building2, Plus, UserPlus, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { activateInviteCode, cancelInviteCode, createManualInviteCode, generateAthleteCode, generateClubCode, generateCoachCode, generateParentCode, getInviteCodes, inviteClubs, InviteCodeType } from '@/services/invitations';
import { getLocalData, saveLocalData } from '@/services/localStore';
import { colors, spacing, typography } from '@/theme/tokens';

type CoachDuty = 'Baş Antrenör' | 'Yardımcı Antrenör' | 'Kara Antrenörü' | 'Performans Antrenörü' | 'Fizyoterapist' | 'Diyetisyen';
type CoachGroup = 'Performans' | 'Gelişim' | 'Temel Eğitim' | 'Masters';
type CoachPermission = 'Sadece görüntüle' | 'Sporcu yönetebilir' | 'Yarış sonucu girebilir' | 'Plan oluşturabilir';

type ManagedCoach = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  duty: CoachDuty;
  group: CoachGroup;
  permission: CoachPermission;
};

const coachStorageKey = 'gp-swimlab-demo-coaches';
const duties: CoachDuty[] = ['Baş Antrenör', 'Yardımcı Antrenör', 'Kara Antrenörü', 'Performans Antrenörü', 'Fizyoterapist', 'Diyetisyen'];
const coachGroups: CoachGroup[] = ['Performans', 'Gelişim', 'Temel Eğitim', 'Masters'];
const permissions: CoachPermission[] = ['Sadece görüntüle', 'Sporcu yönetebilir', 'Yarış sonucu girebilir', 'Plan oluşturabilir'];

const adminStats = [
  ['Aktif sporcu', '0'],
  ['Aktif antrenör', '0'],
  ['Yaklaşan yarış', '0'],
  ['Haftalık yük', '-'],
  ['Katılım', '-'],
  ['Yarış sayısı', '0'],
  ['Kulüp duyuruları', '0'],
  ['Kamplar', '0'],
  ['Sponsorlar', '0'],
];

const codeTypes: Array<{ type: InviteCodeType; label: string }> = [
  { type: 'club', label: 'Kulüp' },
  { type: 'coach', label: 'Antrenör' },
  { type: 'athlete', label: 'Sporcu' },
  { type: 'parent', label: 'Veli' },
];

export default function ClubAdminScreen() {
  const [codes, setCodes] = useState(() => getInviteCodes());
  const [coaches, setCoaches] = useState<ManagedCoach[]>([]);
  const [manualCode, setManualCode] = useState('');
  const [manualType, setManualType] = useState<InviteCodeType>('athlete');
  const [manualClubId, setManualClubId] = useState(inviteClubs[0]?.id ?? 'mev-koleji');
  const [manualGroup, setManualGroup] = useState('');
  const [message, setMessage] = useState('');
  const [coachDraft, setCoachDraft] = useState<ManagedCoach>({
    id: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    duty: 'Yardımcı Antrenör',
    group: 'Gelişim',
    permission: 'Sadece görüntüle',
  });

  useEffect(() => {
    getLocalData<ManagedCoach[]>(coachStorageKey, []).then(setCoaches);
  }, []);

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

  const saveCoach = () => {
    if (!coachDraft.firstName.trim() || !coachDraft.lastName.trim()) {
      setMessage('Antrenör adı ve soyadı zorunludur.');
      return;
    }

    const nextCoach = { ...coachDraft, id: `coach-${Date.now()}` };
    const nextCoaches = [nextCoach, ...coaches];
    setCoaches(nextCoaches);
    void saveLocalData(coachStorageKey, nextCoaches);
    setCoachDraft({ id: '', firstName: '', lastName: '', phone: '', email: '', duty: 'Yardımcı Antrenör', group: 'Gelişim', permission: 'Sadece görüntüle' });
    setMessage('Antrenör listeye eklendi.');
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
              <Text style={styles.value}>{label === 'Aktif antrenör' ? String(coaches.length) : value}</Text>
              <Text style={styles.label}>{label}</Text>
            </GlassCard>
          ))}
        </View>

        <GlassCard style={styles.invitePanel}>
          <View style={styles.panelHeader}>
            <UserPlus color={colors.cyan} size={24} />
            <View>
              <Text style={styles.sectionTitle}>Antrenör Ekle</Text>
              <Text style={styles.meta}>Yeni antrenörü kulüp ekibine mock/local olarak ekle.</Text>
            </View>
          </View>
          <View style={styles.inputRow}>
            <TextInput placeholder="Ad" placeholderTextColor={colors.muted} value={coachDraft.firstName} onChangeText={(firstName) => setCoachDraft((current) => ({ ...current, firstName }))} style={styles.input} />
            <TextInput placeholder="Soyad" placeholderTextColor={colors.muted} value={coachDraft.lastName} onChangeText={(lastName) => setCoachDraft((current) => ({ ...current, lastName }))} style={styles.input} />
          </View>
          <TextInput placeholder="Telefon" placeholderTextColor={colors.muted} value={coachDraft.phone} onChangeText={(phone) => setCoachDraft((current) => ({ ...current, phone }))} style={styles.input} />
          <TextInput placeholder="E-posta" placeholderTextColor={colors.muted} value={coachDraft.email} onChangeText={(email) => setCoachDraft((current) => ({ ...current, email }))} autoCapitalize="none" style={styles.input} />
          <Text style={styles.smallLabel}>Görev</Text>
          <ChipRow options={duties} value={coachDraft.duty} onChange={(duty) => setCoachDraft((current) => ({ ...current, duty }))} />
          <Text style={styles.smallLabel}>Sorumlu grup</Text>
          <ChipRow options={coachGroups} value={coachDraft.group} onChange={(group) => setCoachDraft((current) => ({ ...current, group }))} />
          <Text style={styles.smallLabel}>Yetki seviyesi</Text>
          <ChipRow options={permissions} value={coachDraft.permission} onChange={(permission) => setCoachDraft((current) => ({ ...current, permission }))} />
          <Pressable style={styles.primaryButton} onPress={saveCoach}>
            <Plus color={colors.background} size={18} />
            <Text style={styles.primaryText}>Kaydet</Text>
          </Pressable>
        </GlassCard>

        <GlassCard style={styles.invitePanel}>
          <Text style={styles.sectionTitle}>Antrenör Listesi</Text>
          {coaches.length ? coaches.map((coach) => (
            <View key={coach.id} style={styles.coachRow}>
              <View>
                <Text style={styles.coachName}>{coach.firstName} {coach.lastName}</Text>
                <Text style={styles.meta}>{coach.duty} • {coach.group} • {coach.permission}</Text>
              </View>
            </View>
          )) : <Text style={styles.meta}>Henüz antrenör eklenmedi.</Text>}
        </GlassCard>

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
          <Pressable style={styles.quickButton} onPress={() => generateCode('coach')}>
            <Text style={styles.quickText}>Antrenör Davet Kodu Oluştur</Text>
          </Pressable>
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

function ChipRow<T extends string>({ options, value, onChange }: { options: T[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={styles.typeRow}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.typeChip, value === option && styles.typeChipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.typeText, value === option && styles.typeTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
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
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  smallLabel: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  meta: { color: colors.muted, fontWeight: '800', lineHeight: 19 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  typeChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  typeText: { color: colors.mutedStrong, fontWeight: '900' },
  typeTextActive: { color: colors.background },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  manualRow: { gap: spacing.sm },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '900', flex: 1 },
  primaryButton: { minHeight: 48, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  primaryText: { color: colors.background, fontWeight: '900' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  quickText: { color: colors.text, fontWeight: '900' },
  message: { color: colors.gold, fontWeight: '900' },
  coachRow: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  coachName: { color: colors.text, fontWeight: '900', fontSize: 16 },
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
