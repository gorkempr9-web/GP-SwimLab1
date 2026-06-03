import { useLocalSearchParams } from 'expo-router';
import { CalendarDays, Check, Clock, Lock, Plus, Send, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import {
  blockCoachTime,
  CoachCalendarType,
  CoachCalendarVisibility,
  createCoachCalendarEvent,
  getCoachAvailability,
  getCoachCalendar,
  getLessonRequests,
  requestPrivateLesson,
  updateCoachAvailability,
} from '@/services/coachCalendar';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const eventTypes: CoachCalendarType[] = ['Kulüp Antrenmanı', 'Özel Ders', 'Yarış', 'Kamp', 'Toplantı', 'Uygun Değilim', 'Boş Saat'];
const visibilities: CoachCalendarVisibility[] = ['Sadece ben', 'Kulüp üyeleri', 'Herkes'];

export default function CoachCalendarScreen() {
  const params = useLocalSearchParams<{ coachId?: string }>();
  const { currentUser } = useSession();
  const coachId = params.coachId ?? 'coach-mert';
  const canManage = canManageClub(currentUser.role);
  const [events, setEvents] = useState(() => getCoachCalendar(coachId));
  const [availability, setAvailability] = useState(() => getCoachAvailability(coachId));
  const [message, setMessage] = useState('');
  const [type, setType] = useState<CoachCalendarType>('Özel Ders');
  const [visibility, setVisibility] = useState<CoachCalendarVisibility>('Kulüp üyeleri');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('15.06.2026');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('Ana Havuz');
  const [groupName, setGroupName] = useState('');
  const [note, setNote] = useState('');

  const requests = useMemo(() => getLessonRequests(coachId), [coachId, message]);
  const visibleEvents = events.filter((event) => canManage || event.visibility !== 'Sadece ben');

  const refresh = () => {
    setEvents(getCoachCalendar(coachId));
    setAvailability(getCoachAvailability(coachId));
  };

  const handleCreateEvent = () => {
    if (!title.trim() || !date.trim() || !startTime.trim() || !endTime.trim() || !location.trim()) {
      setMessage('Başlık, tarih, saat ve yer zorunludur.');
      return;
    }

    createCoachCalendarEvent({
      coachId,
      coachName: 'SwimLab Antrenör',
      type,
      title: title.trim(),
      date,
      startTime,
      endTime,
      location,
      visibility,
      groupName: groupName.trim() || undefined,
      note: note.trim() || undefined,
    });
    refresh();
    setMessage(type === 'Kulüp Antrenmanı' ? 'Etkinlik kaydedildi. Kulüp takvimi için hazır.' : 'Etkinlik kaydedildi.');
    setTitle('');
    setNote('');
  };

  const handleBlock = () => {
    blockCoachTime({
      coachId,
      coachName: 'SwimLab Antrenör',
      title: title.trim() || 'Uygun değil',
      date,
      startTime,
      endTime,
      location,
      visibility: 'Herkes',
      note: note.trim() || 'Saat kapatıldı',
    });
    refresh();
    setMessage('Saat kapatıldı.');
  };

  const handleToggleDay = (dayOfWeek: string) => {
    const current = availability.find((item) => item.dayOfWeek === dayOfWeek);
    if (!current) return;
    updateCoachAvailability({ ...current, isAvailable: !current.isAvailable });
    refresh();
    setMessage(`${dayOfWeek} uygunluk durumu güncellendi.`);
  };

  const handleRequest = (dayOfWeek: string, time: string) => {
    requestPrivateLesson({
      coachId,
      requesterId: currentUser.id,
      athleteId: currentUser.role === 'parent' ? currentUser.childAthleteId : currentUser.id,
      requestedDate: dayOfWeek,
      requestedTime: time,
    });
    setMessage('Talebiniz antrenöre gönderildi');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Antrenör Takvimi</Text>
        <Text style={styles.subtitle}>{canManage ? 'Takvim, uygunluk ve saat kapatma yönetimi.' : 'Uygun saatleri görüntüleyip özel ders talebi gönderebilirsin.'}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canManage ? (
          <GlassCard style={styles.form}>
            <Text style={styles.cardTitle}>Takvim Etkinliği</Text>
            <ChoiceGroup options={eventTypes} value={type} onChange={(value) => setType(value as CoachCalendarType)} />
            <TextInput placeholder="Başlık" placeholderTextColor={colors.muted} value={title} onChangeText={setTitle} style={styles.input} />
            <TextInput placeholder="Tarih" placeholderTextColor={colors.muted} value={date} onChangeText={setDate} style={styles.input} />
            <View style={styles.timeRow}>
              <TextInput placeholder="Başlangıç" placeholderTextColor={colors.muted} value={startTime} onChangeText={setStartTime} style={[styles.input, styles.timeInput]} />
              <TextInput placeholder="Bitiş" placeholderTextColor={colors.muted} value={endTime} onChangeText={setEndTime} style={[styles.input, styles.timeInput]} />
            </View>
            <TextInput placeholder="Yer / Havuz" placeholderTextColor={colors.muted} value={location} onChangeText={setLocation} style={styles.input} />
            <TextInput placeholder="Grup / Sporcu" placeholderTextColor={colors.muted} value={groupName} onChangeText={setGroupName} style={styles.input} />
            <TextInput placeholder="Açıklama" placeholderTextColor={colors.muted} value={note} onChangeText={setNote} style={[styles.input, styles.textArea]} multiline={true} />
            <ChoiceGroup options={visibilities} value={visibility} onChange={(value) => setVisibility(value as CoachCalendarVisibility)} />
            <View style={styles.actionRow}>
              <Pressable style={styles.primaryButton} onPress={handleCreateEvent}>
                <Plus color={colors.background} size={16} />
                <Text style={styles.primaryText}>Kaydet</Text>
              </Pressable>
              <Pressable style={styles.blockButton} onPress={handleBlock}>
                <Lock color={colors.danger} size={16} />
                <Text style={styles.blockText}>Saat kapat</Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : null}

        <Text style={styles.sectionTitle}>Haftalık uygunluk</Text>
        {availability.map((item) => (
          <GlassCard key={item.dayOfWeek} style={styles.availabilityCard}>
            <View style={styles.availabilityTop}>
              <View>
                <Text style={styles.dayTitle}>{item.dayOfWeek}</Text>
                <Text style={styles.dayMeta}>{item.isAvailable ? `${item.startTime} - ${item.endTime}  •  ${item.location}` : 'Kapalı'}</Text>
              </View>
              <Text style={[styles.slotStatus, item.isAvailable ? styles.available : styles.closed]}>{item.isAvailable ? 'Uygun' : 'Uygun değil'}</Text>
            </View>
            {canManage ? (
              <Pressable style={styles.secondaryButton} onPress={() => handleToggleDay(item.dayOfWeek)}>
                {item.isAvailable ? <X color={colors.text} size={15} /> : <Check color={colors.text} size={15} />}
                <Text style={styles.secondaryText}>{item.isAvailable ? 'Kapalı yap' : 'Uygun yap'}</Text>
              </Pressable>
            ) : item.isAvailable ? (
              <Pressable style={styles.requestButton} onPress={() => handleRequest(item.dayOfWeek, `${item.startTime} - ${item.endTime}`)}>
                <Send color={colors.background} size={15} />
                <Text style={styles.requestText}>Özel ders talebi gönder</Text>
              </Pressable>
            ) : null}
          </GlassCard>
        ))}

        <Text style={styles.sectionTitle}>Takvim</Text>
        {visibleEvents.map((event) => (
          <GlassCard key={event.id} style={[styles.eventCard, event.status === 'blocked' && styles.blockedCard]}>
            <View style={styles.eventTop}>
              <CalendarDays color={event.status === 'blocked' ? colors.danger : colors.cyan} size={21} />
              <Text style={styles.eventType}>{event.type}</Text>
              <Text style={[styles.eventStatus, event.status === 'blocked' && styles.eventStatusBlocked]}>{event.status === 'blocked' ? 'Dolu' : 'Aktif'}</Text>
            </View>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <View style={styles.eventLine}>
              <Clock color={colors.cyan} size={15} />
              <Text style={styles.eventMeta}>{event.date}  •  {event.startTime} - {event.endTime}</Text>
            </View>
            <Text style={styles.eventMeta}>{event.location}  •  {event.groupName ?? event.visibility}</Text>
            {event.note ? <Text style={styles.note}>{event.note}</Text> : null}
          </GlassCard>
        ))}

        {canManage && requests.length ? (
          <>
            <Text style={styles.sectionTitle}>Gelen talepler</Text>
            {requests.map((request) => (
              <Text key={request.id} style={styles.requestRow}>{request.requestedDate}  •  {request.requestedTime}  •  {request.status}</Text>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChoiceGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable key={option} style={[styles.chip, active && styles.chipActive]} onPress={() => onChange(option)}>
            {active ? <Check color={colors.background} size={13} /> : null}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  form: { gap: spacing.md },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  input: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 78, paddingTop: spacing.md, textAlignVertical: 'top' },
  timeRow: { flexDirection: 'row', gap: spacing.sm },
  timeInput: { flex: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
  actionRow: { flexDirection: 'row', gap: spacing.sm },
  primaryButton: { flex: 1, minHeight: 44, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  primaryText: { color: colors.background, fontWeight: '900' },
  blockButton: { flex: 1, minHeight: 44, borderRadius: 15, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', backgroundColor: colors.dangerSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  blockText: { color: colors.danger, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20, marginTop: spacing.sm },
  availabilityCard: { gap: spacing.md },
  availabilityTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  dayTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  dayMeta: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  slotStatus: { fontWeight: '900', borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, overflow: 'hidden' },
  available: { color: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.12)' },
  closed: { color: colors.danger, backgroundColor: colors.dangerSoft },
  secondaryButton: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.md, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 },
  secondaryText: { color: colors.text, fontWeight: '900' },
  requestButton: { minHeight: 42, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  requestText: { color: colors.background, fontWeight: '900' },
  eventCard: { gap: spacing.sm },
  blockedCard: { borderColor: 'rgba(251, 113, 133, 0.42)' },
  eventTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventType: { color: colors.cyan, fontWeight: '900', flex: 1 },
  eventStatus: { color: colors.success, fontWeight: '900' },
  eventStatusBlocked: { color: colors.danger },
  eventLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  eventMeta: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20 },
  note: { color: colors.muted, fontWeight: '700', lineHeight: 20 },
  requestRow: { color: colors.mutedStrong, fontWeight: '800', backgroundColor: colors.glass, borderRadius: 14, padding: spacing.md },
});
