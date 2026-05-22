import { Play, Video } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { videos } from '@/data/mockData';
import { colors, spacing, typography } from '@/theme/tokens';

export default function VideosScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Teknik Video Merkezi</Text>
        <Text style={styles.subtitle}>Start, dönüş, su altı ve stil teknikleri için analiz arşivi.</Text>
        {videos.map((video) => (
          <View key={video.id} style={styles.card}>
            <View style={styles.thumb}>
              <Video color={colors.cyan} size={30} />
              <View style={styles.play}>
                <Play color={colors.background} size={16} fill={colors.background} />
              </View>
            </View>
            <View style={styles.body}>
              <Text style={styles.cardTitle}>{video.title}</Text>
              <Text style={styles.meta}>{video.tag} • {video.duration}</Text>
            </View>
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
  card: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  thumb: { width: 94, height: 70, borderRadius: 16, backgroundColor: '#063451', alignItems: 'center', justifyContent: 'center' },
  play: { position: 'absolute', right: 8, bottom: 8, width: 28, height: 28, borderRadius: 10, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'center' },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 16 },
  meta: { color: colors.muted, marginTop: 5 },
});
