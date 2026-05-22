import { router } from 'expo-router';
import { CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Eye, Megaphone, Plus, ShieldAlert, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { AnnouncementType, ClubAnnouncement, ClubGroup, ClubPriority, createAnnouncement, markAnnouncementSeen, mockAnnouncements } from '@/services/clubBoard';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type AnnouncementFilter = 'Tümü' | 'Antrenman' | 'Yarış' | 'Kamp' | 'Acil' | 'Bu hafta';
type BoardTab = 'announcements' | 'calendar';
type SheetState = { title: string; options: string[]; selected: string; onConfirm: (value: string) => void } | null;

const announcementTypes: AnnouncementType[] = ['Genel Duyuru', 'Antrenman Saati', 'Yarış Duyurusu', 'Kamp Duyurusu', 'Ölçüm Günü', 'Veli Bilgilendirme', 'Beslenme Notu', 'Acil Bilgilendirme'];
const groups: ClubGroup[] = ['Tüm Kulüp', 'Performans Grubu', 'Küçük Yaş Grubu', 'Masters', 'Belirli Sporcular', 'Veliler', 'Antrenörler'];
const priorities: ClubPriority[] = ['Normal', 'Önemli', 'Acil'];
const filters: AnnouncementFilter[] = ['Tümü', 'Antrenman', 'Yarış', 'Kamp', 'Acil', 'Bu hafta'];
const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const weekDaysShort = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const seenRows = ['Deniz Arslan - Görüldü', 'Ece Yılmaz - Görülmedi', 'Veli: Ayşe Arslan - Görüldü'];
const compactCalendarItems = [
  { type: 'Antrenman', title: 'Sprint set', date: '22.05', time: '17:30' },
  { type: 'Yarış', title: 'Marmara Cup', date: '02.06', time: '09:00' },
  { type: 'Kamp', title: 'Kısa kulvar kampı', date: '08.06', time: '10:00' },
  { type: 'Ölçüm', title: 'Laktat testi', date: '11.06', time: '18:00' },
  { type: 'Toplantı', title: 'Veli bilgilendirme', date: '14.06', time: '20:00' },
  { type: 'Dinlenme', title: 'Aktif recovery', date: '16.06', time: 'Tüm gün' },
];

export default function ClubBoardScreen() {
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const [announcements, setAnnouncements] = useState(mockAnnouncements);
  const [filter, setFilter] = useState<AnnouncementFilter>('Tümü');
  const [activeTab, setActiveTab] = useState<BoardTab>('announcements');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AnnouncementType>('Genel Duyuru');
  const [group, setGroup] = useState<ClubGroup>('Tüm Kulüp');
  const [priority, setPriority] = useState<ClubPriority>('Normal');
  const [date, setDate] = useState('20.05.2026');
  const [time, setTime] = useState('17:30');
  const [description, setDescription] = useState('');

  const visibleAnnouncements = useMemo(() => filterAnnouncements(announcements, filter), [announcements, filter]);

  const openSheet = (nextSheet: SheetState) => setSheet(nextSheet);

  const handleCreateAnnouncement = async () => {
    if (!canEdit) {
      setMessage('Duyuru yayınlamak için antrenör veya kulüp yöneticisi hesabı gerekir.');
      return;
    }

    const newAnnouncement = await createAnnouncement({
      type,
      title: title.trim() || 'Yeni duyuru',
      description: description.trim() || 'Kısa bilgilendirme',
      date,
      time,
      group,
      priority,
      visibility: 'Sporcular + Veliler',
      publisher: currentUser.role === 'club_admin' ? 'Kulüp Yönetimi' : 'Görkem Pınar',
    });

    setAnnouncements((current) => [newAnnouncement, ...current]);
    setTitle('');
    setDescription('');
    setShowForm(false);
    setMessage(priority === 'Acil' ? 'Bu duyuru bildirim olarak gönderilecek.' : 'Duyuru yayınlandı.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Kulüp Panosu</Text>
            <Text style={styles.subtitle}>Duyuru merkezi, antrenör mesajları ve veli bilgilendirmeleri.</Text>
          </View>
          <Pressable style={styles.calendarLink} onPress={() => router.push('/features/calendar')}>
            <CalendarDays color={colors.cyan} size={20} />
            <Text style={styles.calendarLinkText}>Takvim</Text>
          </Pressable>
        </View>

        <View style={styles.tabSwitch}>
          <Pressable style={[styles.tabButton, activeTab === 'announcements' && styles.tabButtonActive]} onPress={() => setActiveTab('announcements')}>
            <Text style={[styles.tabText, activeTab === 'announcements' && styles.tabTextActive]}>Duyurular</Text>
          </Pressable>
          <Pressable style={[styles.tabButton, activeTab === 'calendar' && styles.tabButtonActive]} onPress={() => setActiveTab('calendar')}>
            <Text style={[styles.tabText, activeTab === 'calendar' && styles.tabTextActive]}>Takvim</Text>
          </Pressable>
        </View>

        <GlassCard style={styles.warningCard}>
          <ShieldAlert color={colors.gold} size={22} />
          <Text style={styles.warningText}>Sporcu özel bilgisi paylaşılmamalı. KVKK ve gizlilik kuralları duyurularda geçerlidir.</Text>
        </GlassCard>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {activeTab === 'calendar' ? <CompactCalendar /> : null}

        {activeTab === 'announcements' && canEdit ? (
          <>
            <Pressable style={styles.createToggle} onPress={() => setShowForm((current) => !current)}>
              <Plus color={colors.background} size={20} />
              <Text style={styles.createToggleText}>{showForm ? 'Duyuru formunu kapat' : 'Duyuru oluştur'}</Text>
            </Pressable>
            {showForm ? (
              <GlassCard style={styles.card}>
                <View style={styles.cardHeader}>
                  <Megaphone color={colors.cyan} size={22} />
                  <Text style={styles.cardTitle}>Yeni duyuru</Text>
                </View>
                <TextInput value={title} onChangeText={setTitle} placeholder="Başlık" placeholderTextColor={colors.muted} style={styles.input} />
                <SelectField label="Duyuru türü seç" value={type} onPress={() => openSheet({ title: 'Duyuru türü seç', options: announcementTypes, selected: type, onConfirm: (value) => setType(value as AnnouncementType) })} />
                <SelectField label="Hedef grup seç" value={group} onPress={() => openSheet({ title: 'Hedef grup seç', options: groups, selected: group, onConfirm: (value) => setGroup(value as ClubGroup) })} />
                <SelectField label="Öncelik seç" value={priority} onPress={() => openSheet({ title: 'Öncelik seç', options: priorities, selected: priority, onConfirm: (value) => setPriority(value as ClubPriority) })} />
                <DatePickerField value={date} onChange={setDate} />
                <TimePickerField value={time} onChange={setTime} />
                <TextInput value={description} onChangeText={setDescription} placeholder="Açıklama" placeholderTextColor={colors.muted} style={[styles.input, styles.descriptionInput]} multiline={true} />
                <AppButton title="Yayınla" icon={Plus} onPress={handleCreateAnnouncement} />
              </GlassCard>
            ) : null}
          </>
        ) : null}

        {activeTab === 'announcements' ? <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => (
            <Pressable key={item} style={[styles.filterChip, filter === item && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView> : null}

        {activeTab === 'announcements' ? visibleAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            canEdit={canEdit}
            expanded={expandedId === announcement.id}
            onToggle={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
            onSeen={() => setAnnouncements((current) => current.map((item) => (item.id === announcement.id ? markSeenSync(announcement) : item)))}
          />
        )) : null}
      </ScrollView>

      <SelectionSheet sheet={sheet} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

function SelectField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={styles.selectField} onPress={onPress}>
      <View>
        <Text style={styles.selectLabel}>{label}</Text>
        <Text style={styles.selectValue}>{value}</Text>
      </View>
      <ChevronDown color={colors.cyan} size={20} />
    </Pressable>
  );
}

function CompactCalendar() {
  return (
    <View style={styles.calendarGrid}>
      {compactCalendarItems.map((item) => (
        <GlassCard key={`${item.type}-${item.date}`} style={styles.calendarCard}>
          <Text style={styles.calendarType}>{item.type}</Text>
          <Text style={styles.calendarItemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.calendarMeta}>{item.date} / {item.time}</Text>
        </GlassCard>
      ))}
    </View>
  );
}

function AnnouncementCard({ announcement, canEdit, expanded, onToggle, onSeen }: { announcement: ClubAnnouncement; canEdit: boolean; expanded: boolean; onToggle: () => void; onSeen: () => void }) {
  const accent = announcement.priority === 'Acil' ? colors.danger : announcement.priority === 'Önemli' ? colors.gold : colors.cyan;
  return (
    <Pressable onPress={onToggle}>
      <GlassCard style={[styles.itemCard, { borderLeftColor: accent }]}>
        <View style={styles.itemHeader}>
          <Text style={[styles.type, { color: accent }]}>{announcement.type}</Text>
          <Text style={[styles.priority, { color: accent }]}>{announcement.priority}</Text>
        </View>
          <Text style={styles.itemTitle} numberOfLines={1}>{announcement.title}</Text>
          <Text style={styles.meta} numberOfLines={expanded ? undefined : 2}>{announcement.description}</Text>
        <Text style={styles.dateLine}>{announcement.date} / {announcement.time} • {announcement.seenCount} görüldü</Text>
        <Text style={styles.publisher}>{announcement.group}</Text>
        {expanded ? (
          <View style={styles.detailBox}>
            <Text style={styles.detailText}>Yayınlayan: {announcement.publisher}</Text>
            <Text style={styles.detailText}>18 kişiden {Math.min(12, announcement.seenCount)} kişi gördü</Text>
            {canEdit ? seenRows.map((row) => <Text key={row} style={styles.detailText}>{row}</Text>) : null}
            <Text style={styles.kvkkText}>KVKK uyarısı: Sporcu özel bilgisi ve hassas veri paylaşılmamalıdır.</Text>
          </View>
        ) : null}
        <Pressable style={styles.seenButton} onPress={onSeen}>
          <Eye color={colors.cyan} size={16} />
          <Text style={styles.seenText}>{announcement.seenByMe ? 'Görüldü' : 'Gördüm'}</Text>
        </Pressable>
      </GlassCard>
    </Pressable>
  );
}

function SelectionSheet({ sheet, onClose }: { sheet: SheetState; onClose: () => void }) {
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    setTempValue(sheet?.selected || sheet?.options[0] || '');
  }, [sheet]);

  if (!sheet) return null;

  return (
    <Modal transparent={true} visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <View style={styles.sheetOptions}>
            {sheet.options.map((option) => {
              const active = tempValue === option;
              return (
                <Pressable key={option} style={({ pressed }) => [styles.sheetOption, active && styles.sheetOptionActive, pressed && styles.pressedOption]} onPress={() => { sheet.onConfirm(option); onClose(); }}>
                  {active ? <Check color={colors.text} size={14} /> : null}
                  <Text style={[styles.sheetOptionText, active && styles.sheetOptionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          {false ? <View style={styles.sheetActions}>
            <AppButton title="İptal" variant="secondary" onPress={onClose} />
            <AppButton title="Seç" onPress={() => { sheet!.onConfirm(tempValue); onClose(); }} />
          </View> : null}
        </View>
      </View>
    </Modal>
  );
}

function DatePickerField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => parseDate(value) ?? new Date());
  const selected = parseDate(value);
  const today = new Date();
  const days = buildCalendarDays(visibleMonth);

  return (
    <View>
      <Pressable style={styles.selectField} onPress={() => setVisible(true)}>
        <View>
          <Text style={styles.selectLabel}>Tarih seç</Text>
          <Text style={styles.selectValue}>{value}</Text>
        </View>
        <CalendarDays color={colors.cyan} size={20} />
      </Pressable>
      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.centerOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Pressable style={styles.arrowButton} onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
                <ChevronLeft color={colors.text} size={20} />
              </Pressable>
              <Text style={styles.calendarTitle}>{monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</Text>
              <Pressable style={styles.arrowButton} onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
                <ChevronRight color={colors.text} size={20} />
              </Pressable>
            </View>
            <View style={styles.weekRow}>
              {weekDaysShort.map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}
            </View>
            <View style={styles.dayGrid}>
              {days.map((day, index) => {
                const isSelected = selected ? isSameDate(day.date, selected) : false;
                const isToday = isSameDate(day.date, today);
                return (
                  <Pressable
                    key={`${day.date.toISOString()}-${index}`}
                    style={[styles.dayCell, !day.inMonth && styles.dayMuted, isToday && styles.dayToday, isSelected && styles.daySelected]}
                    onPress={() => {
                      onChange(formatDate(day.date));
                      setVisible(false);
                    }}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.date.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimePickerField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(value.split(':')[0] || '17');
  const [minute, setMinute] = useState(value.split(':')[1] || '30');
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

  return (
    <View>
      <Pressable style={styles.selectField} onPress={() => setVisible(true)}>
        <View>
          <Text style={styles.selectLabel}>Saat seç</Text>
          <Text style={styles.selectValue}>{value}</Text>
        </View>
        <Clock color={colors.cyan} size={20} />
      </Pressable>
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Saat seç</Text>
            <Text style={styles.timePreview}>{hour}:{minute}</Text>
            <Text style={styles.selectLabel}>Saat</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeOptions}>
              {hours.map((item) => <TimeChip key={item} label={item} active={hour === item} onPress={() => setHour(item)} />)}
            </ScrollView>
            <Text style={styles.selectLabel}>Dakika</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeOptions}>
              {minutes.map((item) => <TimeChip key={item} label={item} active={minute === item} onPress={() => setMinute(item)} />)}
            </ScrollView>
            <View style={styles.sheetActions}>
              <AppButton title="İptal" variant="secondary" onPress={() => setVisible(false)} />
              <AppButton title="Seç" onPress={() => { onChange(`${hour}:${minute}`); setVisible(false); }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimeChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.timeChip, active && styles.timeChipActive]} onPress={onPress}>
      <Text style={[styles.timeChipText, active && styles.timeChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function filterAnnouncements(announcements: ClubAnnouncement[], filter: AnnouncementFilter) {
  if (filter === 'Tümü') return announcements;
  if (filter === 'Antrenman') return announcements.filter((item) => item.type === 'Antrenman Saati');
  if (filter === 'Yarış') return announcements.filter((item) => item.type === 'Yarış Duyurusu');
  if (filter === 'Kamp') return announcements.filter((item) => item.type === 'Kamp Duyurusu');
  if (filter === 'Acil') return announcements.filter((item) => item.priority === 'Acil' || item.type === 'Acil Bilgilendirme');
  return announcements.slice(0, 4);
}

function markSeenSync(announcement: ClubAnnouncement) {
  void markAnnouncementSeen(announcement);
  return { ...announcement, seenByMe: true, seenCount: announcement.seenByMe ? announcement.seenCount : announcement.seenCount + 1 };
}

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function parseDate(value: string) {
  const [day, month, year] = value.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return { date, inMonth: date.getMonth() === month };
  });
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 100, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22, marginTop: spacing.sm },
  calendarLink: { minWidth: 82, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.sm, alignItems: 'center', gap: 4 },
  calendarLinkText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  tabSwitch: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 4 },
  tabButton: { flex: 1, minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tabButtonActive: { backgroundColor: colors.cyan },
  tabText: { color: colors.muted, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  warningCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.goldSoft },
  warningText: { flex: 1, color: colors.text, lineHeight: 21, fontWeight: '700' },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  createToggle: { minHeight: 50, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createToggleText: { color: colors.background, fontWeight: '900', fontSize: 16 },
  card: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  input: { color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 46, paddingHorizontal: spacing.md, fontWeight: '800' },
  descriptionInput: { minHeight: 74, paddingTop: spacing.md, textAlignVertical: 'top' },
  selectField: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectLabel: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  selectValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  calendarCard: { width: '48%', minHeight: 96, gap: 5, padding: spacing.md },
  calendarType: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  calendarItemTitle: { color: colors.text, fontWeight: '900', fontSize: 15 },
  calendarMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 2 },
  filterRow: { gap: spacing.sm, paddingRight: spacing.lg },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 9, backgroundColor: colors.glass },
  filterChipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  filterText: { color: colors.muted, fontWeight: '900' },
  filterTextActive: { color: colors.text },
  itemCard: { gap: spacing.sm, borderLeftWidth: 4, paddingVertical: spacing.md },
  itemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  type: { fontWeight: '900' },
  priority: { fontWeight: '900', fontSize: 12 },
  itemTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  meta: { color: colors.muted, lineHeight: 20, fontWeight: '700' },
  dateLine: { color: colors.text, fontWeight: '900' },
  publisher: { color: colors.mutedStrong, fontWeight: '900' },
  detailBox: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, gap: 4 },
  detailText: { color: colors.mutedStrong, fontWeight: '800' },
  kvkkText: { color: colors.gold, fontWeight: '800', lineHeight: 19 },
  seenButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 8 },
  seenText: { color: colors.text, fontWeight: '900' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { maxHeight: '82%', backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  sheetOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sheetOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 9, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: 6 },
  sheetOptionActive: { borderColor: colors.cyan, backgroundColor: colors.cyan },
  pressedOption: { transform: [{ scale: 0.98 }] },
  sheetOptionText: { color: colors.mutedStrong, fontWeight: '900' },
  sheetOptionTextActive: { color: colors.text },
  sheetActions: { flexDirection: 'row', gap: spacing.sm },
  centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'center', padding: spacing.lg },
  calendarModal: { backgroundColor: colors.surfaceSolid, borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.lg, gap: spacing.md },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowButton: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  calendarTitle: { color: colors.text, fontWeight: '900', fontSize: 18, textAlign: 'center' },
  weekRow: { flexDirection: 'row' },
  weekDay: { width: `${100 / 7}%`, color: colors.muted, textAlign: 'center', fontWeight: '900', fontSize: 12 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  dayMuted: { opacity: 0.38 },
  dayToday: { borderWidth: 1, borderColor: colors.gold },
  daySelected: { backgroundColor: colors.cyan },
  dayText: { color: colors.text, fontWeight: '900' },
  dayTextSelected: { color: colors.background },
  timePreview: { color: colors.cyan, fontWeight: '900', fontSize: 30, textAlign: 'center' },
  timeOptions: { gap: spacing.sm, paddingVertical: 4 },
  timeChip: { width: 48, height: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass },
  timeChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  timeChipText: { color: colors.text, fontWeight: '900' },
  timeChipTextActive: { color: colors.background },
});
