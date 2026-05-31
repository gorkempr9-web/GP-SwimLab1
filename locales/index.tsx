import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './en';
import { tr } from './tr';

export type Language = 'tr' | 'en';
type TranslationKey = keyof typeof tr;

const dictionaries = { tr, en };
const storageKey = 'gp-swimlab-language';
let asyncStorageModule: typeof import('@react-native-async-storage/async-storage').default | null = null;

async function getAsyncStorage() {
  if (asyncStorageModule) return asyncStorageModule;
  const module = await import('@react-native-async-storage/async-storage');
  asyncStorageModule = module.default;
  return asyncStorageModule;
}

const LocaleContext = createContext({
  language: 'tr' as Language,
  setLanguage: (_language: Language) => {},
  t: (key: TranslationKey) => tr[key],
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout>;

    async function loadLanguage() {
      try {
        const AsyncStorage = await getAsyncStorage();
        const saved = await AsyncStorage.getItem(storageKey);
        if (mounted && (saved === 'tr' || saved === 'en')) {
          setLanguageState(saved);
        }
      } catch {
        if (mounted) setLanguageState('tr');
      }
    }
    timer = setTimeout(() => {
      loadLanguage();
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      getAsyncStorage()
        .then((AsyncStorage) => AsyncStorage.setItem(storageKey, nextLanguage))
        .catch(() => {});
    };

    return {
      language,
      setLanguage,
      t: (key: TranslationKey) => dictionaries[language][key],
    };
  }, [language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}
