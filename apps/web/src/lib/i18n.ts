import 'server-only';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  // Add other languages here
};

export const getDictionary = async (locale: keyof typeof dictionaries = 'en') => 
  dictionaries[locale]();
