import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { en } from './en';
import { tr } from './tr';

export type Language = 'tr' | 'en';
type TranslationKey = keyof typeof tr;

const dictionaries = { tr, en };
const storageKey = 'gp-swimlab-language';

const LocaleContext = createContext({
  language: 'tr' as Language,
  setLanguage: (_language: Language) => {},
  t: (key: TranslationKey) => tr[key],
});

export function LocaleProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((saved) => {
      if (saved === 'tr' || saved === 'en') {
        setLanguageState(saved);
      }
    });
  }, []);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      AsyncStorage.setItem(storageKey, nextLanguage);
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
