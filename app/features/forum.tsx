import { Ban, Heart, Medal, Plus, ShieldAlert, ShieldCheck, Star } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { GlassCard } from '@/components/GlassCard';
import { mockAthlete } from '@/data/mockUser';
import { ModerationMode, moderateText } from '@/services/moderation';
import { colors, spacing, typography } from '@/theme/tokens';

const shareTypes = ['Yeni PB', 'Yarış Sonucu', 'Madalya', 'Kürsü', 'Kulüp Başarısı', 'Ayın Sporcusu'];
const quickComments = ['Tebrikler', 'Harika yarış', 'Güzel gelişim', 'Devam et'];

const initialWallItems = [
  { id: 'w1', athlete: 'Deniz Arslan', type: 'Yeni PB', detail: '100m Serbest • 56.84', likes: 24 },
  { id: 'w2', athlete: 'Ece Yılmaz', type: 'Kürsü', detail: '50m Kelebek • 28.02 • 2.lik', likes: 18 },
  { id: 'w3', athlete: 'GP Aquatics', type: 'Kulüp Başarısı', detail: '28 PB paylaşımı • 1840 puan', likes: 31 },
];

export default function ForumScreen() {
  const [mode, setMode] = useState<ModerationMode>('block');
  const [shareType, setShareType] = useState(shareTypes[0]);
  const [achievementTitle, setAchievementTitle] = useState('100m Serbest PB');
  const [achievementBody, setAchievementBody] = useState('56.84 ile yeni kişisel rekor.');
  const [warning, setWarning] = useState('');
  const [preview, setPreview] = useState('');
  const [lastAction, setLastAction] = useState('Sadece pozitif hızlı yorumlar açık.');

  const handleCreateAchievement = () => {
    const result = moderateText(`${shareType} ${achievementTitle} ${achievementBody}`, mode);

    if (!result.allowed) {
      setWarning(result.warning ?? 'Topluluk kurallarına aykırı içerik algılandı.');
      setPreview('');
      return;
    }

    setWarning('');
    setPreview(mode === 'censor' ? result.sanitized : `${mockAthlete.firstName} ${mockAthlete.lastName}\n${shareType}\n${achievementTitle} • ${achievementBody}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Başarı Duvarı</Text>
        <Text style={styles.subtitle}>Serbest sohbet yok. Sadece kontrollü başarı paylaşımları var.</Text>

        <GlassCard style={styles.athleteOfMonth}>
          <View style={styles.wallIcon}>
            <Star color={colors.gold} size={24} />
          </View>
          <View style={styles.wallBody}>
            <Text style={styles.wallType}>Ayın Sporcusu</Text>
            <Text style={styles.wallTitle} numberOfLines={1}>Deniz Arslan</Text>
            <Text style={styles.wallMeta} numberOfLines={2}>100m Serbest PB • 56.84 • Marmara Cup hazırlığı</Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.warningCard}>
          <ShieldAlert color={colors.gold} size={24} />
          <Text style={styles.warningText}>18 yaş altı sporcular için veli onayı, KVKK ve gizlilik kuralları geçerlidir.</Text>
        </GlassCard>

        <GlassCard style={styles.safetyCard}>
          <View style={styles.safetyHeader}>
            <ShieldCheck color={colors.cyan} size={24} />
            <Text style={styles.cardTitle}>Moderasyon aktif</Text>
          </View>
          <View style={styles.modeRow}>
            <ModeButton label="Engelle" value="block" active={mode === 'block'} onPress={setMode} />
            <ModeButton label="Sansürle (***)" value="censor" active={mode === 'censor'} onPress={setMode} />
          </View>
          <Text style={styles.statusText}>{lastAction}</Text>
        </GlassCard>

        <Text style={styles.sectionTitle}>Paylaşım türleri</Text>
        <View style={styles.chipGrid}>
          {shareTypes.map((type) => (
            <Pressable key={type} style={[styles.typeChip, shareType === type && styles.typeChipActive]} onPress={() => setShareType(type)}>
              <Text style={[styles.typeChipText, shareType === type && styles.typeChipTextActive]}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <GlassCard style={styles.newPost}>
          <View style={styles.safetyHeader}>
            <Star color={colors.gold} size={22} />
            <Text style={styles.cardTitle}>Başarı paylaşımı</Text>
          </View>
          <TextInput placeholder="Yarış / başarı başlığı" placeholderTextColor={colors.muted} value={achievementTitle} onChangeText={setAchievementTitle} style={styles.input} />
          <TextInput placeholder="Derece veya kısa başarı bilgisi" placeholderTextColor={colors.muted} value={achievementBody} onChangeText={setAchievementBody} style={styles.input} />
          {warning ? <Text style={styles.blockWarning}>{warning}</Text> : null}
          {preview ? (
            <View style={styles.previewBox}>
              <Text style={styles.previewTitle}>Önizleme</Text>
              <Text style={styles.previewText}>{preview}</Text>
            </View>
          ) : null}
          <AppButton title="Moderasyonla Kontrol Et" icon={Plus} onPress={handleCreateAchievement} />
        </GlassCard>

        <Text style={styles.sectionTitle}>PB, Madalya ve Kulüp Başarıları</Text>
        {initialWallItems.map((item) => (
          <GlassCard key={item.id} style={styles.wallCard}>
            <View style={styles.wallIcon}>
              <Medal color={colors.gold} size={22} />
            </View>
            <View style={styles.wallBody}>
              <Text style={styles.wallType} numberOfLines={1}>{item.type}</Text>
              <Text style={styles.wallTitle} numberOfLines={1}>{item.athlete}</Text>
              <Text style={styles.wallMeta} numberOfLines={2}>{item.detail}</Text>
              <View style={styles.quickRow}>
                {quickComments.map((comment) => (
                  <Pressable key={comment} style={styles.quickComment} onPress={() => setLastAction(`Hızlı yorum seçildi: ${comment}`)}>
                    <Text style={styles.quickCommentText}>{comment}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={styles.likeBox}>
              <Heart color={colors.cyan} size={18} />
              <Text style={styles.likeText}>{item.likes}</Text>
            </View>
          </GlassCard>
        ))}

        <GlassCard style={styles.noticeCard}>
          <Ban color={colors.danger} size={22} />
          <Text style={styles.noticeText}>Uzun forum sohbeti, direkt mesaj ve serbest yorum alanı kapalıdır.</Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeButton({ label, value, active, onPress }: { label: string; value: ModerationMode; active: boolean; onPress: (mode: ModerationMode) => void }) {
  return (
    <Pressable style={[styles.modeButton, active && styles.modeButtonActive]} onPress={() => onPress(value)}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.lg },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, lineHeight: 22 },
  warningCard: { flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.goldSoft },
  warningText: { flex: 1, color: colors.text, lineHeight: 21, fontWeight: '700' },
  safetyCard: { gap: spacing.md },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 17 },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center', backgroundColor: colors.glass },
  modeButtonActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  modeButtonText: { color: colors.muted, fontWeight: '900' },
  modeButtonTextActive: { color: colors.text },
  statusText: { color: colors.gold, fontWeight: '900', lineHeight: 20 },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 20 },
  athleteOfMonth: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderColor: 'rgba(251, 191, 36, 0.38)', backgroundColor: colors.goldSoft },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  typeChipActive: { backgroundColor: colors.cyanSoft, borderColor: colors.borderStrong },
  typeChipText: { color: colors.mutedStrong, fontWeight: '800' },
  typeChipTextActive: { color: colors.text },
  newPost: { gap: spacing.md },
  input: { color: colors.text, backgroundColor: colors.surfaceSolid, borderRadius: 14, paddingHorizontal: spacing.md, minHeight: 48, borderWidth: 1, borderColor: colors.border },
  blockWarning: { color: colors.danger, fontWeight: '900', backgroundColor: colors.dangerSoft, borderRadius: 14, padding: spacing.md },
  previewBox: { borderRadius: 16, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, padding: spacing.md },
  previewTitle: { color: colors.text, fontWeight: '900' },
  previewText: { color: colors.mutedStrong, marginTop: 5, lineHeight: 20 },
  wallCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  wallIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft, borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.35)' },
  wallBody: { flex: 1 },
  wallType: { color: colors.cyan, fontWeight: '900', marginBottom: 4 },
  wallTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  wallMeta: { color: colors.muted, marginTop: 5, fontWeight: '700' },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  quickComment: { borderRadius: 999, backgroundColor: colors.cyanSoft, borderWidth: 1, borderColor: colors.borderStrong, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  quickCommentText: { color: colors.text, fontWeight: '900', fontSize: 12 },
  likeBox: { alignItems: 'center', gap: 4 },
  likeText: { color: colors.cyan, fontWeight: '900' },
  noticeCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.dangerSoft },
  noticeText: { flex: 1, color: colors.text, lineHeight: 21, fontWeight: '700' },
});
