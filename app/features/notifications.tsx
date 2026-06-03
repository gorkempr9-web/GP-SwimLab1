import { BellRing, CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '@/components/GlassCard';
import { AppNotification, markAllNotificationsRead, markNotificationRead, getNotifications } from '@/services/notificationCenter';
import { colors, spacing, typography } from '@/theme/tokens';

const tabs = ['Tüm bildirimler', 'Okunmamışlar', 'Kulüp duyuruları', 'Yarış hatırlatmaları', 'Antrenman hatırlatmaları', 'Uygulama duyuruları'];

export default function NotificationsScreen() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [notifications, setNotifications] = useState(() => getNotifications());
  const unreadCount = notifications.filter((item) => !item.read).length;
  const visible = useMemo(() => notifications.filter((item) => matchesTab(item, activeTab)), [activeTab, notifications]);

  const markRead = (id: string) => setNotifications(markNotificationRead(id));
  const markAllRead = () => setNotifications(markAllNotificationsRead());

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <BellRing color={colors.cyan} size={28} />
            {unreadCount ? <Text style={styles.badge}>{unreadCount}</Text> : null}
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Bildirimler</Text>
            <Text style={styles.subtitle}>{unreadCount} okunmamış bildirim</Text>
          </View>
        </View>

        <Pressable style={styles.markAllButton} onPress={markAllRead}>
          <CheckCircle2 color={colors.background} size={18} />
          <Text style={styles.markAllText}>Tümünü okundu yap</Text>
        </Pressable>

        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {visible.map((item) => <NotificationCard key={item.id} item={item} onRead={() => markRead(item.id)} />)}
        {!visible.length ? <Text style={styles.empty}>Bu sekmede bildirim yok.</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function matchesTab(item: AppNotification, tab: string) {
  if (tab === 'Okunmamışlar') return !item.read;
  if (tab === 'Kulüp duyuruları') return item.category === 'club';
  if (tab === 'Yarış hatırlatmaları') return item.category === 'race';
  if (tab === 'Antrenman hatırlatmaları') return item.category === 'training';
  if (tab === 'Uygulama duyuruları') return item.category === 'app';
  return true;
}

function NotificationCard({ item, onRead }: { item: AppNotification; onRead: () => void }) {
  return (
    <GlassCard style={[styles.card, !item.read && styles.unreadCard]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
        <Text style={[styles.status, item.read ? styles.read : styles.unread]}>{item.read ? 'Okundu' : 'Okunmadı'}</Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{item.dateTime}</Text>
        <Text style={styles.type}>{categoryLabel(item.category)}</Text>
      </View>
      {!item.read ? (
        <Pressable style={styles.readButton} onPress={onRead}>
          <Text style={styles.readButtonText}>Okundu olarak işaretle</Text>
        </Pressable>
      ) : null}
    </GlassCard>
  );
}

function categoryLabel(category: AppNotification['category']) {
  if (category === 'club') return 'Kulüp duyurusu';
  if (category === 'race') return 'Yarış hatırlatması';
  if (category === 'training') return 'Antrenman hatırlatması';
  return 'Uygulama duyurusu';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBox: { width: 58, height: 58, borderRadius: 22, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -4, top: -4, minWidth: 22, height: 22, borderRadius: 999, backgroundColor: colors.danger, color: colors.text, textAlign: 'center', fontWeight: '900', overflow: 'hidden' },
  headerCopy: { flex: 1 },
  title: { ...typography.h1, color: colors.text },
  subtitle: { color: colors.mutedStrong, fontWeight: '800', marginTop: 4 },
  markAllButton: { minHeight: 48, borderRadius: 18, backgroundColor: colors.cyan, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  markAllText: { color: colors.background, fontWeight: '900' },
  tabs: { gap: spacing.sm, paddingRight: spacing.lg },
  tab: { borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.glass, paddingHorizontal: spacing.md, paddingVertical: 9 },
  tabActive: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  tabText: { color: colors.mutedStrong, fontWeight: '900' },
  tabTextActive: { color: colors.background },
  card: { gap: spacing.md },
  unreadCard: { borderColor: colors.cyan },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  cardCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontWeight: '900', fontSize: 18 },
  description: { color: colors.mutedStrong, fontWeight: '800', lineHeight: 20, marginTop: 5 },
  status: { fontWeight: '900', fontSize: 12 },
  unread: { color: colors.gold },
  read: { color: colors.success },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  meta: { color: colors.muted, fontWeight: '800' },
  type: { color: colors.cyan, fontWeight: '900' },
  readButton: { alignSelf: 'flex-start', borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.cyanSoft, paddingHorizontal: spacing.md, paddingVertical: 9 },
  readButtonText: { color: colors.text, fontWeight: '900' },
  empty: { color: colors.muted, fontWeight: '800', textAlign: 'center', padding: spacing.lg },
});
