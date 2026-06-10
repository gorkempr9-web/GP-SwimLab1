import DateTimePicker from '@react-native-community/datetimepicker';
import { BellRing, Building2, ClipboardList, Dumbbell, KeyRound, LucideIcon, RotateCcw, ShieldCheck, Trash2, Trophy, UserCircle, Users } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogo } from '@/components/AppLogo';
import { EmptyState } from '@/components/EmptyState';
import {
  AdminSnapshot,
  AdminClub,
  adminClubs,
  clearAllAdminDemoData,
  clearClubAdminData,
  createAdminAthlete,
  createAdminClub,
  createAdminCoach,
  createAdminGroup,
  createAdminUser,
  ensureDemoClubs,
  isValidTurkishGsm,
  loadAdminSnapshot,
  normalizeTurkishPhone,
  recordAuditLog,
  seedAdminDemoData,
} from '@/services/adminPanel';
import { getDataSourceStatus } from '@/services/firestoreData';
import { createInviteCode, getInviteCodes, getInviteCodesAsync, inviteClubs, InviteCodeRecord, InviteRole, setInviteCodeActive } from '@/services/invitations';
import { roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type AdminTab =
  | 'summary'
  | 'clubs'
  | 'users'
  | 'athletes'
  | 'coaches'
  | 'groups'
  | 'training'
  | 'raceResults'
  | 'notifications'
  | 'inviteCodes'
  | 'auditLogs'
  | 'demoData'
  | 'system';

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: 'summary', label: 'Genel Özet' },
  { id: 'clubs', label: 'Kulüpler' },
  { id: 'users', label: 'Kullanıcılar' },
  { id: 'athletes', label: 'Sporcular' },
  { id: 'coaches', label: 'Antrenörler' },
  { id: 'groups', label: 'Gruplar' },
  { id: 'training', label: 'Antrenman Kayıtları' },
  { id: 'raceResults', label: 'Yarış Sonuçları' },
  { id: 'notifications', label: 'Bildirimler' },
  { id: 'inviteCodes', label: 'Davet Kodları' },
  { id: 'auditLogs', label: 'İşlem Geçmişi' },
  { id: 'demoData', label: 'Demo Verileri' },
  { id: 'system', label: 'Sistem' },
];

const emptySnapshot: AdminSnapshot = {
  clubs: [],
  athletes: [],
  coaches: [],
  groups: [],
  trainingPlans: [],
  raceResults: [],
  notifications: [],
  auditLogs: [],
  storageRows: [],
  dataSource: getDataSourceStatus(),
};

export default function AdminPanelScreen() {
  const { currentUser } = useSession();
  const [activeTab, setActiveTab] = useState<AdminTab>('summary');
  const [snapshot, setSnapshot] = useState<AdminSnapshot>(emptySnapshot);
  const [message, setMessage] = useState('');
  const [actionMode, setActionMode] = useState<'club' | 'athlete' | 'coach' | 'group' | 'user' | null>(null);
  const [selectedClubId, setSelectedClubId] = useState('mev-koleji');
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [inviteCodes, setInviteCodes] = useState<InviteCodeRecord[]>([]);

  const canAccess = currentUser.role === 'super_admin';
  const summary = useMemo(() => makeSummary(snapshot, currentUser.id.startsWith('demo-') ? 1 : 0), [currentUser.id, snapshot]);

  const refresh = () => {
    void loadAdminSnapshot().then(setSnapshot);
    void getInviteCodesAsync().then(setInviteCodes);
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

  const saveAction = async () => {
    if (!actionMode) return;
    if ((actionMode === 'athlete' || actionMode === 'club' || actionMode === 'coach') && draft.phone && !isValidTurkishGsm(draft.phone)) {
      setMessage('Telefon numarası +90 ile başlayan 10 haneli GSM numarası olmalıdır.');
      return;
    }
    if (actionMode === 'athlete' && draft.guardianPhone && !isValidTurkishGsm(draft.guardianPhone)) {
      setMessage('Veli telefon numarası +90 ile başlayan 10 haneli GSM numarası olmalıdır.');
      return;
    }
    let next = snapshot;
    if (actionMode === 'club') next = await createAdminClub(draft);
    if (actionMode === 'athlete') next = await createAdminAthlete(selectedClubId, draft);
    if (actionMode === 'coach') next = await createAdminCoach(selectedClubId, draft);
    if (actionMode === 'group') next = await createAdminGroup(selectedClubId, draft);
    if (actionMode === 'user') next = await createAdminUser({ ...draft, clubId: selectedClubId });
    setSnapshot(next);
    setMessage('Kayıt Firestore/local cache akışına gönderildi.');
    setDraft({});
    setActionMode(null);
  };

  const ensureClubs = async () => {
    const next = await ensureDemoClubs();
    setSnapshot(next);
    setMessage('Demo kulüpler oluşturuldu.');
  };

  const saveInviteCode = async (input: { code: string; clubId: string; role: InviteRole; note: string; maxUses: string; expiresAt: string; isActive: boolean }) => {
    const result = createInviteCode({
      code: input.code,
      clubId: input.clubId,
      role: input.role,
      note: input.note,
      maxUses: Number(input.maxUses) || 1,
      expiresAt: input.expiresAt,
      isActive: input.isActive,
      createdBy: currentUser.id,
    });
    if (!result.success) {
      setMessage(result.message);
      return;
    }
    setInviteCodes(getInviteCodes());
    await recordAuditLog({ actorUserId: currentUser.id, actorName: `${currentUser.firstName} ${currentUser.lastName}`.trim(), role: currentUser.role, clubId: result.record.clubId, action: 'davet kodu oluşturma', entityType: 'inviteCode', entityId: result.record.code, details: result.record.note });
    setMessage(`${result.record.code} davet kodu oluşturuldu.`);
  };

  const toggleInviteCode = async (code: string, active: boolean) => {
    setInviteCodes(setInviteCodeActive(code, active));
    setInviteCodes(await getInviteCodesAsync());
    setMessage(active ? 'Davet kodu aktifleştirildi.' : 'Davet kodu pasifleştirildi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppLogo compact={true} size={32} showSlogan={false} />
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

        <ManagementActions
          clubs={snapshot.clubs.length ? snapshot.clubs : adminClubs}
          actionMode={actionMode}
          setActionMode={setActionMode}
          selectedClubId={selectedClubId}
          setSelectedClubId={setSelectedClubId}
          draft={draft}
          setDraft={setDraft}
          onSave={saveAction}
          onOpenInvites={() => setActiveTab('inviteCodes')}
          onOpenDemoData={() => setActiveTab('demoData')}
        />

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab.id} style={[styles.tab, activeTab === tab.id && styles.tabActive]} onPress={() => setActiveTab(tab.id)}>
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {activeTab === 'summary' ? <SummaryTab rows={summary} onSelect={setActiveTab} /> : null}
        {activeTab === 'clubs' ? <ClubsTab snapshot={snapshot} /> : null}
        {activeTab === 'users' ? <UsersTab snapshot={snapshot} /> : null}
        {activeTab === 'athletes' ? <AthletesTab snapshot={snapshot} /> : null}
        {activeTab === 'coaches' ? <CoachesTab snapshot={snapshot} /> : null}
        {activeTab === 'groups' ? <GroupsTab snapshot={snapshot} /> : null}
        {activeTab === 'training' ? <TrainingTab snapshot={snapshot} /> : null}
        {activeTab === 'raceResults' ? <RaceResultsTab snapshot={snapshot} /> : null}
        {activeTab === 'notifications' ? <NotificationsTab snapshot={snapshot} /> : null}
        {activeTab === 'inviteCodes' ? <InviteCodesTab codes={inviteCodes} onCreate={saveInviteCode} onToggle={toggleInviteCode} /> : null}
        {activeTab === 'auditLogs' ? <AuditLogsTab snapshot={snapshot} /> : null}
        {activeTab === 'demoData' ? <DemoDataTab snapshot={snapshot} onClearClub={clearClub} onClearAll={clearAll} onSeed={seedDemo} onEnsureClubs={ensureClubs} /> : null}
        {activeTab === 'system' ? <SystemTab snapshot={snapshot} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryTab({ rows, onSelect }: { rows: Array<{ label: string; value: string; icon: LucideIcon; tone: string; targetTab: AdminTab }>; onSelect: (tab: AdminTab) => void }) {
  return (
    <View style={styles.grid}>
      {rows.map((row) => <MetricCard key={row.label} {...row} onPress={() => onSelect(row.targetTab)} />)}
    </View>
  );
}

function ManagementActions({
  clubs,
  actionMode,
  setActionMode,
  selectedClubId,
  setSelectedClubId,
  draft,
  setDraft,
  onSave,
  onOpenInvites,
  onOpenDemoData,
}: {
  clubs: AdminClub[];
  actionMode: 'club' | 'athlete' | 'coach' | 'group' | 'user' | null;
  setActionMode: (mode: 'club' | 'athlete' | 'coach' | 'group' | 'user' | null) => void;
  selectedClubId: string;
  setSelectedClubId: (clubId: string) => void;
  draft: Record<string, string>;
  setDraft: (draft: Record<string, string>) => void;
  onSave: () => void;
  onOpenInvites: () => void;
  onOpenDemoData: () => void;
}) {
  const actionButtons = [
    { mode: 'club' as const, label: 'Kulüp Ekle', icon: Building2, tone: colors.cyan },
    { mode: 'athlete' as const, label: 'Sporcu Ekle', icon: Users, tone: colors.blue },
    { mode: 'coach' as const, label: 'Antrenör Ekle', icon: UserCircle, tone: colors.violet },
    { mode: 'group' as const, label: 'Grup Ekle', icon: ClipboardList, tone: colors.gold },
    { mode: 'user' as const, label: 'Kullanıcı Ekle', icon: ShieldCheck, tone: colors.success },
  ];
  const fields = actionMode === 'club'
    ? [['name', 'Kulüp adı'], ['code', 'Kulüp kodu'], ['city', 'İl'], ['district', 'İlçe'], ['managerName', 'Yetkili kişi'], ['phone', 'Telefon'], ['email', 'E-posta'], ['note', 'Not']]
    : actionMode === 'coach'
      ? [['firstName', 'Ad'], ['lastName', 'Soyad'], ['phone', 'Telefon'], ['email', 'E-posta'], ['duty', 'Görev'], ['group', 'Yetkili gruplar'], ['permission', 'Yetki seviyesi']]
      : actionMode === 'group'
        ? [['name', 'Grup adı'], ['description', 'Açıklama'], ['level', 'Seviye'], ['coachIds', 'Antrenör IDleri (virgülle)'], ['athleteIds', 'Sporcu IDleri (virgülle)'], ['isActive', 'Aktif mi? true/false']]
        : actionMode === 'user'
          ? [['firstName', 'Ad'], ['lastName', 'Soyad'], ['email', 'E-posta'], ['phone', 'Telefon'], ['role', 'Rol']]
          : [['firstName', 'Ad'], ['lastName', 'Soyad'], ['birthDate', 'Doğum tarihi'], ['gender', 'Cinsiyet'], ['phone', 'Telefon'], ['email', 'E-posta'], ['group', 'Grup'], ['mainStroke', 'Ana stil'], ['targetEvent', 'Hedef branş'], ['guardianName', 'Veli adı'], ['guardianPhone', 'Veli telefon'], ['guardianEmail', 'Veli e-posta'], ['coachNote', 'Antrenör notu']];

  return (
    <View style={styles.managementCard}>
      <Text style={styles.cardTitle}>Admin</Text>
      <Text style={styles.cardSubtitle}>Yönetim kayıtları Firestore açıksa buluta, değilse local fallback cache'e yazılır.</Text>
      <View style={styles.actionRow}>
        {actionButtons.map((button) => (
          <ActionButton key={button.mode} label={button.label} icon={button.icon} tone={button.tone} onPress={() => { setDraft({}); setActionMode(button.mode); }} />
        ))}
        <ActionButton label="Davet Kodu Oluştur" icon={KeyRound} tone={colors.gold} onPress={onOpenInvites} />
        <ActionButton label="Demo Verileri" icon={ClipboardList} tone={colors.cyan} onPress={onOpenDemoData} />
      </View>
      {actionMode ? (
        <View style={styles.inlineForm}>
          {actionMode === 'athlete' ? (
            <AthleteActionForm draft={draft} setDraft={setDraft} />
          ) : null}
          {actionMode !== 'club' ? (
            <>
              <Text style={styles.infoLabel}>Kulüp</Text>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                {clubs.map((club) => (
                  <Pressable key={club.id} style={[styles.tab, selectedClubId === club.id && styles.tabActive]} onPress={() => setSelectedClubId(club.id)}>
                    <Text style={[styles.tabText, selectedClubId === club.id && styles.tabTextActive]}>{club.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}
          {actionMode !== 'athlete' ? fields.map(([key, label]) => (
            <TextInput
              key={key}
              placeholder={label}
              placeholderTextColor={colors.muted}
              value={key === 'phone' ? formatTurkishPhoneForDisplay(draft[key] ?? '') : draft[key] ?? ''}
              onChangeText={(value) => setDraft({ ...draft, [key]: key === 'phone' ? value.replace(/\D/g, '').slice(0, 12) : value })}
              keyboardType={key === 'phone' ? 'number-pad' : key === 'email' ? 'email-address' : 'default'}
              style={styles.input}
            />
          )) : null}
          <View style={styles.actionRow}>
            <ActionButton label="Kaydet" icon={ShieldCheck} tone={colors.success} onPress={onSave} />
            <ActionButton label="Vazgeç" icon={RotateCcw} tone={colors.coral} onPress={() => setActionMode(null)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function AthleteActionForm({ draft, setDraft }: { draft: Record<string, string>; setDraft: (draft: Record<string, string>) => void }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const genderOptions = ['Erkek', 'Kadın', 'Belirtmek istemiyorum'];
  const groupOptions = ['Performans', 'Gelişim', 'Temel Eğitim', 'Yarış Grubu', 'Özel Ders', 'Masters'];
  const strokeOptions = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık'];
  const targetOptions = ['50 Serbest', '100 Serbest', '200 Serbest', '50 Sırt', '100 Sırt', '50 Kurbağa', '100 Kurbağa', '50 Kelebek', '100 Kelebek', '200 Karışık'];
  const update = (patch: Record<string, string>) => setDraft({ ...draft, ...patch });

  return (
    <>
      <TextInput placeholder="Ad" placeholderTextColor={colors.muted} value={draft.firstName ?? ''} onChangeText={(value) => update({ firstName: value })} style={styles.input} />
      <TextInput placeholder="Soyad" placeholderTextColor={colors.muted} value={draft.lastName ?? ''} onChangeText={(value) => update({ lastName: value })} style={styles.input} />
      <Pressable style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
        <Text style={[styles.dateText, !draft.birthDate && styles.placeholderText]}>{draft.birthDate || 'Doğum tarihi seç'}</Text>
      </Pressable>
      {showDatePicker ? (
        <DateTimePicker
          value={parseAdminDate(draft.birthDate)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, selectedDate) => {
            if (Platform.OS !== 'ios') setShowDatePicker(false);
            if (selectedDate) update({ birthDate: formatAdminDate(selectedDate) });
          }}
        />
      ) : null}
      <Text style={styles.infoLabel}>Cinsiyet</Text>
      <ChipPicker options={genderOptions} value={draft.gender ?? ''} onChange={(value) => update({ gender: value })} />
      <TextInput placeholder="Telefon" placeholderTextColor={colors.muted} value={formatTurkishPhoneForDisplay(draft.phone ?? '')} onChangeText={(value) => update({ phone: value.replace(/\D/g, '').slice(0, 12) })} keyboardType="number-pad" style={styles.input} />
      <TextInput placeholder="E-posta" placeholderTextColor={colors.muted} value={draft.email ?? ''} onChangeText={(value) => update({ email: value })} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <Text style={styles.infoLabel}>Grup</Text>
      <ChipPicker options={groupOptions} value={draft.group ?? ''} onChange={(value) => update({ group: value })} />
      <Text style={styles.infoLabel}>Ana stil</Text>
      <ChipPicker options={strokeOptions} value={draft.mainStroke ?? ''} onChange={(value) => update({ mainStroke: value })} />
      <Text style={styles.infoLabel}>Hedef branş</Text>
      <ChipPicker options={targetOptions} value={draft.targetEvent ?? ''} onChange={(value) => update({ targetEvent: value })} />
      <TextInput placeholder="Veli adı" placeholderTextColor={colors.muted} value={draft.guardianName ?? ''} onChangeText={(value) => update({ guardianName: value })} style={styles.input} />
      <TextInput placeholder="Veli telefon" placeholderTextColor={colors.muted} value={formatTurkishPhoneForDisplay(draft.guardianPhone ?? '')} onChangeText={(value) => update({ guardianPhone: value.replace(/\D/g, '').slice(0, 12) })} keyboardType="number-pad" style={styles.input} />
      <TextInput placeholder="Veli e-posta" placeholderTextColor={colors.muted} value={draft.guardianEmail ?? ''} onChangeText={(value) => update({ guardianEmail: value })} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Antrenör notu" placeholderTextColor={colors.muted} value={draft.coachNote ?? ''} onChangeText={(value) => update({ coachNote: value })} style={styles.input} />
      {draft.phone ? <Text style={styles.helperText}>Firestore telefon formatı: {normalizeTurkishPhone(draft.phone)}</Text> : null}
    </>
  );
}

function ChipPicker({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.choiceChip, value === option && styles.choiceChipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.choiceText, value === option && styles.choiceTextActive]}>{option}</Text>
        </Pressable>
      ))}
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
      <FilterNote text="Filtre hazÄ±rlÄ±ÄŸÄ±: rol, kulÃ¼p ve aktif/pasif durum alanlarÄ± backend baÄŸlandÄ±ÄŸÄ±nda geniÅŸletilecek." />
      {rows.map((row) => (
        <PanelCard key={row.role} title={row.role} subtitle="Aktif/pasif filtre hazÄ±r">
          <InfoLine label="KayÄ±t" value={String(row.count)} />
        </PanelCard>
      ))}
    </View>
  );
}

function AthletesTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.athletes.length) return <EmptyState title="HenÃ¼z sporcu verisi yok." detail="Demo Verileri sekmesinden Ã¶rnek veri yÃ¼kleyebilirsin." icon={Users} tone={colors.cyan} />;
  return (
    <View style={styles.list}>
      <FilterNote text="Filtreler: kulÃ¼p, grup, yaÅŸ ve stil." />
      {snapshot.athletes.map((athlete) => (
        <PanelCard key={athlete.id} title={athlete.fullName} subtitle={athlete.club}>
          <InfoLine label="Grup" value={athlete.group || '-'} />
          <InfoLine label="Doğum yılı / Yaş" value={`${athlete.birthYear || '-'} / ${athlete.age || '-'}`} />
          <InfoLine label="Ana stil" value={athlete.mainStroke || '-'} />
          <InfoLine label="Hedef branş" value={athlete.targetEvent || '-'} />
          <InfoLine label="Son yarÄ±ÅŸ derecesi" value={athlete.lastRaceResult || '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function CoachesTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.coaches.length) return <EmptyState title="HenÃ¼z antrenÃ¶r verisi yok." detail="Kulüp yÃ¶neticisi antrenÃ¶r eklediÄŸinde burada gÃ¶rÃ¼nÃ¼r." icon={UserCircle} tone={colors.violet} />;
  return (
    <View style={styles.list}>
      {snapshot.coaches.map((coach) => (
        <PanelCard key={coach.id} title={coach.fullName} subtitle={coach.club}>
          <InfoLine label="Görev" value={coach.duty || '-'} />
          <InfoLine label="Sorumlu grup" value={coach.group || '-'} />
          <InfoLine label="Yetki seviyesi" value={coach.permission || '-'} />
          <InfoLine label="EklediÄŸi antrenman" value={String(coach.trainingPlanCount ?? 0)} />
        </PanelCard>
      ))}
    </View>
  );
}

function GroupsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.groups.length) return <EmptyState title="Henüz grup oluşturulmadı." detail="Admin veya kulüp yöneticisi Grup Ekle ile dinamik grup oluşturabilir." icon={ClipboardList} tone={colors.gold} />;
  return (
    <View style={styles.list}>
      <FilterNote text="Gruplar Firestore clubs/{clubId}/groups altında tutulur. Antrenman planı atama ekranı bu koleksiyondan beslenmeye hazırdır." />
      {snapshot.groups.map((group) => (
        <PanelCard key={group.id} title={group.name} subtitle={group.club}>
          <InfoLine label="Seviye" value={group.level || '-'} />
          <InfoLine label="Açıklama" value={group.description || '-'} />
          <InfoLine label="Antrenör" value={String(group.coachIds.length)} />
          <InfoLine label="Sporcu" value={String(group.athleteIds.length)} />
          <InfoLine label="Durum" value={group.isActive ? 'Aktif' : 'Pasif'} />
        </PanelCard>
      ))}
    </View>
  );
}

function TrainingTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.trainingPlans.length) return <EmptyState title="HenÃ¼z antrenman planÄ± yok." detail="Planlar kulÃ¼p bazlÄ± localStore verisinden okunur." icon={Dumbbell} tone={colors.blue} />;
  return (
    <View style={styles.list}>
      {snapshot.trainingPlans.map((plan) => (
        <PanelCard key={plan.id} title={plan.title} subtitle={`${plan.date || '-'} • ${plan.club}`}>
          <InfoLine label="Grup / Sporcu" value={plan.group || '-'} />
          <InfoLine label="Toplam metre" value={plan.totalMeters || '-'} />
          <InfoLine label="Set sayÄ±sÄ±" value={String(plan.setCount ?? 0)} />
          <InfoLine label="Kara antrenmanÄ±" value={plan.hasDryland ? 'Var' : 'Yok'} />
          <InfoLine label="Oluşturan" value={plan.coachName || '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function RaceResultsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.raceResults.length) return <EmptyState title="HenÃ¼z yarÄ±ÅŸ sonucu yok." detail="CanlÄ± giriÅŸ veya yarÄ±ÅŸ sonucu kaydedilince burada gÃ¶rÃ¼nÃ¼r." icon={Trophy} tone={colors.gold} />;
  return (
    <View style={styles.list}>
      {snapshot.raceResults.map((race) => (
        <PanelCard key={race.id} title={race.athleteName} subtitle={`${race.club} • ${race.competitionName || 'Yarış adı yok'}`}>
          <InfoLine label="Tarih" value={race.date || '-'} />
          <InfoLine label="BranÅŸ" value={`${race.distance || '-'} ${race.stroke || ''}`.trim()} />
          <InfoLine label="Derece" value={race.finalTime || '-'} />
          <InfoLine label="PB" value={race.isPB ? 'Yeni PB' : '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function NotificationsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.notifications.length) return <EmptyState title="HenÃ¼z bildirim verisi yok." detail="Kulüp bildirimleri localStore Ã¼zerinden listelenir." icon={BellRing} tone={colors.coral} />;
  return (
    <View style={styles.list}>
      {snapshot.notifications.map((item) => (
        <PanelCard key={item.id} title={item.title} subtitle={item.club}>
          <InfoLine label="TÃ¼r" value={item.type || '-'} />
          <InfoLine label="Tarih" value={item.date || '-'} />
          <InfoLine label="Okundu" value={String(item.readCount)} />
          <InfoLine label="Okunmadı" value={String(item.unreadCount)} />
        </PanelCard>
      ))}
    </View>
  );
}

function AuditLogsTab({ snapshot }: { snapshot: AdminSnapshot }) {
  if (!snapshot.auditLogs.length) return <EmptyState title="Henüz işlem geçmişi yok." detail="Kritik admin işlemleri auditLogs koleksiyonuna yazıldığında burada görünür." icon={ShieldCheck} tone={colors.success} />;
  return (
    <View style={styles.list}>
      {snapshot.auditLogs.slice(0, 40).map((log) => (
        <PanelCard key={log.id} title={log.action} subtitle={`${log.actorName || 'System'} • ${log.createdAt || '-'}`}>
          <InfoLine label="Rol" value={log.role || '-'} />
          <InfoLine label="Kulüp" value={log.clubId || '-'} />
          <InfoLine label="Varlık" value={`${log.entityType || '-'} / ${log.entityId || '-'}`} />
          <InfoLine label="Detay" value={log.details || '-'} />
        </PanelCard>
      ))}
    </View>
  );
}

function InviteCodesTab({ codes, onCreate, onToggle }: { codes: InviteCodeRecord[]; onCreate: (input: { code: string; clubId: string; role: InviteRole; note: string; maxUses: string; expiresAt: string; isActive: boolean }) => void; onToggle: (code: string, active: boolean) => void }) {
  const [draft, setDraft] = useState({
    code: '',
    clubId: 'mev-koleji',
    role: 'athlete' as InviteRole,
    note: '',
    maxUses: '10',
    expiresAt: '',
    isActive: true,
  });
  const roleOptions: Array<{ role: InviteRole; label: string }> = [
    { role: 'athlete', label: 'Sporcu' },
    { role: 'parent', label: 'Veli' },
    { role: 'coach', label: 'Antrenör' },
    { role: 'club_admin', label: 'Kulüp Yöneticisi' },
    { role: 'super_admin', label: 'Super Admin' },
  ];
  const visibleClubs = draft.role === 'super_admin' ? inviteClubs.filter((club) => club.id === 'all-clubs') : inviteClubs.filter((club) => club.id !== 'all-clubs');

  useEffect(() => {
    if (draft.role === 'super_admin' && draft.clubId !== 'all-clubs') setDraft((current) => ({ ...current, clubId: 'all-clubs' }));
    if (draft.role !== 'super_admin' && draft.clubId === 'all-clubs') setDraft((current) => ({ ...current, clubId: 'mev-koleji' }));
  }, [draft.clubId, draft.role]);

  return (
    <View style={styles.list}>
      <PanelCard title="Kod oluÅŸtur" subtitle="BoÅŸ bÄ±rakÄ±rsan sistem kÄ±sa ve okunabilir bir kod Ã¼retir. Ã–rnek: MEV-COACH-4821">
        <Text style={styles.infoLabel}>Kulüp seç</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {visibleClubs.map((club) => (
            <Pressable key={club.id} style={[styles.tab, draft.clubId === club.id && styles.tabActive]} onPress={() => setDraft({ ...draft, clubId: club.id })}>
              <Text style={[styles.tabText, draft.clubId === club.id && styles.tabTextActive]}>{club.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.infoLabel}>Rol seç</Text>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {roleOptions.map((item) => (
            <Pressable key={item.role} style={[styles.tab, draft.role === item.role && styles.tabActive]} onPress={() => setDraft({ ...draft, role: item.role })}>
              <Text style={[styles.tabText, draft.role === item.role && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <TextInput placeholder="Manuel kod (opsiyonel)" placeholderTextColor={colors.muted} value={draft.code} onChangeText={(value) => setDraft({ ...draft, code: value.toUpperCase() })} autoCapitalize="characters" style={styles.input} />
        <TextInput placeholder="Kod adı / aÃ§Ä±klama" placeholderTextColor={colors.muted} value={draft.note} onChangeText={(value) => setDraft({ ...draft, note: value })} style={styles.input} />
        <TextInput placeholder="Kullanım limiti" placeholderTextColor={colors.muted} value={draft.maxUses} onChangeText={(value) => setDraft({ ...draft, maxUses: value.replace(/\D/g, '') })} keyboardType="number-pad" style={styles.input} />
        <TextInput placeholder="Son geÃ§erlilik tarihi (YYYY-MM-DD, opsiyonel)" placeholderTextColor={colors.muted} value={draft.expiresAt} onChangeText={(value) => setDraft({ ...draft, expiresAt: value })} style={styles.input} />
        <Pressable style={[styles.actionButton, { borderColor: draft.isActive ? `${colors.success}55` : `${colors.coral}55`, backgroundColor: draft.isActive ? `${colors.success}18` : `${colors.coral}18` }]} onPress={() => setDraft({ ...draft, isActive: !draft.isActive })}>
          <ShieldCheck color={draft.isActive ? colors.success : colors.coral} size={18} />
          <Text style={styles.actionText}>{draft.isActive ? 'Aktif' : 'Pasif'}</Text>
        </Pressable>
        <ActionButton label="Kod Oluştur" icon={KeyRound} tone={colors.cyan} onPress={() => onCreate(draft)} />
      </PanelCard>

      {codes.length ? codes.map((code) => (
        <PanelCard key={code.code} title={code.code} subtitle={`${code.clubName} • ${roleDisplay(code.role)}`}>
          <InfoLine label="Durum" value={code.isActive ? 'Aktif' : 'Pasif'} />
          <InfoLine label="Kullanım" value={`${code.usedCount}/${code.maxUses}`} />
          <InfoLine label="Son geÃ§erlilik" value={code.expiresAt || 'SÃ¼resiz'} />
          <InfoLine label="Not" value={code.note || '-'} />
          <InfoLine label="Oluşturan" value={code.createdBy || '-'} />
          {code.role === 'super_admin' ? <InfoLine label="GÃ¶rÃ¼nÃ¼rlÃ¼k" value="Sadece Admin Paneli" /> : null}
          <ActionButton label={code.isActive ? 'Kodu PasifleÅŸtir' : 'Kodu AktifleÅŸtir'} icon={ShieldCheck} tone={code.isActive ? colors.coral : colors.success} onPress={() => onToggle(code.code, !code.isActive)} />
        </PanelCard>
      )) : <EmptyState title="HenÃ¼z davet kodu yok." detail="İlk kodu oluÅŸturmak iÃ§in formu kullan." icon={KeyRound} tone={colors.cyan} />}
    </View>
  );
}

function DemoDataTab({ snapshot, onClearClub, onClearAll, onSeed, onEnsureClubs }: { snapshot: AdminSnapshot; onClearClub: (clubId: string) => void; onClearAll: () => void; onSeed: () => void; onEnsureClubs: () => void }) {
  return (
    <View style={styles.list}>
      <PanelCard title="Local storage durumu" subtitle="Kulüp bazlı pilot veri anahtarları">
        {snapshot.storageRows.map((row) => <InfoLine key={`${row.key}-${row.club}`} label={`${row.club} / ${row.key}`} value={String(row.count)} />)}
      </PanelCard>
      <View style={styles.actionRow}>
        <ActionButton label="Demo kulüpleri oluştur" icon={Building2} tone={colors.gold} onPress={onEnsureClubs} />
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
      <PanelCard title="Sistem Durumu" subtitle="Pilot veritabanÄ± ve cihaz cache Ã¶zeti">
        <InfoLine label="Takip edilen kulÃ¼p" value={String(snapshot.clubs.length)} />
        <InfoLine label="Storage key sayÄ±sÄ±" value={String(snapshot.storageRows.length)} />
        <InfoLine label="Veri kaynaÄŸÄ±" value={snapshot.dataSource.label} />
        <InfoLine label="Son kayÄ±t durumu" value={snapshot.dataSource.firestoreEnabled ? 'Firestore yazÄ±mÄ± deneniyor' : 'Local fallback kullanÄ±lÄ±yor'} />
        <InfoLine label="Security Rules" value="Role göre erişim taslağı firestore.rules içinde" />
      </PanelCard>
      <FilterNote text="Admin panelde gÃ¼nlÃ¼k kullanÄ±m modÃ¼lleri gÃ¶sterilmez; yalnÄ±zca veri, storage ve sistem yÃ¶netimi bulunur." />
    </View>
  );
}

function MetricCard({ label, value, icon: Icon, tone, onPress }: { label: string; value: string; icon: LucideIcon; tone: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.metricCard, { borderColor: `${tone}55` }, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.metricIcon, { backgroundColor: `${tone}22` }]}>
        <Icon color={tone} size={22} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Pressable>
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

function ActionButton({ label, icon: Icon, tone, onPress }: { label: string; icon: LucideIcon; tone: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.actionButton, { borderColor: `${tone}55`, backgroundColor: `${tone}18` }]} onPress={onPress}>
      <Icon color={tone} size={18} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

function roleDisplay(role: InviteRole) {
  const labels: Record<InviteRole, string> = {
    athlete: 'Sporcu',
    parent: 'Veli',
    coach: 'Antrenör',
    club_admin: 'Kulüp Yöneticisi',
    super_admin: 'Super Admin',
  };
  return labels[role];
}

function formatTurkishPhoneForDisplay(value: string) {
  const normalized = normalizeTurkishPhone(value);
  const digits = normalized.replace(/\D/g, '');
  const gsm = digits.startsWith('90') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  if (!gsm) return '';
  const a = gsm.slice(0, 3);
  const b = gsm.slice(3, 6);
  const c = gsm.slice(6, 8);
  const d = gsm.slice(8, 10);
  return `+90${a ? ` (${a}` : ''}${a.length === 3 ? ')' : ''}${b ? ` ${b}` : ''}${c ? ` ${c}` : ''}${d ? ` ${d}` : ''}`.trim();
}

function formatAdminDate(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

function parseAdminDate(value?: string) {
  if (!value) return new Date();
  const parts = value.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function makeSummary(snapshot: AdminSnapshot, activeDemoUsers: number) {
  const totalUsers = snapshot.athletes.length + snapshot.coaches.length + adminClubs.length + 1;
  return [
    { label: 'Toplam kulüp', value: String(snapshot.clubs.length), icon: Building2, tone: colors.cyan, targetTab: 'clubs' as AdminTab },
    { label: 'Toplam kullanıcı', value: String(totalUsers), icon: Users, tone: colors.coral, targetTab: 'users' as AdminTab },
    { label: 'Toplam sporcu', value: String(snapshot.athletes.length), icon: Users, tone: colors.blue, targetTab: 'athletes' as AdminTab },
    { label: 'Toplam antrenör', value: String(snapshot.coaches.length), icon: UserCircle, tone: colors.violet, targetTab: 'coaches' as AdminTab },
    { label: 'Toplam grup', value: String(snapshot.groups.length), icon: ClipboardList, tone: colors.gold, targetTab: 'groups' as AdminTab },
    { label: 'Antrenman', value: String(snapshot.trainingPlans.length), icon: Dumbbell, tone: colors.blue, targetTab: 'training' as AdminTab },
    { label: 'Yarış sonuçları', value: String(snapshot.raceResults.length), icon: Trophy, tone: colors.gold, targetTab: 'raceResults' as AdminTab },
    { label: 'Bildirimler', value: String(snapshot.notifications.length), icon: BellRing, tone: colors.coral, targetTab: 'notifications' as AdminTab },
    { label: 'İşlem geçmişi', value: String(snapshot.auditLogs.length), icon: ShieldCheck, tone: colors.success, targetTab: 'auditLogs' as AdminTab },
    { label: 'Demo Verileri', value: String(activeDemoUsers), icon: ShieldCheck, tone: colors.success, targetTab: 'demoData' as AdminTab },
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
  managementCard: { borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.md },
  inlineForm: { gap: spacing.sm, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md },
  input: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  dateInput: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, justifyContent: 'center' },
  dateText: { color: colors.text, fontWeight: '900' },
  placeholderText: { color: colors.muted },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  choiceChip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, paddingVertical: 9 },
  choiceChipActive: { borderColor: colors.cyan, backgroundColor: colors.cyanSoft },
  choiceText: { color: colors.mutedStrong, fontWeight: '900' },
  choiceTextActive: { color: colors.text },
  helperText: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
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
  pressed: { opacity: 0.78 },
});


