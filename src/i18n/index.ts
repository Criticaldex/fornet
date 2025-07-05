import es from './es.json';
import en from './en.json';

type Translations = typeof es;

const translations = { es, en } as const;

export const useTranslations = (lang: 'es' | 'en' = 'es') => {
    return translations[lang];
};