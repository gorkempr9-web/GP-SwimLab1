import { ShieldCheck, Trash2 } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { colors, spacing, typography } from '@/theme/tokens';

const privacyItems = [
  'Hesap bilgileri, sporcu profili ve performans verileri yalnızca uygulama amacı için kullanılır.',
  'Beslenme, sağlık, sakatlık ve diyetisyen notları hassas veri olarak korunur.',
  'Kulüp, antrenör, veli ve diyetisyen erişimleri role göre sınırlandırılır.',
  'PDF raporlar yalnızca yetkili kişilerle paylaşılmalıdır.',
  'Kullanıcı, verilerinin silinmesi için talep oluşturabilir.',
];

const securityItems = [
  'Hangi veriler tutulur? Hesap, kulüp, yarış, performans ve izin kayıtları.',
  'Neden tutulur? Yarış takibi, raporlama, kulüp iletişimi ve güvenli erişim için.',
  'Kimler görebilir? Sporcu, veli, antrenör ve kulüp rolleri kendi yetkileri kadar görür.',
  'Silme talebi nasıl yapılır? Profil > Verilerimi Silme Talebi alanından mock talep oluşturulur.',
  'Rıza geri çekme nasıl yapılır? KVKK/Gizlilik ayarlarından kulüp yöneticisi veya destek ekibine bildirilir.',
];

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <ShieldCheck color={colors.cyan} size={40} />
          <Text style={styles.title}>KVKK ve Gizlilik</Text>
          <Text style={styles.subtitle}>Bu ekran mock MVP için hazırlanmıştır. Hukuki metinlerin uzman onayı ile yayınlanması gerekir.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Aydınlatma özeti</Text>
          {privacyItems.map((item) => (
            <Text key={item} style={styles.item}>• {item}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Açık rıza özeti</Text>
          <Text style={styles.body}>Performans, yarış, rapor ve beslenme verileri uygulama içinde hizmet sunmak için işlenir. Kullanıcı izinlerini daha sonra profilinden yönetebilir.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Güvenlik ve Veri Koruma</Text>
          {securityItems.map((item) => (
            <Text key={item} style={styles.item}>• {item}</Text>
          ))}
        </View>

        <AppButton title="Verilerimi Silme Talebi" icon={Trash2} variant="secondary" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg },
  header: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.gold, lineHeight: 22, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  item: { color: colors.muted, lineHeight: 22, fontWeight: '700' },
  body: { color: colors.muted, lineHeight: 22 },
});
