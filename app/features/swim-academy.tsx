import { router } from 'expo-router';
import { BrainCircuit, FileText, Heart, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { AcademyItem, AcademySection, academyItems, academySections } from '@/data/swimAcademy';
import { useLocale } from '@/locales';
import { colors, spacing, typography } from '@/theme/tokens';

const sectionLabels: Record<AcademySection, { tr: string; en: string }> = {
  glossary: { tr: 'Yüzme Sözlüğü', en: 'Swimming Glossary' },
  competition: { tr: 'Yarışma Sistemi', en: 'Competition System' },
  performance: { tr: 'Performans Analizi', en: 'Performance Analysis' },
  parent: { tr: 'Veli Rehberi', en: 'Parent Guide' },
};

export default function SwimAcademyScreen() {
  const { language, t } = useLocale();
  const [activeSection, setActiveSection] = useState<AcademySection>('glossary');
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return academyItems.filter((item) => {
      const sectionMatch = item.section === activeSection;
      if (!normalized) return sectionMatch;
      const haystack = `${item.title} ${item.description} ${item.example}`.toLocaleLowerCase('tr-TR');
      return haystack.includes(normalized);
    });
  }, [activeSection, query]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconHero}>
            <FileText color={colors.cyan} size={28} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{t('swimAcademy')}</Text>
            <Text style={styles.subtitle}>Yüzme terimleri, yarış sistemi, performans puanları ve veli rehberi.</Text>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search color={colors.mutedStrong} size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="FINA, Rudolph, DQ, Split, SEM..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {academySections.map((section) => {
            const active = activeSection === section.id;
            return (
              <Pressable key={section.id} style={[styles.tab, active && { backgroundColor: section.color, borderColor: section.color }]} onPress={() => setActiveSection(section.id)}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{sectionLabels[section.id][language]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {activeSection === 'competition' ? (
          <Text style={styles.officialNotice}>Resmi yarış başvuruları ve duyurular için TYF’nin resmi sayfaları kontrol edilmelidir.</Text>
        ) : null}
        {activeSection === 'parent' ? (
          <Text style={styles.healthNotice}>Bu içerikler bilgilendirme amaçlıdır. Sağlık, sakatlık ve beslenme konularında uzman görüşü alınmalıdır.</Text>
        ) : null}

        {visibleItems.map((item) => (
          <AcademyCard
            key={item.id}
            item={item}
            expanded={expandedId === item.id}
            favorite={favorites.includes(item.id)}
            onToggleExpand={() => setExpandedId((current) => current === item.id ? null : item.id)}
            onToggleFavorite={() => toggleFavorite(item.id)}
            favoriteLabel={t('addToFavorites')}
            askAiLabel={t('askAiCoach')}
          />
        ))}

        {!visibleItems.length ? <Text style={styles.empty}>Bu aramada sonuç bulunamadı.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function AcademyCard({
  item,
  expanded,
  favorite,
  onToggleExpand,
  onToggleFavorite,
  favoriteLabel,
  askAiLabel,
}: {
  item: AcademyItem;
  expanded: boolean;
  favorite: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  favoriteLabel: string;
  askAiLabel: string;
}) {
  const section = academySections.find((entry) => entry.id === item.section);

  return (
    <GlassCard style={styles.card}>
      <Pressable onPress={onToggleExpand} style={styles.cardPress}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryLine, { backgroundColor: section?.color ?? colors.cyan }]} />
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription} numberOfLines={expanded ? undefined : 2}>{item.description}</Text>
          </View>
        </View>

        {expanded ? (
          <View style={styles.detailBox}>
            <Text style={styles.exampleLabel}>Örnek kullanım</Text>
            <Text style={styles.exampleText}>{item.example}</Text>
            {item.warning ? <Text style={styles.warning}>{item.warning}</Text> : null}
          </View>
        ) : null}
      </Pressable>

      <View style={styles.actions}>
        <Pressable style={[styles.actionButton, favorite && styles.favoriteActive]} onPress={onToggleFavorite}>
          <Heart color={favorite ? colors.background : colors.cyan} size={15} fill={favorite ? colors.cyan : 'transparent'} />
          <Text style={[styles.actionText, favorite && styles.favoriteText]}>{favoriteLabel}</Text>
        </Pressable>
        <Pressable style={styles.aiButton} onPress={() => router.push('/features/ai-coach')}>
          <BrainCircuit color={colors.background} size={15} />
          <Text style={styles.aiText}>{item.aiPrompt ?? askAiLabel}</Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconHero: { width: 52, height: 52, borderRadius: 20, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, minWidth: 0 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20, marginTop: 4 },
  searchBox: { minHeight: 48, borderRadius: 18, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surfaceSolid, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, color: colors.text, fontWeight: '800', minHeight: 46 },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  officialNotice: { color: colors.gold, fontWeight: '900', backgroundColor: colors.goldSoft, borderRadius: 16, padding: spacing.md, lineHeight: 20 },
  healthNotice: { color: colors.danger, fontWeight: '900', backgroundColor: colors.dangerSoft, borderRadius: 16, padding: spacing.md, lineHeight: 20 },
  card: { gap: spacing.md },
  cardPress: { gap: spacing.md },
  cardHeader: { flexDirection: 'row', gap: spacing.md },
  categoryLine: { width: 5, borderRadius: 999 },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  cardDescription: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 21, marginTop: 6 },
  detailBox: { borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, padding: spacing.md, gap: spacing.sm },
  exampleLabel: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  exampleText: { color: colors.text, fontWeight: '800', lineHeight: 21 },
  warning: { color: colors.gold, fontWeight: '900', lineHeight: 20, backgroundColor: colors.goldSoft, borderRadius: 14, padding: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionButton: { minHeight: 36, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  favoriteActive: { backgroundColor: colors.cyan },
  actionText: { color: colors.cyan, fontWeight: '900', fontSize: 12 },
  favoriteText: { color: colors.background },
  aiButton: { minHeight: 36, borderRadius: 999, backgroundColor: colors.cyan, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  aiText: { color: colors.background, fontWeight: '900', fontSize: 12 },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
});
