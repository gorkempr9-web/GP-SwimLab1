import { Slot } from 'expo-router';
import { LocaleProvider } from '@/locales';
import { SessionProvider } from '@/services/session';
import { ThemeProvider } from '@/theme/ThemeProvider';

export default function RootLayout() {
  return (
    <LocaleProvider>
      <SessionProvider>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
      </SessionProvider>
    </LocaleProvider>
  );
}
