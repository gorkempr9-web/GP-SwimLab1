import { CalendarDays, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Plus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { ClubGroup, ClubPriority } from '@/services/clubBoard';
import { CalendarEventType, ClubCalendarEvent, createCalendarEvent, eventAccentColors, mockCalendarEvents, planEventReminder, weekDays } from '@/services/clubCalendar';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

type Visibility = 'Sporcular' | 'Veliler' | 'Sporcular + Veliler' | 'Sadece Antrenörler';
type SheetState = { title: string; options: string[]; selected: string; onSelect: (value: string) => void } | null;

type ViewMode = 'Haftalık' | 'Aylık';

const eventTypes: CalendarEventType[] = ['Antrenman', 'Yarış', 'Kamp', 'Ölçüm Günü', 'Veli Toplantısı', 'Dinlenme Günü'];
const groups: ClubGroup[] = ['Tüm Kulüp', 'Performans Grubu', 'Küçük Yaş Grubu', 'Masters', 'Belirli Sporcular', 'Veliler', 'Antrenörler'];
const priorities: ClubPriority[] = ['Normal', 'Önemli', 'Acil'];
const visibilities: Visibility[] = ['Sporcular', 'Veliler', 'Sporcular + Veliler', 'Sadece Antrenörler'];
const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const weekDaysShort = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export default function CalendarScreen() {
  const { currentUser } = useSession();
  const canEdit = canManageClub(currentUser.role);
  const [events, setEvents] = useState(mockCalendarEvents);
  const [message, setMessage] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('Aylık');
  const [visibleMonth, setVisibleMonth] = useState(new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState('20.05.2026');
  const [type, setType] = useState<CalendarEventType>('Antrenman');
  const [date, setDate] = useState('21.05.2026');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('19:00');
  const [location, setLocation] = useState('');
  const [group, setGroup] = useState<ClubGroup>('Performans Grubu');
  const [priority, setPriority] = useState<ClubPriority>('Normal');
  const [visibility, setVisibility] = useState<Visibility>('Sporcular + Veliler');
  const [description, setDescription] = useState('');
  const [remindBefore, setRemindBefore] = useState(true);
  const [openStep, setOpenStep] = useState(1);
  const [sheet, setSheet] = useState<SheetState>(null);

  const eventsByDay = useMemo(() => weekDays.map((day) => ({ day, events: events.filter((event) => event.day === day) })), [events]);
  const selectedEvents = useMemo(() => events.filter((event) => event.date === selectedDate), [events, selectedDate]);
  const monthDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  const handleCreate = async () => {
    if (!canEdit) {
      setMessage('Etkinlik eklemek için antrenör veya kulüp yöneticisi hesabı gerekir.');
      return;
    }

    const newEvent = await createCalendarEvent({
      title: type,
      type,
      date,
      day: dayFromDate(date),
      startTime,
      endTime,
      location: location.trim() || 'Ana Havuz',
      group,
      description: description.trim() || 'Etkinlik açıklaması',
      priority,
      coach: currentUser.role === 'club_admin' ? 'Kulüp Yönetimi' : 'G?rkem Pınar',
    });

    setEvents((current) => [newEvent, ...current]);
    setSelectedDate(date);
    if (remindBefore) {
      const { scheduleTrainingReminder } = await import('@/services/notifications');
      await scheduleTrainingReminder({ title: 'Takvim hatırlatması', body: `${type} 1 saat sonra başlıyor.`, seconds: 2 });
    }
    setMessage(remindBefore ? 'Etkinlik oluşturuldu. 1 saat önce hatırlatma planlandı.' : 'Etkinlik oluşturuldu.');
    setDescription('');
    setLocation('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Takvim</Text>
        <Text style={styles.subtitle}>Antrenman saatleri, yarış tarihleri, kamp, ölçüm günü, veli toplantısı ve dinlenme günü.</Text>

        <View style={styles.viewSwitch}>
          {(['Aylık', 'Haftalık'] as const).map((mode) => (
            <Pressable key={mode} style={[styles.switchButton, viewMode === mode && styles.switchButtonActive]} onPress={() => setViewMode(mode)}>
              <Text style={[styles.switchText, viewMode === mode && styles.switchTextActive]}>{mode} görünüm</Text>
            </Pressable>
          ))}
        </View>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canEdit ? (
          <GlassCard style={styles.card}>
            <Text style={styles.cardTitle}>Etkinlik ekle</Text>
            <StepHeader step={1} title="Etkinlik tipi seç" value={type} active={openStep === 1} onPress={() => setOpenStep(openStep === 1 ? 0 : 1)} />
            {openStep === 1 ? <CompactChipGroup options={eventTypes} value={type} onChange={(value) => { setType(value as CalendarEventType); setOpenStep(2); }} /> : null}
            <StepHeader step={2} title="Tarih / Saat / Yer" value={`${date} • ${startTime}`} active={openStep === 2} onPress={() => setOpenStep(openStep === 2 ? 0 : 2)} />
            {openStep === 2 ? (
              <View style={styles.stepBody}>
                <DatePickerField value={date} onChange={setDate} />
                <View style={styles.timeRow}>
                  <TimePickerField label="Başlangıç" value={startTime} onChange={setStartTime} />
                  <TimePickerField label="Bitiş" value={endTime} onChange={setEndTime} />
                </View>
                <TextInput value={location} onChangeText={setLocation} placeholder="Yer" placeholderTextColor={colors.muted} style={styles.input} />
              </View>
            ) : null}
            <StepHeader step={3} title="Grup / Öncelik" value={`${group} • ${priority}`} active={openStep === 3} onPress={() => setOpenStep(openStep === 3 ? 0 : 3)} />
            {openStep === 3 ? (
              <View style={styles.stepBody}>
                <DropdownField label="Grup" value={group} onPress={() => setSheet({ title: 'Grup seç', options: groups, selected: group, onSelect: (value) => setGroup(value as ClubGroup) })} />
                <DropdownField label="Öncelik" value={priority} onPress={() => setSheet({ title: 'Öncelik seç', options: priorities, selected: priority, onSelect: (value) => setPriority(value as ClubPriority) })} />
                <DropdownField label="Görünürlük" value={visibility} onPress={() => setSheet({ title: 'Görünürlük seç', options: visibilities, selected: visibility, onSelect: (value) => setVisibility(value as Visibility) })} />
                <View style={styles.reminderToggle}>
                  <View>
                    <Text style={styles.reminderToggleTitle}>1 saat Önce hatırlat</Text>
                    <Text style={styles.reminderToggleText}>İsteğe bağlı local bildirim</Text>
                  </View>
                  <Switch
                    value={remindBefore}
                    onValueChange={setRemindBefore}
                    trackColor={{ false: colors.surfaceSoft, true: colors.cyanSoft }}
                    thumbColor={remindBefore ? colors.cyan : colors.muted}
                  />
                </View>
              </View>
            ) : null}
            <StepHeader step={4} title="Açıklama" value={description ? 'Hazır' : 'Kısa not'} active={openStep === 4} onPress={() => setOpenStep(openStep === 4 ? 0 : 4)} />
            {openStep === 4 ? <TextInput value={description} onChangeText={setDescription} placeholder="Açıklama" placeholderTextColor={colors.muted} style={[styles.input, styles.descriptionInput]} multiline={true} /> : null}
            {false ? <>
            <Text style={styles.label}>Etkinlik tipi</Text>
            <ChipGroup options={eventTypes} value={type} onChange={(value) => setType(value as CalendarEventType)} />
            <DatePickerField value={date} onChange={setDate} />
            <View style={styles.timeRow}>
              <TimePickerField label="Başlangıç saati" value={startTime} onChange={setStartTime} />
              <TimePickerField label="Bitiş saati" value={endTime} onChange={setEndTime} />
            </View>
            <TextInput value={location} onChangeText={setLocation} placeholder="Yer" placeholderTextColor={colors.muted} style={styles.input} />
            <Text style={styles.label}>Grup</Text>
            <ChipGroup options={groups} value={group} onChange={(value) => setGroup(value as ClubGroup)} />
            <TextInput value={description} onChangeText={setDescription} placeholder="Açıklama" placeholderTextColor={colors.muted} style={[styles.input, styles.descriptionInput]} multiline={true} />
            </> : null}
            <AppButton title="Etkinlik Oluştur" icon={Plus} onPress={handleCreate} />
          </GlassCard>
        ) : (
          <Text style={styles.readonly}>Sporcu ve veli hesapları takvimi görüntüleyebilir; etkinlik ekleme antrenör/kulüp hesabı gerektirir.</Text>
        )}

        {viewMode === 'Aylık' ? (
          <>
            <GlassCard style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <Pressable style={styles.arrowButton} onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
                  <ChevronLeft color={colors.text} size={20} />
                </Pressable>
                <Text style={styles.monthTitle}>{monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}</Text>
                <Pressable style={styles.arrowButton} onPress={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
                  <ChevronRight color={colors.text} size={20} />
                </Pressable>
              </View>
              <View style={styles.weekRow}>
                {weekDaysShort.map((day) => <Text key={day} style={styles.weekDay}>{day}</Text>)}
              </View>
              <View style={styles.dayGrid}>
                {monthDays.map((day, index) => {
                  const formatted = formatDate(day.date);
                  const dayEvents = events.filter((event) => event.date === formatted);
                  const selected = selectedDate === formatted;
                  return (
                    <Pressable key={`${formatted}-${index}`} style={[styles.dayCell, !day.inMonth && styles.dayMuted, selected && styles.daySelected]} onPress={() => setSelectedDate(formatted)}>
                      <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day.date.getDate()}</Text>
                      <View style={styles.dotRow}>
                        {dayEvents.slice(0, 3).map((event) => <View key={event.id} style={[styles.eventDot, { backgroundColor: eventAccentColors[event.type] }]} />)}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </GlassCard>

            <Text style={styles.sectionTitle}>{selectedDate} etkinlikleri</Text>
            {selectedEvents.length ? selectedEvents.map((event) => <EventCard key={event.id} event={event} onReminder={async () => setMessage(await planEventReminder())} />) : <Text style={styles.emptyDay}>Seçilen günde etkinlik yok.</Text>}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Haftalık görünüm</Text>
            {eventsByDay.map(({ day, events: dayEvents }) => (
              <GlassCard key={day} style={styles.dayCard}>
                <Text style={styles.dayTitle}>{day}</Text>
                {dayEvents.length ? dayEvents.map((event) => <EventCard key={event.id} event={event} onReminder={async () => setMessage(await planEventReminder())} />) : <Text style={styles.emptyDay}>Planlı etkinlik yok.</Text>}
              </GlassCard>
            ))}
          </>
        )}
      </ScrollView>
      <DropdownSheet sheet={sheet} onClose={() => setSheet(null)} />
    </SafeAreaView>
  );
}

function EventCard({ event, onReminder }: { event: ClubCalendarEvent; onReminder: () => void }) {
  const accent = event.priority === 'Acil' ? eventAccentColors.Acil : eventAccentColors[event.type];
  return (
    <View style={[styles.eventCard, { borderLeftColor: accent }]}>
      <View style={styles.eventHeader}>
        <Text style={[styles.eventType, { color: accent }]}>{event.type}</Text>
        <Text style={styles.eventDate}>{event.date}</Text>
      </View>
      <Text style={styles.eventTitle}>{event.title}</Text>
      <View style={styles.eventLine}>
        <Clock color={colors.cyan} size={16} />
        <Text style={styles.eventMeta}>{event.startTime} - {event.endTime}</Text>
      </View>
      <View style={styles.eventLine}>
        <MapPin color={colors.cyan} size={16} />
        <Text style={styles.eventMeta}>{event.location} • {event.group}</Text>
      </View>
      <Text style={styles.eventDescription}>{event.description}</Text>
      <Pressable style={styles.reminderButton} onPress={onReminder}>
        <CheckCircle2 color={colors.cyan} size={16} />
        <Text style={styles.reminderText}>1 saat Önce hatırlat</Text>
      </Pressable>
    </View>
  );
}

function StepHeader({ step, title, value, active, onPress }: { step: number; title: string; value: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.stepHeader, active && styles.stepHeaderActive]} onPress={onPress}>
      <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{step}</Text></View>
      <View style={styles.stepCopy}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepValue} numberOfLines={1}>{value}</Text>
      </View>
      <ChevronDown color={colors.cyan} size={18} />
    </Pressable>
  );
}

function DropdownField({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.dropdownField, pressed && styles.pressed]} onPress={onPress}>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.dropdownValue}>{value}</Text>
      </View>
      <ChevronDown color={colors.cyan} size={18} />
    </Pressable>
  );
}

function DropdownSheet({ sheet, onClose }: { sheet: SheetState; onClose: () => void }) {
  if (!sheet) return null;
  return (
    <Modal visible={true} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{sheet.title}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.text} size={18} />
            </Pressable>
          </View>
          <View style={styles.optionGrid}>
            {sheet.options.map((option) => {
              const active = option === sheet.selected;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [styles.dropdownOption, active && styles.dropdownOptionActive, pressed && styles.pressed]}
                  onPress={() => {
                    sheet.onSelect(option);
                    onClose();
                  }}
                >
                  {active ? <Check color={colors.text} size={15} /> : null}
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function CompactChipGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable key={option} style={({ pressed }) => [styles.compactChip, active && styles.compactChipActive, pressed && styles.pressed]} onPress={() => onChange(option)}>
            {active ? <Check color={colors.text} size={14} /> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DatePickerField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  const days = Array.from({ length: 14 }, (_, index) => addDays(new Date(2026, 4, 20), index));
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>Tarih</Text>
      <Pressable style={styles.pickerButton} onPress={() => setVisible(true)}>
        <CalendarDays color={colors.cyan} size={18} />
        <Text style={styles.pickerText}>{value}</Text>
      </Pressable>
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Tarih seç</Text>
            <View style={styles.optionGrid}>
              {days.map((day) => {
                const formatted = formatDate(day);
                const active = formatted === value;
                return (
                  <Pressable key={formatted} style={[styles.optionChip, active && styles.optionChipActive]} onPress={() => { onChange(formatted); setVisible(false); }}>
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{formatted}</Text>
                    <Text style={[styles.optionSubText, active && styles.optionTextActive]}>{dayFromDate(formatted)}</Text>
                  </Pressable>
                );
              })}
            </View>
            {false ? <AppButton title="Seç" onPress={() => setVisible(false)} /> : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function TimePickerField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [hour, setHour] = useState(value.split(':')[0] || '17');
  const [minute, setMinute] = useState(value.split(':')[1] || '30');
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setVisible(true)}>
        <Clock color={colors.cyan} size={18} />
        <Text style={styles.pickerText}>{value}</Text>
      </Pressable>
      <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <Text style={styles.timePreview}>{hour}:{minute}</Text>
            <Text style={styles.label}>Saat</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
              {hours.map((item) => <TimeChip key={item} label={item} active={hour === item} onPress={() => setHour(item)} />)}
            </ScrollView>
            <Text style={styles.label}>Dakika</Text>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalOptions}>
              {minutes.map((item) => <TimeChip key={item} label={item} active={minute === item} onPress={() => setMinute(item)} />)}
            </ScrollView>
            <AppButton title="Seç" onPress={() => { onChange(`${hour}:${minute}`); setVisible(false); }} />
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

function ChipGroup({ options, value, onChange }: { options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => (
        <Pressable key={option} style={[styles.chip, value === option && styles.chipActive]} onPress={() => onChange(option)}>
          <Text style={[styles.chipText, value === option && styles.chipTextActive]}>{option}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function dayFromDate(value: string) {
  const [day, month, year] = value.split('.').map(Number);
  const date = new Date(year, month - 1, day);
  return weekDays[(date.getDay() + 6) % 7];
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
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22 },
  viewSwitch: { flexDirection: 'row', gap: spacing.sm },
  switchButton: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  switchButtonActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  switchText: { color: colors.muted, fontWeight: '900' },
  switchTextActive: { color: colors.text },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  readonly: { color: colors.gold, fontWeight: '800', lineHeight: 21 },
  card: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  stepHeader: { minHeight: 58, borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepHeaderActive: { borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft },
  stepNumber: { width: 30, height: 30, borderRadius: 11, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  stepCopy: { flex: 1 },
  stepTitle: { color: colors.text, fontWeight: '900' },
  stepValue: { color: colors.mutedStrong, fontWeight: '800', fontSize: 12, marginTop: 2 },
  stepBody: { gap: spacing.sm },
  dropdownField: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dropdownValue: { color: colors.text, fontWeight: '900', marginTop: 3 },
  reminderToggle: { minHeight: 58, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  reminderToggleTitle: { color: colors.text, fontWeight: '900' },
  reminderToggleText: { color: colors.muted, fontWeight: '700', marginTop: 3 },
  compactChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass, flexDirection: 'row', alignItems: 'center', gap: 6 },
  compactChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  pressed: { transform: [{ scale: 0.98 }] },
  label: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  input: { color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, borderWidth: 1, borderColor: colors.border, minHeight: 46, paddingHorizontal: spacing.md, fontWeight: '800' },
  descriptionInput: { minHeight: 88, paddingTop: spacing.md, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 8, backgroundColor: colors.glass },
  chipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  chipText: { color: colors.muted, fontWeight: '900' },
  chipTextActive: { color: colors.text },
  timeRow: { flexDirection: 'row', gap: spacing.sm },
  fieldWrap: { flex: 1, gap: 6 },
  pickerButton: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pickerText: { color: colors.text, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  monthCard: { gap: spacing.md },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrowButton: { width: 38, height: 38, borderRadius: 14, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center' },
  monthTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  weekRow: { flexDirection: 'row' },
  weekDay: { width: `${100 / 7}%`, color: colors.muted, textAlign: 'center', fontWeight: '900', fontSize: 12 },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  dayMuted: { opacity: 0.34 },
  daySelected: { backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.cyan },
  dayText: { color: colors.text, fontWeight: '900' },
  dayTextSelected: { color: colors.cyan },
  dotRow: { height: 8, flexDirection: 'row', gap: 2, marginTop: 2 },
  eventDot: { width: 5, height: 5, borderRadius: 999 },
  dayCard: { gap: spacing.md },
  dayTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  emptyDay: { color: colors.muted, fontWeight: '800' },
  eventCard: { borderLeftWidth: 4, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.sm },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  eventType: { fontWeight: '900' },
  eventDate: { color: colors.mutedStrong, fontWeight: '900' },
  eventTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  eventLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventMeta: { color: colors.mutedStrong, fontWeight: '800', flex: 1 },
  eventDescription: { color: colors.muted, lineHeight: 20, fontWeight: '700' },
  reminderButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 8 },
  reminderText: { color: colors.text, fontWeight: '900' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { maxHeight: '78%', borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.background, padding: spacing.lg, gap: spacing.md },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  closeButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceSoft, alignItems: 'center', justifyContent: 'center' },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionChip: { width: '31%', borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surfaceSolid, padding: spacing.sm, gap: 4 },
  optionChipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.cyan },
  optionText: { color: colors.text, fontWeight: '900', textAlign: 'center' },
  optionSubText: { color: colors.muted, fontWeight: '800', textAlign: 'center', fontSize: 11 },
  optionTextActive: { color: colors.cyan },
  dropdownOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.md, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dropdownOptionActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  horizontalOptions: { gap: spacing.sm, paddingVertical: 4 },
  timePreview: { color: colors.cyan, fontWeight: '900', fontSize: 30, textAlign: 'center' },
  timeChip: { width: 48, height: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.glass },
  timeChipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  timeChipText: { color: colors.text, fontWeight: '900' },
  timeChipTextActive: { color: colors.background },
});
