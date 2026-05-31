import { Tabs } from 'expo-router';
import { Building2, CalendarClock, Dumbbell, Home, UserCircle } from 'lucide-react-native';
import { useLocale } from '@/locales';
import { colors } from '@/theme/tokens';

export default function TabLayout() {
  const { t } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: '#6E8EA5',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(7, 35, 61, 0.92)',
          borderTopColor: 'rgba(255,255,255,0.08)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 74,
          paddingBottom: 12,
          paddingTop: 9,
          shadowColor: colors.cyan,
          shadowOpacity: 0.16,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '800' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: t('panel'), tabBarIcon: ({ color }) => <Home color={color} size={22} /> }} />
      <Tabs.Screen name="plans" options={{ title: t('plan'), tabBarIcon: ({ color }) => <Dumbbell color={color} size={22} /> }} />
      <Tabs.Screen name="races" options={{ title: t('race'), tabBarIcon: ({ color }) => <CalendarClock color={color} size={22} /> }} />
      <Tabs.Screen name="club" options={{ title: t('club'), tabBarIcon: ({ color }) => <Building2 color={color} size={22} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color }) => <UserCircle color={color} size={22} /> }} />
    </Tabs>
  );
}
