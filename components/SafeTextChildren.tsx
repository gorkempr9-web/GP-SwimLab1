import { Children, ReactNode } from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '@/theme/tokens';

export function renderSafeTextChildren(children: ReactNode, style?: TextStyle) {
  return Children.map(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      const text = String(child);
      if (!text.trim()) return null;
      return <Text style={[{ color: colors.text, fontWeight: '700' }, style]}>{text}</Text>;
    }
    return child;
  });
}
