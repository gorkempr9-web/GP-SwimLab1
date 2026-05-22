import { NotebookPen } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { coachNotes } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme/tokens';

export default function CoachNotesScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Antrenör Blog / Notlar</Text>
        <Text style={styles.subtitle}>Teknik geri bildirimler ve sezon planlama notları.</Text>
        {coachNotes.map((note) => (
          <View key={note.id} style={styles.card}>
            <NotebookPen color={colors.cyan} size={24} />
            <Text style={styles.cardTitle}>{note.title}</Text>
            <Text style={styles.body}>{note.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  body: { color: colors.muted, lineHeight: 22 },
});
