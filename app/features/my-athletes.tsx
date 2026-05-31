import { Award, CheckCircle2, ClipboardList, Edit3, Mail, Phone, Search, ShieldAlert, StickyNote, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { getRaceResultsForAthlete, rosterAthletes } from '@/services/clubCompetition';
import { generateAthleteListPdf } from '@/services/pdfReports';
import { canManageClub, roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type AthleteStatus = 'Aktif' | 'Pasif';
type DetailTab = 'Genel' | 'Devam' | 'Yüzme Yarışları' | 'Antrenör Notları';
type AthleteFilter = 'Tüm sporcular' | 'Performans grubu' | 'Küçük yaş grubu' | 'Yarış takımı' | 'Aktif' | 'Pasif';

type ManagedAthlete = {
  id: string;
  name: string;
  ageCategory: string;
  club: string;
  group: string;
  lastPb: string;
  lastRace: string;
  attendance: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  guardianVerified: boolean;
  status: AthleteStatus;
  notes: string[];
};

const filters: AthleteFilter[] = ['Tüm sporcular', 'Performans grubu', 'Küçük yaş grubu', 'Yarış takımı', 'Aktif', 'Pasif'];

const initialAthletes: ManagedAthlete[] = [
  { id: 'm1', name: 'Deniz Arslan', ageCategory: '15-16 Yaş', club: 'GP Aquatics', group: 'Yarış takımı', lastPb: '100m Serbest 56.84', lastRace: 'Marmara Cup', attendance: '94%', phoneVerified: true, emailVerified: true, guardianVerified: true, status: 'Aktif', notes: ['Son 25m dayanıklılık çalışılacak.'] },
  { id: 'm2', name: 'Ece Yılmaz', ageCategory: '13-14 Yaş', club: 'GP Aquatics', group: 'Performans grubu', lastPb: '50m Kelebek 31.20', lastRace: 'Kulüp Ligi', attendance: '91%', phoneVerified: true, emailVerified: false, guardianVerified: true, status: 'Aktif', notes: ['Start çıkışı güçlü.'] },
  { id: 'm3', name: 'Mert Kaya', ageCategory: '17-18 Yaş', club: 'GP Aquatics', group: 'Performans grubu', lastPb: '200m Karışık 2:18.90', lastRace: 'Bölge Yarışı', attendance: '88%', phoneVerified: false, emailVerified: true, guardianVerified: false, status: 'Aktif', notes: [] },
  { id: 'm4', name: 'Zeynep Demir', ageCategory: '15-16 Yaş', club: 'GP Aquatics', group: 'Küçük yaş grubu', lastPb: '100m Kurbağa 1:18.40', lastRace: 'Okul Yarışı', attendance: '72%', phoneVerified: true, emailVerified: true, guardianVerified: true, status: 'Pasif', notes: ['Veli iletişimi güncel.'] },
];

export default function MyAthletesScreen() {
  const { currentUser } = useSession();
  const [athletes, setAthletes] = useState(initialAthletes);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<AthleteFilter>('Tüm sporcular');
  const [selectedAthlete, setSelectedAthlete] = useState<ManagedAthlete | null>(null);
  const [message, setMessage] = useState('');
  const canView = canManageClub(currentUser.role);

  const visibleAthletes = useMemo(() => {
    return athletes.filter((athlete) => {
      const queryOk = athlete.name.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'));
      const filterOk = filter === 'Tüm sporcular' || athlete.group === filter || athlete.status === filter;
      return queryOk && filterOk;
    });
  }, [athletes, filter, query]);

  const toggleStatus = (athleteId: string) => {
    setAthletes((current) => current.map((athlete) => (athlete.id === athleteId ? { ...athlete, status: athlete.status === 'Aktif' ? 'Pasif' : 'Aktif' } : athlete)));
  };

  const handlePdf = async () => {
    const report = await generateAthleteListPdf(
      athletes.map((athlete) => ({
        name: athlete.name,
        ageCategory: athlete.ageCategory,
        club: athlete.club,
        group: athlete.group,
        lastPb: athlete.lastPb,
        guardianStatus: athlete.guardianVerified ? 'Doğrulandı' : 'Eksik',
        status: athlete.status,
      })),
    );
    setMessage(report.message);
  };

  if (!canView) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.locked}>
          <ShieldAlert color={colors.gold} size={42} />
          <Text style={styles.title}>Sporcularım</Text>
          <Text style={styles.subtitle}>Bu alan antrenör/kulüp hesabı gerektirir. Mevcut rol: {roleLabel(currentUser.role)}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Sporcularım</Text>
        <Text style={styles.subtitle}>Firestore hazırlığı: clubs/{'{clubId}'}/athletes, coaches/{'{coachId}'}/athletes, athletes/{'{athleteId}'}.</Text>
        <AppButton title="Sporcu Listesi PDF" icon={ClipboardList} onPress={handlePdf} />
        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.searchBox}>
          <Search color={colors.cyan} size={20} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Sporcu ara" placeholderTextColor={colors.muted} style={styles.searchInput} />
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => (
            <Pressable key={item} style={[styles.filterChip, filter === item && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleAthletes.map((athlete) => (
          <GlassCard key={athlete.id} style={styles.athleteCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.athleteName}>{athlete.name}</Text>
                <Text style={styles.meta}>{athlete.ageCategory} • {athlete.club}</Text>
              </View>
              <Text style={[styles.statusPill, athlete.status === 'Pasif' && styles.passivePill]}>{athlete.status}</Text>
            </View>
            <Text style={styles.meta}>{athlete.group} • Katılım {athlete.attendance}</Text>
            <Text style={styles.resultText}>Son PB: {athlete.lastPb}</Text>
            <Text style={styles.meta}>Son yarış: {athlete.lastRace}</Text>
            <View style={styles.verifyRow}>
              <VerifyIcon icon={Phone} active={athlete.phoneVerified} />
              <VerifyIcon icon={Mail} active={athlete.emailVerified} />
              <Text style={styles.guardianText}>Veli: {athlete.guardianVerified ? 'Doğrulandı' : 'Eksik'}</Text>
            </View>
            <View style={styles.actions}>
              <Action label="Profili Gör" icon={Award} onPress={() => setSelectedAthlete(athlete)} />
              <Action label="Yarış Geçmişi" icon={ClipboardList} onPress={() => setSelectedAthlete(athlete)} />
              <Action label="Not Ekle" icon={StickyNote} onPress={() => setSelectedAthlete(athlete)} />
              <Action label="Gruba Ata" icon={Users} onPress={() => setSelectedAthlete(athlete)} />
              <Action label={athlete.status === 'Aktif' ? 'Pasif yap' : 'Aktif yap'} icon={Edit3} onPress={() => toggleStatus(athlete.id)} />
            </View>
          </GlassCard>
        ))}
      </ScrollView>

      <AthleteDetailModal athlete={selectedAthlete} onClose={() => setSelectedAthlete(null)} />
    </SafeAreaView>
  );
}

function VerifyIcon({ icon: Icon, active }: { icon: typeof Phone; active: boolean }) {
  return (
    <View style={[styles.verifyIcon, active && styles.verifyIconActive]}>
      <Icon color={active ? colors.cyan : colors.muted} size={16} />
      {active ? <CheckCircle2 color={colors.cyan} size={12} style={styles.checkMini} /> : null}
    </View>
  );
}

function Action({ label, icon: Icon, onPress }: { label: string; icon: typeof Award; onPress: () => void }) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Icon color={colors.cyan} size={15} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function AthleteDetailModal({ athlete, onClose }: { athlete: ManagedAthlete | null; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<DetailTab>('Genel');
  if (!athlete) return null;
  const rosterAthlete = rosterAthletes.find((item) => item.name === athlete.name);
  const raceResults = getRaceResultsForAthlete(rosterAthlete?.id ?? 'ra-1');
  const tabs: DetailTab[] = ['Genel', 'Devam', 'Yüzme Yarışları', 'Antrenör Notları'];

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{athlete.name}</Text>
          <Text style={styles.meta}>{athlete.ageCategory} • {athlete.club} • {athlete.group}</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {tabs.map((tab) => (
              <Pressable key={tab} style={[styles.tabChip, activeTab === tab && styles.tabChipActive]} onPress={() => setActiveTab(tab)}>
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeTab === 'Genel' ? (
            <View style={styles.detailSection}>
              <Text style={styles.resultText}>PB listesi: {athlete.lastPb}</Text>
              <Text style={styles.meta}>Veli bilgisi: {athlete.guardianVerified ? 'Veli iletişimi doğrulandı' : 'Veli iletişimi eksik'}</Text>
              <Text style={styles.meta}>Durum: {athlete.status}</Text>
            </View>
          ) : null}

          {activeTab === 'Devam' ? (
            <View style={styles.detailSection}>
              <Text style={styles.resultText}>Katılım: {athlete.attendance}</Text>
              <Text style={styles.meta}>Son durum: Katıldı</Text>
            </View>
          ) : null}

          {activeTab === 'Yüzme Yarışları' ? (
            <View style={styles.detailSection}>
              <Text style={styles.resultText}>Yüzme Yarışları</Text>
              {raceResults.map((race) => (
                <View key={race.id} style={styles.raceResultRow}>
                  <Text style={styles.resultText}>{race.date} {race.competitionName}</Text>
                  <Text style={styles.meta}>{race.distance}m {race.stroke} • {race.finalTime}</Text>
                  {race.raceKind === 'relay' ? <Text style={styles.meta}>{race.relayType} • {race.teamName} • {race.relayOrder}. sporcu</Text> : null}
                  <Text style={styles.meta}>Not: {race.coachNote || 'Kısa not yok.'}</Text>
                </View>
              ))}
              {!raceResults.length ? <Text style={styles.meta}>Henüz yarış sonucu yok.</Text> : null}
            </View>
          ) : null}

          {activeTab === 'Antrenör Notları' ? (
            <View style={styles.detailSection}>
              <Text style={styles.meta}>{athlete.notes.length ? athlete.notes.join(' ') : 'Henüz not yok.'}</Text>
            </View>
          ) : null}
          <Text style={styles.kvkk}>KVKK uyarısı: Sporcu özel bilgileri sadece yetkili kullanıcılarca görüntülenmelidir.</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Kapat</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  locked: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 21 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  searchBox: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, color: colors.text, fontWeight: '800' },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 8 },
  filterChipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  filterText: { color: colors.muted, fontWeight: '900' },
  filterTextActive: { color: colors.text },
  athleteCard: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  athleteName: { color: colors.text, fontWeight: '900', fontSize: 18 },
  meta: { color: colors.mutedStrong, fontWeight: '700', lineHeight: 20 },
  resultText: { color: colors.text, fontWeight: '900' },
  statusPill: { color: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.14)', borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 7, fontWeight: '900' },
  passivePill: { color: colors.gold, backgroundColor: colors.goldSoft },
  verifyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  verifyIcon: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass },
  verifyIconActive: { borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft },
  checkMini: { position: 'absolute', right: 4, bottom: 4 },
  guardianText: { color: colors.muted, fontWeight: '900' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 8 },
  actionText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 22 },
  tabRow: { gap: spacing.sm, paddingRight: spacing.lg },
  tabChip: { minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, alignItems: 'center', justifyContent: 'center' },
  tabChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  tabTextActive: { color: colors.background },
  detailSection: { gap: spacing.sm },
  raceResultRow: { borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm, gap: 3 },
  kvkk: { color: colors.gold, fontWeight: '800', lineHeight: 20 },
  closeButton: { minHeight: 48, borderRadius: 14, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: colors.background, fontWeight: '900' },
});
