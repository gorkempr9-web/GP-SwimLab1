import { router } from 'expo-router';
import { Bell, CheckCircle2, ChevronRight, Globe2, KeyRound, LucideIcon, Mail, Phone, ShieldCheck, Trash2, UserCircle, Users } from 'lucide-react-native';
import { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
import { mockAthlete } from '@/data/mockUser';
import { Language, useLocale } from '@/locales';
import { roleLabel, useSession } from '@/services/session';
import { colors, spacing, typography } from '@/theme/tokens';

const notificationDefaults = [
  'trainingReminders',
  'raceReminders',
  'clubAnnouncements',
  'nutritionReminders',
] as const;

type NotificationKey = (typeof notificationDefaults)[number];

export default function SettingsScreen() {
  const { currentUser } = useSession();
  const { language, setLanguage, t } = useLocale();
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    trainingReminders: true,
    raceReminders: true,
    clubAnnouncements: true,
    nutritionReminders: false,
  });

  const isUnder18Athlete = currentUser.role === 'athlete' && Number(mockAthlete.age) < 18;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('settings')}</Text>
        <Text style={styles.subtitle}>{t('settingsDetail')}</Text>

        <SettingsSection title={t('accountInfo')}>
          <SettingsRow icon={Phone} title={t('phoneNumber')} detail={`${mockAthlete.phone.countryCode} ${mockAthlete.phone.number}`} />
          <SettingsRow icon={Mail} title={t('emailAddress')} detail={mockAthlete.email} />
          <SettingsRow icon={CheckCircle2} title={t('phoneVerificationStatus')} detail={mockAthlete.phone.verified ? t('phoneVerified') : t('phoneNotVerified')} />
          <SettingsRow icon={CheckCircle2} title={t('emailVerificationStatus')} detail={mockAthlete.emailVerified ? t('emailVerified') : t('emailNotVerified')} />
          <SettingsRow icon={UserCircle} title={t('userType')} detail={roleLabel(currentUser.role)} />
        </SettingsSection>

        {isUnder18Athlete ? (
          <SettingsSection title={t('guardianInfo')}>
            <SettingsRow icon={Phone} title={t('guardianPhone')} detail={`${mockAthlete.guardianPhone.countryCode} ${mockAthlete.guardianPhone.number}`} />
            <SettingsRow icon={Mail} title={t('guardianEmail')} detail={mockAthlete.guardianEmail.email} />
            <SettingsRow icon={Users} title={t('guardianConsentStatus')} detail={mockAthlete.guardianPhone.verified || mockAthlete.guardianEmail.verified ? t('guardianContactVerified') : t('guardianContactNotVerified')} />
          </SettingsSection>
        ) : null}

        <SettingsSection title={t('language')}>
          <View style={styles.languageOptions}>
            <LanguageButton label={t('turkish')} value="tr" active={language === 'tr'} onPress={setLanguage} />
            <LanguageButton label={t('english')} value="en" active={language === 'en'} onPress={setLanguage} />
          </View>
        </SettingsSection>

        <SettingsSection title={t('notificationSettings')}>
          {notificationDefaults.map((key) => (
            <ToggleRow
              key={key}
              title={t(key)}
              detail={notifications[key] ? t('active') : t('passive')}
              active={notifications[key]}
              onPress={() => setNotifications((current) => ({ ...current, [key]: !current[key] }))}
            />
          ))}
        </SettingsSection>

        <SettingsSection title={t('privacyKvkk')}>
          <SettingsRow icon={ShieldCheck} title={t('privacy')} detail={t('privacySettingsDetail')} onPress={() => router.push('/features/privacy')} />
          <SettingsRow icon={CheckCircle2} title={t('explicitConsentStatus')} detail={t('active')} />
          <SettingsRow icon={Trash2} title={t('deleteData')} detail={t('deleteDataDetail')} danger={true} />
        </SettingsSection>

        <SettingsSection title={t('security')}>
          <SettingsRow icon={KeyRound} title={t('changePassword')} detail={t('changePasswordDetail')} />
          <SettingsRow icon={CheckCircle2} title={t('reverifyContact')} detail={t('reverifyContactDetail')} />
          <SettingsRow icon={ShieldCheck} title={t('sessionSecurity')} detail={t('sessionSecurityDetail')} />
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {renderSafeTextChildren(children)}
    </GlassCard>
  );
}

function SettingsRow({ icon: Icon, title, detail, onPress, danger = false }: { icon: LucideIcon; title: string; detail: string; onPress?: () => void; danger?: boolean }) {
  return (
    <Pressable style={({ pressed }) => [styles.settingsRow, pressed && onPress && styles.pressed]} onPress={onPress} disabled={!onPress}>
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Icon color={danger ? colors.danger : colors.cyan} size={20} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      {onPress ? <ChevronRight color={colors.muted} size={18} /> : null}
    </Pressable>
  );
}

function ToggleRow({ title, detail, active, onPress }: { title: string; detail: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={styles.rowIcon}>
        <Bell color={colors.cyan} size={20} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <View style={[styles.switchTrack, active && styles.switchTrackActive]}>
        <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
      </View>
    </Pressable>
  );
}

function LanguageButton({ label, value, active, onPress }: { label: string; value: Language; active: boolean; onPress: (language: Language) => void }) {
  return (
    <Pressable style={[styles.languageButton, active && styles.languageButtonActive]} onPress={() => onPress(value)}>
      <Globe2 color={active ? colors.background : colors.cyan} size={18} />
      <Text style={[styles.languageButtonText, active && styles.languageButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 110, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', marginTop: -spacing.sm },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.text, fontWeight: '900', fontSize: 18, marginBottom: spacing.xs },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md },
  pressed: { opacity: 0.82 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontWeight: '900' },
  dangerText: { color: colors.danger },
  rowDetail: { color: colors.muted, fontWeight: '700', marginTop: 3, lineHeight: 18 },
  languageOptions: { flexDirection: 'row', gap: spacing.sm },
  languageButton: { flex: 1, minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  languageButtonActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  languageButtonText: { color: colors.mutedStrong, fontWeight: '900' },
  languageButtonTextActive: { color: colors.background },
  switchTrack: { width: 48, height: 28, borderRadius: 999, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.border, padding: 3 },
  switchTrackActive: { backgroundColor: colors.cyanSoft, borderColor: colors.cyan },
  switchThumb: { width: 20, height: 20, borderRadius: 999, backgroundColor: colors.muted },
  switchThumbActive: { backgroundColor: colors.cyan, transform: [{ translateX: 18 }] },
});
