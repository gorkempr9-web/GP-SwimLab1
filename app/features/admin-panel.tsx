import { BellRing, Building2, ClipboardList, Dumbbell, RotateCcw, ShieldCheck, Trash2, Trophy, UserCircle, Users } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/EmptyState';
import {
  AdminSnapshot,
  adminClubs,
  clearAllAdminDemoData,
  clearClubAdminData,
  loadAdminSnapshot,
  seedAdminDemoData,
} from '@/services/adminPanel';
import { roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type AdminTab =
  | 'summary'
  | 'clubs'
  | 'users'
  | 'athletes'
  | 'coaches'
  | 'training'
  | 'raceResults'
  | 'notifications'
  | 'demoData'
  | 'system';

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'summary', label: 'Genel Özet' },
  { id: 'clubs', label: 'Kulüpler' },
  { id: 'users', label: 'Kullanıcılar' },
  { id: 'athletes', label: 'Sporcular' },
  { id: 'coaches', label: 'Antrenörler' },
  { id: 'training', label: 'Antrenman Kayıtları' },
  { id: 'raceResults', label: 'Yarış Sonuçları' },
  { id: 'notifications', label: 'Bildirimler' },
  { id: 'demoData', label: 'Demo Verileri' },
  { id: 'system', label: 'Sistem' },
];

const emptySnapshot: AdminSnapshot = {
  clubs: [],
  athletes: [],
  coaches: [],
  trainingPlans: [],
  raceResults: [],
  notifications: [],
  storageRows: [],
};

export default function AdminPanelScreen() {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [message, setMessage] = useState('');

  const canAccess = currentUser.role === 'super_admin';
  const summary = useMemo(() => makeSummary(snapshot, currentUser.id.startsWith('demo-') ? 1 : 0), [currentUser.id, snapshot]);

  const refresh = () => {
    void loadAdminSnapshot().then(setSnapshot);
  };

  useEffect(() => {
    if (canAccess) refresh();
  }, [canAccess]);

  if (!canAccess) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ShieldCheck color={colors.danger} size={42} />
          <Text style={styles.title}>Bu alana erişim yetkiniz yok.</Text>
          <Text style={styles.subtitle}>Admin Paneli yalnızca kurucu/yönetici hesabı için kullanılabilir.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const clearClub = async (clubId: string) => {
    const next = await clearClubAdminData(clubId);
    setSnapshot(next);
    setMessage('Kulüp bazlı demo verileri temizlendi.');
  };

  const clearAll = async () => {
    const next = await clearAllAdminDemoData();
    setSnapshot(next);
    setMessage('Tüm demo verileri temizlendi.');
  };

  const seedDemo = async () => {
    const next = await seedAdminDemoData();
    setSnapshot(next);
    setMessage('Örnek demo verisi yüklendi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <UserCircle color={colors.cyan} size={26} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Admin Paneli</Text>
            <Text style={styles.subtitle}>Tüm kulüp, kullanıcı ve pilot test verilerini görüntüle.</Text>
            <Text style={styles.roleLine}>{roleLabel(currentUser.role)} • {currentUser.firstName} {currentUser.lastName}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={refresh}>
            <RotateCcw color={colors.cyan} size={20} />
          </Pressable>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {activeTab === 'summary' ? <SummaryTab rows={summary} /> : null}
        {activeTab === 'clubs' ? <ClubsTab snapshot={snapshot} /> : null}
        {activeTab === 'users' ? <UsersTab snapshot={snapshot} /> : null}
        {activeTab === 'athletes' ? <AthletesTab snapshot={snapshot} /> : null}
        {activeTab === 'coaches' ? <CoachesTab snapshot={snapshot} /> : null}
        {activeTab === 'training' ? <TrainingTab snapshot={snapshot} /> : null}
        {activeTab === 'raceResults' ? <RaceResultsTab snapshot={snapshot} /> : null}
        {activeTab === 'notifications' ? <NotificationsTab snapshot={snapshot} /> : null}
        {activeTab === 'demoData' ? <DemoDataTab snapshot={snapshot} onClearClub={clearClub} onClearAll={clearAll} onSeed={seedDemo} /> : null}
        {activeTab === 'system' ? <SystemTab snapshot={snapshot} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryTab({ rows }: { rows: Array<{ label: string; value: string; icon: typeof Users; tone: string }> }) {
  return (
    <View style={styles.grid}>
      {rows.map((row) => <MetricCard key={row.label} {...row} />)}
    </View>
  );
}

function ClubsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  return (
    <View style={styles.list}>
      {snapshot.clubs.map((club) => (
        <PanelCard key={club.id} title={club.name} subtitle={`Kod: ${club.code}`}>
          <InfoLine label="Sporcu" value={String(club.athleteCount)} />
          <InfoLine label="Antrenör" value={String(club.coachCount)} />
          <InfoLine label="Antrenman" value={String(club.trainingPlanCount)} />
          <InfoLine label="Yarış sonucu" value={String(club.raceResultCount)} />
        </PanelCard>
      ))}
    </View>
  );
}

function UsersTab({ snapshot }: { snapshot: AdminSnapshot }) {
  const rows = [
    { role: 'Sporcu', count: snapshot.athletes.length },
    { role: 'Veli', count: 0 },
    { role: 'Antrenör', count: snapshot.coaches.length },
    { role: 'Kulüp Yöneticisi', count: adminClubs.length },
    { role: 'Admin', count: 1 },
  ];
  return (
    <View style={styles.list}>
      <FilterNote text="Filtre hazırlığı: rol, kulüp ve aktif/pasif durum alanları backend bağlandığında genişletilecek." />
      {rows.map((row) => (
        <PanelCard key={row.role} title={row.role} subtitle="Aktif/pasif filtre hazır">
          <InfoLine label="Kayıt" value={String(row.count)} />
        </PanelCard>
      ))}
    </View>
  );
}

function AthletesTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.athletes.length) return <EmptyState title="Henüz sporcu verisi yok." detail="Demo Verileri sekmesinden örnek veri yükleyebilirsin." icon={Users} tone={colors.cyan} />;
  return (
    <View style={styles.list}>
      <FilterNote text="Filtreler: kulüp, grup, yaş ve stil." />
      {snapshot.athletes.map((athlete) => (
        <PanelCard key={athlete.id} title={athlete.fullName} subtitle={athlete.club}>
          <InfoLine label="Grup" value={athlete.group || '-'} />
          <InfoLine label="Doğum yılı / Yaş" value={`${athlete.birthYear || '-'} / ${athlete.age || '-'}`} />
          <InfoLine label="Ana stil" value={athlete.mainStroke || '-'} />
          <InfoLine label="Hedef branş" value={athlete.targetEvent || '-'} />
          <InfoLine label="Son yarış derecesi" value={athlete.lastRaceResult || '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function CoachesTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.coaches.length) return <EmptyState title="Henüz antrenör verisi yok." detail="Kulüp yöneticisi antrenör eklediğinde burada görünür." icon={UserCircle} tone={colors.violet} />;
  return (
    <View style={styles.list}>
      {snapshot.coaches.map((coach) => (
        <PanelCard key={coach.id} title={coach.fullName} subtitle={coach.club}>
          <InfoLine label="Görev" value={coach.duty || '-'} />
          <InfoLine label="Sorumlu grup" value={coach.group || '-'} />
          <InfoLine label="Yetki seviyesi" value={coach.permission || '-'} />
          <InfoLine label="Eklediği antrenman" value={String(coach.trainingPlanCount ?? 0)} />
        </PanelCard>
      ))}
    </View>
  );
}

function TrainingTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.trainingPlans.length) return <EmptyState title="Henüz antrenman planı yok." detail="Planlar kulüp bazlı localStore verisinden okunur." icon={Dumbbell} tone={colors.blue} />;
  return (
    <View style={styles.list}>
      {snapshot.trainingPlans.map((plan) => (
        <PanelCard key={plan.id} title={plan.title} subtitle={`${plan.date || '-'} • ${plan.club}`}>
          <InfoLine label="Grup / Sporcu" value={plan.group || '-'} />
          <InfoLine label="Toplam metre" value={plan.totalMeters || '-'} />
          <InfoLine label="Set sayısı" value={String(plan.setCount ?? 0)} />
          <InfoLine label="Kara antrenmanı" value={plan.hasDryland ? 'Var' : 'Yok'} />
          <InfoLine label="Oluşturan" value={plan.coachName || '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function RaceResultsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.raceResults.length) return <EmptyState title="Henüz yarış sonucu yok." detail="Canlı giriş veya yarış sonucu kaydedilince burada görünür." icon={Trophy} tone={colors.gold} />;
  return (
    <View style={styles.list}>
      {snapshot.raceResults.map((race) => (
        <PanelCard key={race.id} title={race.athleteName} subtitle={`${race.club} • ${race.competitionName || 'Yarış adı yok'}`}>
          <InfoLine label="Tarih" value={race.date || '-'} />
          <InfoLine label="Branş" value={`${race.distance || '-'} ${race.stroke || ''}`.trim()} />
          <InfoLine label="Derece" value={race.finalTime || '-'} />
          <InfoLine label="PB" value={race.isPB ? 'Yeni PB' : '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function NotificationsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.notifications.length) return <EmptyState title="Henüz bildirim verisi yok." detail="Kulüp bildirimleri localStore üzerinden listelenir." icon={BellRing} tone={colors.coral} />;
  return (
    <View style={styles.list}>
      {snapshot.notifications.map((item) => (
        <PanelCard key={item.id} title={item.title} subtitle={item.club}>
          <InfoLine label="Tür" value={item.type || '-'} />
          <InfoLine label="Tarih" value={item.date || '-'} />
          <InfoLine label="Okundu" value={String(item.readCount)} />
          <InfoLine label="Okunmadı" value={String(item.unreadCount)} />
        </PanelCard>
      ))}
    </View>
  );
}

function DemoDataTab({ snapshot, onClearClub, onClearAll, onSeed }: { snapshot: AdminSnapshot; onClearClub: (clubId: string) => void; onClearAll: () => void; onSeed: () => void }) {
  return (
    <View style={styles.list}>
      <PanelCard title="Local storage durumu" subtitle="Kulüp bazlı pilot veri anahtarları">
        {snapshot.storageRows.map((row) => <InfoLine key={`${row.key}-${row.club}`} label={`${row.club} / ${row.key}`} value={String(row.count)} />)}
      </PanelCard>
      <View style={styles.actionRow}>
        <ActionButton label="Örnek demo verisi yükle" icon={ClipboardList} tone={colors.cyan} onPress={onSeed} />
        <ActionButton label="Tüm demo verileri temizle" icon={Trash2} tone={colors.danger} onPress={onClearAll} />
      </View>
      {adminClubs.map((club) => (
        <ActionButton key={club.id} label={`${club.name} verilerini temizle`} icon={Trash2} tone={colors.coral} onPress={() => onClearClub(club.id)} />
      ))}
    </View>
  );
}

function SystemTab({ snapshot }: { snapshot: AdminSnapshot }) {
  return (
    <View style={styles.list}>
      <PanelCard title="Sistem Durumu" subtitle="Pilot veritabanı ve cihaz cache özeti">
        <InfoLine label="Takip edilen kulüp" value={String(snapshot.clubs.length)} />
        <InfoLine label="Storage key sayısı" value={String(snapshot.storageRows.length)} />
        <InfoLine label="Veri kaynağı" value="Firestore hazır, local cache aktif" />
        <InfoLine label="Security Rules" value="Hazırlık notları services/firebase.ts içinde" />
      </PanelCard>
      <FilterNote text="Admin panelde günlük kullanım modülleri gösterilmez; yalnızca veri, storage ve sistem yönetimi bulunur." />
    </View>
  );
}

function MetricCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Users; tone: string }) {
  return (
    <View style={[styles.metricCard, { borderColor: `${tone}55` }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${tone}22` }]}>
        <Icon color={tone} size={22} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function PanelCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
      <View style={styles.infoList}>{children}</View>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function FilterNote({ text }: { text: string }) {
  return <Text style={styles.filterNote}>{text}</Text>;
}

function ActionButton({ label, icon: Icon, tone, onPress }: { label: string; icon: typeof Trash2; tone: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.actionButton, { borderColor: `${tone}55`, backgroundColor: `${tone}18` }]} onPress={onPress}>
      <Icon color={tone} size={18} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function makeSummary(snapshot: AdminSnapshot, activeDemoUsers: number) {
  return [
    { label: 'Toplam kulüp', value: String(snapshot.clubs.length), icon: Building2, tone: colors.cyan },
    { label: 'Toplam sporcu', value: String(snapshot.athletes.length), icon: Users, tone: colors.blue },
    { label: 'Toplam antrenör', value: String(snapshot.coaches.length), icon: UserCircle, tone: colors.violet },
    { label: 'Toplam veli', value: '0', icon: Users, tone: colors.coral },
    { label: 'Toplam antrenman planı', value: String(snapshot.trainingPlans.length), icon: Dumbbell, tone: colors.blue },
    { label: 'Toplam yarış sonucu', value: String(snapshot.raceResults.length), icon: Trophy, tone: colors.gold },
    { label: 'Toplam bildirim', value: String(snapshot.notifications.length), icon: BellRing, tone: colors.coral },
    { label: 'Aktif demo kullanıcı', value: String(activeDemoUsers), icon: ShieldCheck, tone: colors.success },
  ];
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md },
  headerIcon: { width: 52, height: 52, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cyanSoft },
  headerCopy: { flex: 1, gap: 4 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  roleLine: { color: colors.gold, fontWeight: '900', fontSize: 12 },
  iconButton: { width: 42, height: 42, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft },
  message: { color: colors.success, fontWeight: '900', textAlign: 'center' },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  tabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metricCard: { width: '48%', minHeight: 112, borderRadius: 22, borderWidth: 1, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: 6 },
  metricIcon: { width: 38, height: 38, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  metricValue: { color: colors.text, fontWeight: '900', fontSize: 24 },
  metricLabel: { color: colors.mutedStrong, fontWeight: '800', fontSize: 12 },
  list: { gap: spacing.md },
  card: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  cardSubtitle: { color: colors.mutedStrong, fontWeight: '800' },
  infoList: { gap: 6 },
  infoLine: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 7 },
  infoLabel: { color: colors.muted, fontWeight: '800', flex: 1 },
  infoValue: { color: colors.text, fontWeight: '900', flex: 1, textAlign: 'right' },
  filterNote: { color: colors.gold, fontWeight: '800', lineHeight: 20 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { minHeight: 46, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: 10 },
  actionText: { color: colors.text, fontWeight: '900', textAlign: 'center' },
});
