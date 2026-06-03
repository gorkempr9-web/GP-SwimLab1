import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { useLocale } from '@/locales';
import { colors, spacing, typography } from '@/theme/tokens';

export type ScoreInfoType = 'fina' | 'rudolph' | 'barriers';

const trInfo = {
  fina: {
    title: 'FINA Puanı Nedir?',
    description: 'FINA puanı, bir yüzücünün derecesini dünya seviyesindeki en iyi dereceye göre değerlendiren uluslararası performans puanıdır.',
    bullets: [
      '300 altı -> başlangıç seviyesi',
      '300-500 -> gelişim seviyesi',
      '500-700 -> güçlü performans',
      '700-850 -> üst düzey yüzücü',
      '850+ -> elit seviye',
    ],
    note: 'FINA puanı yaşa göre değil, mutlak performansa göre hesaplanır.',
  },
  rudolph: {
    title: 'Rudolph Puanı Nedir?',
    description: 'Rudolph puanı yaş grubu sporcularının performansını değerlendirir. Yaş faktörü dikkate alınır.',
    bullets: [
      '0 altı -> baraj altında',
      '0-5 -> ortalama',
      '5-10 -> iyi seviye',
      '10-15 -> çok iyi seviye',
      '15+ -> ulusal düzey performans',
    ],
    note: 'Rudolph puanı yaş gruplarında gelişimi takip etmek için kullanılır.',
  },
  barriers: {
    title: 'Baraj Türleri',
    description: 'Baraj açıklamaları sporcu ve velilerin hedef sistemini anlaması için bilgilendirme amaçlı gösterilir.',
    bullets: [
      'İl Barajı -> yerel yarış hedefi',
      'SEM -> sporcu eğitim merkezi değerlendirme eşiği',
      'THOM -> Türkiye olimpik hazırlık merkezi hedef eşiği',
      'Milli Takım Barajı -> ulusal takım değerlendirme hedefi',
    ],
    note: 'Resmi barajlar ve gÖncel kriterler ilgili federasyonlardan kontrol edilmelidir.',
  },
};

const enInfo: typeof trInfo = {
  fina: {
    title: 'What is FINA Score?',
    description: "FINA score is an international performance score that evaluates a swimmer's time against world-level benchmark times.",
    bullets: [
      'Below 300 -> beginner level',
      '300-500 -> development level',
      '500-700 -> strong performance',
      '700-850 -> advanced swimmer',
      '850+ -> elite level',
    ],
    note: 'FINA score is based on absolute performance, not age.',
  },
  rudolph: {
    title: 'What is Rudolph Score?',
    description: 'Rudolph score evaluates age-group swimmer performance. The age factor is considered.',
    bullets: [
      'Below 0 -> below standard',
      '0-5 -> average',
      '5-10 -> good level',
      '10-15 -> very good level',
      '15+ -> national-level performance',
    ],
    note: 'Rudolph score is used to track development in age groups.',
  },
  barriers: {
    title: 'Time Standard Types',
    description: 'Time standard notes help athletes and parents understand qualification targets.',
    bullets: [
      'City Standard -> local competition target',
      'SEM -> athlete education center evaluation threshold',
      'THOM -> Turkish Olympic preparation center target threshold',
      'National Team Standard -> national team evaluation target',
    ],
    note: 'Official standards and current criteria should be checked with the relevant federation.',
  },
};

export function ScoreInfoButton({ type, label, compact = true }: { type: ScoreInfoType; label?: string; compact?: boolean }) {
  const { language } = useLocale();
  const [visible, setVisible] = useState(false);
  const info = (language === 'en' ? enInfo : trInfo)[type];

  return (
    <>
      <Pressable style={[styles.button, compact && styles.compactButton]} onPress={() => setVisible(true)} accessibilityRole="button" accessibilityLabel={info.title}>
        <Text style={styles.buttonText}>ⓘ</Text>
        {label ? <Text style={styles.buttonLabel}>{label}</Text> : null}
      </Pressable>

      <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalShell} onPress={(event) => event.stopPropagation()}>
            <GlassCard style={styles.modalCard}>
              <Text style={styles.modalTitle}>{info.title}</Text>
              <Text style={styles.description}>{info.description}</Text>
              <View style={styles.bullets}>
                {info.bullets.map((item) => (
                  <View key={item} style={styles.bulletRow}>
                    <View style={styles.dot} />
                    <Text style={styles.bulletText}>{item}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.note}>{info.note}</Text>
              <Pressable style={styles.closeButton} onPress={() => setVisible(false)}>
                <Text style={styles.closeText}>{language === 'en' ? 'Got it' : 'Anladım'}</Text>
              </Pressable>
            </GlassCard>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.sm, paddingVertical: 6 },
  compactButton: { paddingHorizontal: 7, paddingVertical: 3 },
  buttonText: { color: colors.cyan, fontWeight: '900', fontSize: 14 },
  buttonLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: 'rgba(2, 10, 20, 0.72)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modalShell: { width: '100%', maxWidth: 430 },
  modalCard: { gap: spacing.md },
  modalTitle: { ...typography.h2, color: colors.text },
  description: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 22 },
  bullets: { gap: spacing.sm },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.cyan, marginTop: 7 },
  bulletText: { flex: 1, color: colors.text, fontWeight: '800', lineHeight: 21 },
  note: { color: colors.gold, fontWeight: '900', lineHeight: 21, backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.md },
  closeButton: { alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: colors.cyan, paddingVertical: 12 },
  closeText: { color: colors.background, fontWeight: '900' },
});
