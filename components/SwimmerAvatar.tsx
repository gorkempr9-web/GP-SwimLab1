import { UserCircle } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

export function SwimmerAvatar({ name, size = 48, tone = colors.cyan }: { name?: string; size?: number; tone?: string }) {
  const initials = getInitials(name);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: Math.round(size * 0.38), borderColor: `${tone}66`, backgroundColor: `${tone}22` }]}>
      {initials ? <Text style={[styles.initials, { color: tone, fontSize: Math.max(13, size * 0.32) }]}>{initials}</Text> : <UserCircle color={tone} size={size * 0.46} />}
    </View>
  );
}

function getInitials(name?: string) {
  if (!name) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  avatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  initials: { fontWeight: '900' },
});
