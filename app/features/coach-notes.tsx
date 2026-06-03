import { NotebookPen } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { colors, spacing, typography } from '@/theme/tokens';

const tabs = ['Teknik', 'Start', 'Dönüş', 'Su altı', 'Tempo', 'Psikoloji', 'Beslenme', 'Sakatlık', 'Hedef'];

const notes: Array<{ id: string; athlete: string; race: string; week: string; category: string; title: string; body: string }> = [];

export default function CoachNotesScreen() {
  const [activeTab, setActiveTab] = useState('Teknik');
  const [athleteFilter, setAthleteFilter] = useState('');
  const visibleNotes = useMemo(
    () => notes.filter((note) => note.category === activeTab && (!athleteFilter.trim() || note.athlete.toLowerCase().includes(athleteFilter.toLowerCase()))),
    [activeTab, athleteFilter],
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <NotebookPen color={colors.cyan} size={28} />
          <View>
            <Text style={styles.title}>Antrenör Not Defteri</Text>
            <Text style={styles.subtitle}>Sporcu, yarış?, hafta ve kategori filtresi.</Text>
          </View>
        </View>

        <TextInput
          value={athleteFilter}
          onChangeText={setAthleteFilter}
          placeholder="Sporcu filtresi"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visibleNotes.map((note) => (
          <GlassCard key={note.id} style={styles.card}>
            <Text style={styles.athlete}>{note.athlete}</Text>
            <Text style={styles.meta}>{note.race} ? {note.week}  •  {note.category}</Text>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteBody}>{note.body}</Text>
          </GlassCard>
        ))}
        {!visibleNotes.length ? <Text style={styles.empty}>Bu kategoride not yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.muted, fontWeight: '700', marginTop: 4 },
  input: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSolid, color: colors.text, fontWeight: '800', paddingHorizontal: spacing.md },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  tabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  card: { gap: spacing.sm },
  athlete: { color: colors.text, fontWeight: '900', fontSize: 18 },
  meta: { color: colors.muted, fontWeight: '800' },
  noteTitle: { color: colors.cyan, fontWeight: '900', fontSize: 16 },
  noteBody: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 21 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
});

