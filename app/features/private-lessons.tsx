import { CalendarDays, Check, Clock, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import {
  PrivateLessonSlot,
  PrivateLessonStatus,
  approveLessonRequest,
  formatDate,
  getDailySlots,
  getLessonRequests,
  getMonthlyCalendar,
  getWeekStart,
  getWeeklySlots,
  parseDate,
  rejectLessonRequest,
  requestPrivateLesson,
  updateSlotStatus,
} from '@/services/privateLessons';
import { useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type ViewMode = 'monthly' | 'weekly' | 'daily';

const viewTabs: Array<{ id: ViewMode; label: string }> = [
  { id: 'monthly', label: 'Aylık' },
  { id: 'weekly', label: 'Haftalık' },
  { id: 'daily', label: 'Günlük' },
];

const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const statusLabels: Record<PrivateLessonStatus, string> = {
  available: 'Müsait',
  closed: 'Kapalı',
  booked: 'Dolu',
  private_lesson: 'Özel Ders',
  training: 'Antrenman',
  race: 'Yarış',
};

const statusColors: Record<PrivateLessonStatus, string> = {
  available: colors.success,
  closed: colors.danger,
  booked: colors.gold,
  private_lesson: '#A78BFA',
  training: '#3B82F6',
  race: '#F97316',
};

export default function PrivateLessonsScreen() {
  const { currentUser } = useSession();
  const canEdit = currentUser.role === 'coach' || currentUser.role === 'club_admin';
  const [mode, setMode] = useState<ViewMode>('monthly');
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(formatDate(today));
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState('');
  const [editingSlot, setEditingSlot] = useState<PrivateLessonSlot | null>(null);

  const selected = parseDate(selectedDate);
  const monthDays = useMemo(() => getMonthlyCalendar(selected.getFullYear(), selected.getMonth()), [selected, refreshKey]);
  const weekRows = useMemo(() => getWeeklySlots(getWeekStart(selected)), [selectedDate, refreshKey]);
  const dailySlots = useMemo(() => getDailySlots(selectedDate), [selectedDate, refreshKey]);
  const lessonRequests = useMemo(() => getLessonRequests(), [refreshKey]);

  const bump = () => setRefreshKey((value) => value + 1);

  const handleSlotPress = (slot: PrivateLessonSlot) => {
    if (canEdit) {
      setEditingSlot(slot);
      return;
    }
    if (slot.status === 'available') {
      requestPrivateLesson(slot.id, `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'Pilot Kullanıcı', currentUser.role === 'parent' ? 'Çocuğum' : currentUser.firstName);
      bump();
      setMessage('Özel ders talebiniz antrenöre iletildi.');
    }
  };

  const setSlot = (status: PrivateLessonStatus, note?: string) => {
    if (!editingSlot) return;
    updateSlotStatus(editingSlot.id, status, note);
    setEditingSlot(null);
    bump();
    setMessage(`Saat bloğu ${statusLabels[status]} olarak güncellendi.`);
  };

  const handleApprove = (id: string) => {
    approveLessonRequest(id);
    bump();
    setMessage('Ders talebi onaylandı.');
  };

  const handleReject = (id: string) => {
    rejectLessonRequest(id);
    bump();
    setMessage('Ders talebi reddedildi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <CalendarDays color={colors.cyan} size={30} />
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Özel Ders Takvimi</Text>
            <Text style={styles.subtitle}>{canEdit ? 'Müsaitliklerini aylık, haftalık ve günlük takvimle yönet.' : 'Antrenörün uygun Özel ders saatlerini görüntüle ve talep gönder.'}</Text>
          </View>
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.tabs}>
          {viewTabs.map((tab) => (
            <Pressable key={tab.id} style={[styles.tab, mode === tab.id && styles.tabActive]} onPress={() => setMode(tab.id)}>
              <Text style={[styles.tabText, mode === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthTitle}>{monthNames[selected.getMonth()]} {selected.getFullYear()}</Text>
            <Text style={styles.selectedDate}>{formatDisplayDate(selectedDate)}</Text>
          </View>

          {mode === 'monthly' ? <MonthlyCalendar days={monthDays} selectedDate={selectedDate} today={formatDate(today)} onSelect={(date) => { setSelectedDate(date); setMode('daily'); }} /> : null}
          {mode === 'weekly' ? <WeeklyCalendar weekRows={weekRows} onSlotPress={handleSlotPress} canEdit={canEdit} /> : null}
          {mode === 'daily' ? <DailyCalendar slots={dailySlots} onSlotPress={handleSlotPress} canEdit={canEdit} /> : null}
        </GlassCard>

        <RequestPanel requests={lessonRequests} canEdit={canEdit} onApprove={handleApprove} onReject={handleReject} />
      </ScrollView>

      <EditSlotModal slot={editingSlot} onClose={() => setEditingSlot(null)} onSetStatus={setSlot} />
    </SafeAreaView>
  );
}

function MonthlyCalendar({ days, selectedDate, today, onSelect }: { days: ReturnType<typeof getMonthlyCalendar>; selectedDate: string; today: string; onSelect: (date: string) => void }) {
  return (
    <View style={styles.monthWrap}>
      <View style={styles.weekdayRow}>
        {weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}
      </View>
      <View style={styles.monthGrid}>
        {days.map((day) => {
          const available = day.slots.filter((slot) => slot.status === 'available').length;
          const filled = day.slots.filter((slot) => slot.status !== 'available' && slot.status !== 'closed').length;
          const closed = day.slots.some((slot) => slot.status === 'closed');
          const selected = day.date === selectedDate;
          const isToday = day.date === today;
          return (
            <Pressable key={day.date} disabled={!day.inMonth} style={[styles.dayCell, !day.inMonth && styles.dayCellEmpty, selected && styles.dayCellSelected, isToday && styles.dayCellToday]} onPress={() => onSelect(day.date)}>
              {day.inMonth ? (
                <>
                  <Text style={styles.dayNumber}>{day.dayNumber}</Text>
                  <Text style={styles.dayMini}>{filled} dolu</Text>
                  <Text style={styles.dayMini}>{available} müsait</Text>
                  <View style={styles.dayDots}>
                    {available ? <View style={[styles.dayDot, { backgroundColor: colors.success }]} /> : null}
                    {filled ? <View style={[styles.dayDot, { backgroundColor: colors.gold }]} /> : null}
                    {closed ? <View style={[styles.dayDot, { backgroundColor: colors.danger }]} /> : null}
                  </View>
                </>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function WeeklyCalendar({ weekRows, onSlotPress, canEdit }: { weekRows: ReturnType<typeof getWeeklySlots>; onSlotPress: (slot: PrivateLessonSlot) => void; canEdit: boolean }) {
  return (
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.weekGridHeader}>
          <View style={styles.timeHeader} />
          {weekRows.map((day) => (
            <View key={day.date} style={styles.weekDayHeader}>
              <Text style={styles.weekDayText}>{day.dayLabel.slice(0, 3)}</Text>
              <Text style={styles.weekDateText}>{day.date.slice(8)}</Text>
            </View>
          ))}
        </View>
        {weekRows[0]?.slots.map((_, hourIndex) => (
          <View key={hourIndex} style={styles.weekRow}>
            <Text style={styles.hourLabel}>{weekRows[0].slots[hourIndex].startTime}</Text>
            {weekRows.map((day) => <SlotBlock key={`${day.date}-${hourIndex}`} slot={day.slots[hourIndex]} compact={true} onPress={onSlotPress} canEdit={canEdit} />)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function DailyCalendar({ slots, onSlotPress, canEdit }: { slots: PrivateLessonSlot[]; onSlotPress: (slot: PrivateLessonSlot) => void; canEdit: boolean }) {
  return (
    <View style={styles.dailyList}>
      {slots.map((slot) => <SlotBlock key={slot.id} slot={slot} onPress={onSlotPress} canEdit={canEdit} />)}
    </View>
  );
}

function SlotBlock({ slot, compact = false, onPress, canEdit }: { slot: PrivateLessonSlot; compact?: boolean; onPress: (slot: PrivateLessonSlot) => void; canEdit: boolean }) {
  const statusColor = statusColors[slot.status];
  const disabled = !canEdit && slot.status !== 'available';
  return (
    <Pressable disabled={disabled} style={[compact ? styles.weekSlot : styles.dailySlot, { borderColor: statusColor, backgroundColor: `${statusColor}22` }, disabled && styles.disabledSlot]} onPress={() => onPress(slot)}>
      <View style={styles.slotTop}>
        <Text style={[styles.slotStatus, { color: statusColor }]}>{!canEdit && slot.status !== 'available' ? 'Müsait değil' : statusLabels[slot.status]}</Text>
        {!compact ? <Text style={styles.slotTime}>{slot.startTime} - {slot.endTime}</Text> : null}
      </View>
      {!compact ? (
        <>
          <Text style={styles.slotNote}>{slot.note ?? 'Not yok'}</Text>
          <Text style={styles.slotMeta}>{slot.athleteName ?? 'Sporcu yok'} • {slot.lessonType ?? 'Ders türü mock'}</Text>
          {!canEdit && slot.status === 'available' ? <Text style={styles.requestHint}>Ders Talep Et</Text> : null}
        </>
      ) : (
        <Text style={styles.weekSlotText}>{slot.status === 'available' ? 'Müsait' : statusLabels[slot.status]}</Text>
      )}
    </Pressable>
  );
}

function RequestPanel({ requests, canEdit, onApprove, onReject }: { requests: ReturnType<typeof getLessonRequests>; canEdit: boolean; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  const pending = requests.filter((item) => item.status === 'pending');
  const approved = requests.filter((item) => item.status === 'approved');
  const rejected = requests.filter((item) => item.status === 'rejected');

  return (
    <GlassCard style={styles.requestsCard}>
      <Text style={styles.sectionTitle}>Bekleyen Talepler</Text>
      {pending.map((request) => <RequestRow key={request.id} request={request} canEdit={canEdit} onApprove={onApprove} onReject={onReject} />)}
      {!pending.length ? <Text style={styles.empty}>Bekleyen talep yok.</Text> : null}
      <View style={styles.requestSummary}>
        <SummaryPill label="Onaylanan Dersler" value={approved.length} tone={colors.success} />
        <SummaryPill label="Reddedilen Talepler" value={rejected.length} tone={colors.danger} />
      </View>
    </GlassCard>
  );
}

function RequestRow({ request, canEdit, onApprove, onReject }: { request: ReturnType<typeof getLessonRequests>[number]; canEdit: boolean; onApprove: (id: string) => void; onReject: (id: string) => void }) {
  return (
    <View style={styles.requestRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.requestTitle}>{request.athleteName}</Text>
        <Text style={styles.requestMeta}>{request.date} • {request.time} • {request.requesterName}</Text>
      </View>
      {canEdit ? (
        <View style={styles.requestActions}>
          <Pressable style={styles.approveButton} onPress={() => onApprove(request.id)}><Check color={colors.background} size={14} /><Text style={styles.approveText}>Onayla</Text></Pressable>
          <Pressable style={styles.rejectButton} onPress={() => onReject(request.id)}><X color={colors.danger} size={14} /><Text style={styles.rejectText}>Reddet</Text></Pressable>
        </View>
      ) : <Text style={styles.pendingText}>Beklemede</Text>}
    </View>
  );
}

function EditSlotModal({ slot, onClose, onSetStatus }: { slot: PrivateLessonSlot | null; onClose: () => void; onSetStatus: (status: PrivateLessonStatus, note?: string) => void }) {
  const options: Array<{ label: string; status: PrivateLessonStatus; note?: string }> = [
    { label: 'Müsait yap', status: 'available', note: 'Müsait Özel ders saati' },
    { label: 'Kapalı yap', status: 'closed', note: 'Uygun değil' },
    { label: 'Özel ders olarak işaretle', status: 'private_lesson', note: 'Özel ders' },
    { label: 'Antrenman olarak işaretle', status: 'training', note: 'Kulüp antrenmanı' },
    { label: 'Yarış olarak işaretle', status: 'race', note: 'Yarış günü' },
    { label: 'Bu saati sadece bugün kapat', status: 'closed', note: 'Bugün kapalı' },
    { label: 'Her hafta bu gün/saat kapat', status: 'closed', note: 'Haftalık tekrar mock kapalı' },
    { label: 'Tüm hafta aynı saatleri kapat', status: 'closed', note: 'Tüm hafta mock kapalı' },
    { label: 'Not ekle', status: slot?.status ?? 'available', note: 'Antrenör notu eklendi' },
  ];

  return (
    <Modal visible={!!slot} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.modalTitle}>Saat Durumu</Text>
          <Text style={styles.modalMeta}>{slot ? `${slot.date} • ${slot.startTime} - ${slot.endTime}` : ''}</Text>
          {options.map((option) => (
            <Pressable key={option.label} style={styles.modalOption} onPress={() => onSetStatus(option.status, option.note)}>
              <View style={[styles.modalDot, { backgroundColor: statusColors[option.status] }]} />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function SummaryPill({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <View style={[styles.summaryPill, { borderColor: tone, backgroundColor: `${tone}22` }]}>
      <Text style={[styles.summaryValue, { color: tone }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function formatDisplayDate(date: string) {
  const parsed = parseDate(date);
  return `${String(parsed.getDate()).padStart(2, '0')}.${String(parsed.getMonth() + 1).padStart(2, '0')}.${parsed.getFullYear()}`;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20, marginTop: 4 },
  message: { color: colors.cyan, fontWeight: '900', backgroundColor: colors.cyanSoft, borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, padding: spacing.md },
  tabs: { flexDirection: 'row', gap: spacing.sm },
  tab: { flex: 1, minHeight: 42, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  calendarCard: { gap: spacing.md },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  monthTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  selectedDate: { color: colors.cyan, fontWeight: '900' },
  monthWrap: { gap: spacing.sm },
  weekdayRow: { flexDirection: 'row', gap: 5 },
  weekday: { flex: 1, color: colors.mutedStrong, fontWeight: '900', textAlign: 'center', fontSize: 12 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  dayCell: { width: '13.55%', minHeight: 78, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: 5, gap: 2 },
  dayCellEmpty: { opacity: 0.18 },
  dayCellSelected: { borderColor: colors.cyan, borderWidth: 2 },
  dayCellToday: { backgroundColor: colors.cyanSoft },
  dayNumber: { color: colors.text, fontWeight: '900', fontSize: 13 },
  dayMini: { color: colors.muted, fontWeight: '800', fontSize: 9 },
  dayDots: { flexDirection: 'row', gap: 3, marginTop: 2 },
  dayDot: { width: 5, height: 5, borderRadius: 999 },
  weekGridHeader: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  timeHeader: { width: 50 },
  weekDayHeader: { width: 88, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, alignItems: 'center', padding: 6 },
  weekDayText: { color: colors.text, fontWeight: '900' },
  weekDateText: { color: colors.muted, fontWeight: '800', fontSize: 11 },
  weekRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'stretch' },
  hourLabel: { width: 50, color: colors.mutedStrong, fontWeight: '900', fontSize: 12, paddingTop: 8 },
  weekSlot: { width: 88, minHeight: 48, borderRadius: 12, borderWidth: 1, padding: 5 },
  weekSlotText: { color: colors.text, fontWeight: '800', fontSize: 10, marginTop: 3 },
  dailyList: { gap: spacing.sm },
  dailySlot: { minHeight: 92, borderRadius: 16, borderWidth: 1, padding: spacing.md, gap: 5 },
  disabledSlot: { opacity: 0.72 },
  slotTop: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  slotStatus: { fontWeight: '900', fontSize: 12 },
  slotTime: { color: colors.text, fontWeight: '900' },
  slotNote: { color: colors.mutedStrong, fontWeight: '800' },
  slotMeta: { color: colors.muted, fontWeight: '800' },
  requestHint: { color: colors.cyan, fontWeight: '900', marginTop: 4 },
  requestsCard: { gap: spacing.md },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  requestRow: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.md, gap: spacing.sm },
  requestTitle: { color: colors.text, fontWeight: '900' },
  requestMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 3 },
  requestActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  approveButton: { borderRadius: 999, backgroundColor: colors.cyan, paddingHorizontal: spacing.sm, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  approveText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  rejectButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.danger, paddingHorizontal: spacing.sm, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  rejectText: { color: colors.danger, fontWeight: '900', fontSize: 12 },
  pendingText: { color: colors.gold, fontWeight: '900' },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center' },
  requestSummary: { flexDirection: 'row', gap: spacing.sm },
  summaryPill: { flex: 1, borderRadius: 16, borderWidth: 1, padding: spacing.sm },
  summaryValue: { fontWeight: '900', fontSize: 18 },
  summaryLabel: { color: colors.mutedStrong, fontWeight: '800', marginTop: 2, fontSize: 11 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(2, 10, 20, 0.72)', justifyContent: 'center', padding: spacing.lg },
  modalCard: { borderRadius: 24, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface, padding: spacing.lg, gap: spacing.sm },
  modalTitle: { ...typography.h2, color: colors.text },
  modalMeta: { color: colors.mutedStrong, fontWeight: '800', marginBottom: spacing.sm },
  modalOption: { minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  modalDot: { width: 9, height: 9, borderRadius: 999 },
  modalOptionText: { color: colors.text, fontWeight: '900' },
});
