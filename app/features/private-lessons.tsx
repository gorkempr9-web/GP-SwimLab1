import { router } from 'expo-router';
import { CalendarDays, Check, CheckCircle2, Edit3, Plus, Send, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClubLogo } from '@/components/ClubLogo';
import { GlassCard } from '@/components/GlassCard';
import { createLessonAd, deleteLessonAd, getLessonAds, LessonAd, LessonAdVisibility, requestLessonContact, toggleLessonAdStatus } from '@/services/lessonAds';
import { canManageClub, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const branches = ['Serbest', 'Sırtüstü', 'Kurbağalama', 'Kelebek', 'Karışık', 'Start/Dönüş', 'Teknik Gelişim', 'Yarış Hazırlık'];
const levels = ['Başlangıç', 'Orta', 'Performans', 'Yarış Grubu'];
const ageGroups = ['7-9', '10-12', '13-14', '15+', 'Masters'];
const visibilities: LessonAdVisibility[] = ['Tüm kullanıcılar', 'Sadece kulüp üyeleri', 'Sadece veliler'];

type FormState = {
  title: string;
  branch: string;
  level: string;
  ageGroup: string;
  schedule: string;
  location: string;
  description: string;
  capacity: string;
  priceInfo: string;
  visibility: LessonAdVisibility;
};

const initialForm: FormState = {
  title: '',
  branch: 'Serbest',
  level: 'Orta',
  ageGroup: '10-12',
  schedule: '',
  location: '',
  description: '',
  capacity: '',
  priceInfo: '',
  visibility: 'Tüm kullanıcılar',
};

export default function PrivateLessonsScreen() {
  const { currentUser } = useSession();
  const canCreate = currentUser.role === 'coach';
  const canModerate = currentUser.role === 'club_admin';
  const [ads, setAds] = useState(() => getLessonAds());
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<FormState>(initialForm);

  const visibleAds = useMemo(
    () => ads.filter((ad) => {
      if (canModerate) return ad.clubName === (currentUser.club ?? 'GP Aquatics');
      if (currentUser.role === 'parent') return ad.status === 'active' && (ad.visibility === 'Tüm kullanıcılar' || ad.visibility === 'Sadece veliler' || ad.visibility === 'Sadece kulüp üyeleri');
      if (currentUser.role === 'athlete') return ad.status === 'active' && ad.visibility !== 'Sadece veliler';
      return ad.coachId === currentUser.id || ad.clubName === (currentUser.club ?? 'GP Aquatics');
    }),
    [ads, canModerate, currentUser.club, currentUser.id, currentUser.role],
  );

  const refresh = () => setAds(getLessonAds());

  const updateForm = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePublish = () => {
    if (!form.title.trim() || !form.schedule.trim() || !form.location.trim() || !form.description.trim() || !form.capacity.trim()) {
      setMessage('Zorunlu alanları doldurun: başlık, gün/saat, lokasyon, açıklama ve kontenjan.');
      return;
    }

    createLessonAd({
      title: form.title.trim(),
      coachId: currentUser.id,
      coachName: `${currentUser.firstName} ${currentUser.lastName}`,
      clubId: 'gp-aquatics',
      clubName: currentUser.club ?? 'GP Aquatics',
      branch: form.branch,
      level: form.level,
      ageGroup: form.ageGroup,
      schedule: form.schedule.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      capacity: form.capacity.trim(),
      priceInfo: form.priceInfo.trim() || undefined,
      visibility: form.visibility,
      status: 'active',
    });
    refresh();
    setForm(initialForm);
    setFormOpen(false);
    setMessage(form.visibility === 'Sadece kulüp üyeleri' ? 'İlan panosunda yayınlandı. Kulüp panosuna da özel ders ilanı olarak düştü.' : 'İlan panosunda yayınlandı');
  };

  const handleToggle = (id: string) => {
    const updated = toggleLessonAdStatus(id);
    refresh();
    setMessage(updated?.status === 'active' ? 'İlan aktif yapıldı.' : 'İlan pasif yapıldı.');
  };

  const handleDelete = (id: string) => {
    deleteLessonAd(id);
    refresh();
    setMessage('İlan mock olarak silindi.');
  };

  const handleContact = (id: string) => {
    requestLessonContact(id, currentUser.id);
    setMessage(currentUser.role === 'parent' ? 'Çocuğunuz için iletişim talebi gönderildi.' : 'İletişim talebi gönderildi.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Özel Ders İlanları</Text>
        <Text style={styles.subtitle}>İlan Panosu üzerinden yayınlanan özel dersler görüntülenir; telefon/mail direkt paylaşılmaz.</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {canCreate ? (
          <Pressable style={styles.createButton} onPress={() => setFormOpen((value) => !value)}>
            <Plus color={colors.background} size={18} />
            <Text style={styles.createButtonText}>Özel Ders İlanı Oluştur</Text>
          </Pressable>
        ) : null}

        {formOpen ? (
          <GlassCard style={styles.form}>
            <Text style={styles.cardTitle}>Özel Ders İlanı Oluştur</Text>
            <TextInput placeholder="İlan başlığı" placeholderTextColor={colors.muted} value={form.title} onChangeText={(value) => updateForm('title', value)} style={styles.input} />
            <ChoiceGroup label="Branş" options={branches} value={form.branch} onChange={(value) => updateForm('branch', value)} />
            <ChoiceGroup label="Seviye" options={levels} value={form.level} onChange={(value) => updateForm('level', value)} />
            <ChoiceGroup label="Yaş grubu" options={ageGroups} value={form.ageGroup} onChange={(value) => updateForm('ageGroup', value)} />
            <TextInput placeholder="Gün/saat" placeholderTextColor={colors.muted} value={form.schedule} onChangeText={(value) => updateForm('schedule', value)} style={styles.input} />
            <TextInput placeholder="Lokasyon / Havuz" placeholderTextColor={colors.muted} value={form.location} onChangeText={(value) => updateForm('location', value)} style={styles.input} />
            <TextInput placeholder="Açıklama" placeholderTextColor={colors.muted} value={form.description} onChangeText={(value) => updateForm('description', value)} style={[styles.input, styles.textArea]} multiline={true} />
            <TextInput placeholder="Kontenjan" placeholderTextColor={colors.muted} value={form.capacity} onChangeText={(value) => updateForm('capacity', value)} style={styles.input} />
            <TextInput placeholder="Ücret bilgisi (opsiyonel)" placeholderTextColor={colors.muted} value={form.priceInfo} onChangeText={(value) => updateForm('priceInfo', value)} style={styles.input} />
            <ChoiceGroup label="Görünürlük" options={visibilities} value={form.visibility} onChange={(value) => updateForm('visibility', value)} />
            <Pressable style={styles.publishButton} onPress={handlePublish}>
              <Check color={colors.background} size={17} />
              <Text style={styles.publishButtonText}>İlanı Gönder</Text>
            </Pressable>
          </GlassCard>
        ) : null}

        <Text style={styles.sectionTitle}>İlan Panosu</Text>
        {visibleAds.map((ad) => (
          <LessonAdCard
            key={ad.id}
            ad={ad}
            canManage={canModerate || ad.coachId === currentUser.id}
            canRequest={currentUser.role === 'athlete' || currentUser.role === 'parent'}
            onContact={() => handleContact(ad.id)}
            onAvailability={() => router.push({ pathname: '/features/coach-calendar', params: { coachId: ad.coachId } })}
            onToggle={() => handleToggle(ad.id)}
            onDelete={() => handleDelete(ad.id)}
          />
        ))}
        {!visibleAds.length ? <Text style={styles.empty}>İlan panosunda görünür ilan yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function LessonAdCard({ ad, canManage, canRequest, onContact, onAvailability, onToggle, onDelete }: { ad: LessonAd; canManage: boolean; canRequest: boolean; onContact: () => void; onAvailability: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <GlassCard style={styles.card}>
      <View style={styles.cardHeader}>
        <ClubLogo club={ad.clubName} size={38} />
        <Text style={[styles.status, ad.status === 'active' ? styles.statusActive : styles.statusPassive]}>{ad.status === 'active' ? 'Aktif' : 'Pasif'}</Text>
      </View>
      <Text style={styles.cardTitle}>{ad.title}</Text>
      <Text style={styles.coach}>{ad.coachName} • {ad.clubName}</Text>
      <View style={styles.metaGrid}>
        <Meta label="Branş" value={ad.branch} />
        <Meta label="Seviye" value={ad.level} />
        <Meta label="Yaş grubu" value={ad.ageGroup} />
        <Meta label="Kontenjan" value={ad.capacity} />
      </View>
      <Text style={styles.body}>{ad.schedule} • {ad.location}</Text>
      <Text style={styles.description} numberOfLines={2}>{ad.description}</Text>
      {ad.priceInfo ? <Text style={styles.price}>Ücret bilgisi: {ad.priceInfo}</Text> : null}
      <Text style={styles.visibility}>{ad.visibility}</Text>
      <Pressable style={styles.availabilityButton} onPress={onAvailability}>
        <CalendarDays color={colors.cyan} size={16} />
        <Text style={styles.availabilityText}>Uygun Saatleri Gör</Text>
      </Pressable>
      {canRequest ? (
        <Pressable style={styles.requestButton} onPress={onContact}>
          <Send color={colors.background} size={16} />
          <Text style={styles.requestText}>İletişim talebi gönder</Text>
        </Pressable>
      ) : null}
      {canManage ? (
        <View style={styles.manageRow}>
          <Pressable style={styles.manageButton} onPress={onToggle}>
            {ad.status === 'active' ? <X color={colors.text} size={15} /> : <CheckCircle2 color={colors.text} size={15} />}
            <Text style={styles.manageText}>{ad.status === 'active' ? 'Pasif yap' : 'Aktif yap'}</Text>
          </Pressable>
          <Pressable style={styles.manageButton} onPress={onToggle}>
            <Edit3 color={colors.text} size={15} />
            <Text style={styles.manageText}>Düzenle mock</Text>
          </Pressable>
          <Pressable style={styles.manageButtonDanger} onPress={onDelete}>
            <Trash2 color={colors.danger} size={15} />
            <Text style={styles.manageDangerText}>Sil</Text>
          </Pressable>
        </View>
      ) : null}
    </GlassCard>
  );
}

function ChoiceGroup({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.choiceBlock}>
      <Text style={styles.label}>{label}</Text>
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
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  message: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  createButton: { minHeight: 48, borderRadius: 16, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  createButtonText: { color: colors.background, fontWeight: '900' },
  form: { gap: spacing.md },
  input: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, paddingHorizontal: spacing.md, fontWeight: '800' },
  textArea: { minHeight: 82, textAlignVertical: 'top', paddingTop: spacing.md },
  choiceBlock: { gap: spacing.sm },
  label: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, paddingHorizontal: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  chipText: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  chipTextActive: { color: colors.background },
  publishButton: { minHeight: 46, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  publishButtonText: { color: colors.background, fontWeight: '900' },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20, marginTop: spacing.sm },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
  card: { gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { fontWeight: '900', borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 6, overflow: 'hidden' },
  statusActive: { color: colors.success, backgroundColor: 'rgba(52, 211, 153, 0.12)' },
  statusPassive: { color: colors.muted, backgroundColor: colors.glass },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 19 },
  coach: { color: colors.gold, fontWeight: '900' },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metaItem: { width: '48%', borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, padding: spacing.sm },
  metaLabel: { color: colors.muted, fontWeight: '900', fontSize: 11 },
  metaValue: { color: colors.text, fontWeight: '900', marginTop: 4 },
  body: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 21 },
  description: { color: colors.muted, fontWeight: '700', lineHeight: 21 },
  price: { color: colors.cyan, fontWeight: '900' },
  visibility: { color: colors.mutedStrong, fontWeight: '900', fontSize: 12 },
  requestButton: { minHeight: 44, borderRadius: 15, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  requestText: { color: colors.background, fontWeight: '900' },
  availabilityButton: { minHeight: 42, borderRadius: 15, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  availabilityText: { color: colors.text, fontWeight: '900' },
  manageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  manageButton: { borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  manageButtonDanger: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.42)', paddingHorizontal: spacing.sm, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
  manageText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  manageDangerText: { color: colors.danger, fontWeight: '900', fontSize: 12 },
});
