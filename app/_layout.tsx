import { Stack } from 'expo-router';
import { Component, PropsWithChildren, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LocaleProvider } from '@/locales';
import { SessionProvider } from '@/services/session';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { colors, spacing } from '@/theme/tokens';

export default function RootLayout() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <StartupErrorBoundary key={resetKey} onRetry={() => setResetKey((key) => key + 1)}>
      <LocaleProvider>
        <SessionProvider>
          <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </ThemeProvider>
        </SessionProvider>
      </LocaleProvider>
    </StartupErrorBoundary>
  );
}

type BoundaryProps = PropsWithChildren<{ onRetry: () => void }>;
type BoundaryState = { hasError: boolean };

class StartupErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn('Startup error boundary caught:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Uygulama başlatılırken bir sorun oluştu</Text>
        <Text style={styles.errorText}>Lütfen tekrar deneyin. Sorun devam ederse uygulamayı kapatıp açın.</Text>
        <Pressable style={styles.retryButton} onPress={this.props.onRetry}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  errorTitle: { color: colors.text, fontWeight: '900', fontSize: 22, textAlign: 'center' },
  errorText: { color: colors.mutedStrong, fontWeight: '700', textAlign: 'center', lineHeight: 21 },
  retryButton: { minHeight: 44, borderRadius: 16, backgroundColor: colors.cyan, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg },
  retryText: { color: colors.background, fontWeight: '900' },
});
