import { Tabs } from 'expo-router';
import { BarChart3, Building2, CalendarClock, Dumbbell, Home, Settings, UserCircle, Users } from 'lucide-react-native';
import { ReactNode } from 'react';
import { View } from 'react-native';
import { renderSafeTextChildren } from '@/components/SafeTextChildren';
import { useLocale } from '@/locales';
import { useSession } from '@/services/session';
import { colors } from '@/theme/tokens';

export default function TabLayout() {
  const { t } = useLocale();
  const { currentUser } = useSession();
  const isSuperAdmin = currentUser.role === 'super_admin';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 74,
          paddingBottom: 12,
          paddingTop: 9,
          shadowColor: colors.text,
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '900' },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: isSuperAdmin ? 'Admin' : t('home'), tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}><Home color={color} size={22} /></TabIcon> }} />
      <Tabs.Screen name="plans" options={isSuperAdmin ? { href: null } : { title: t('plan'), tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}><Dumbbell color={color} size={22} /></TabIcon> }} />
      <Tabs.Screen name="races" options={{ title: isSuperAdmin ? 'Sistem' : t('raceCenter'), tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}>{isSuperAdmin ? <Settings color={color} size={22} /> : <CalendarClock color={color} size={22} />}</TabIcon> }} />
      <Tabs.Screen name="club" options={{ title: isSuperAdmin ? 'Kulüpler' : t('club'), tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}><Building2 color={color} size={22} /></TabIcon> }} />
      <Tabs.Screen name="analytics" options={{ title: isSuperAdmin ? 'Kullanıcılar' : 'Analiz', tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}>{isSuperAdmin ? <Users color={color} size={22} /> : <BarChart3 color={color} size={22} />}</TabIcon> }} />
      <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, focused }) => <TabIcon focused={focused}><UserCircle color={color} size={22} /></TabIcon> }} />
    </Tabs>
  );
}

function TabIcon({ focused, children }: { focused: boolean; children: ReactNode }) {
  return (
    <View style={{
      width: 38,
      height: 30,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: focused ? colors.coralSoft : 'transparent',
      borderWidth: focused ? 1 : 0,
      borderColor: focused ? 'rgba(249, 115, 22, 0.24)' : 'transparent',
    }}>
      {renderSafeTextChildren(children)}
    </View>
  );
}
