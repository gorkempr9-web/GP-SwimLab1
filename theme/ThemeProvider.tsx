import { PropsWithChildren } from 'react';
import { View } from 'react-native';
import { colors } from './tokens';

export function ThemeProvider({ children }: PropsWithChildren) {
  return <View style={{ flex: 1, backgroundColor: colors.background }}>{children}</View>;
}
