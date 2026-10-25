export interface Language {
  code: string;
  name: string; // English name, used in the prompt
  native: string; // how speakers write it
  dir?: "rtl";
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", native: "English" },
  { code: "pcm", name: "Nigerian Pidgin", native: "Naijá" },
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "yo", name: "Yoruba", native: "Yorùbá" },
  { code: "ig", name: "Igbo", native: "Igbo" },
  { code: "sw", name: "Swahili", native: "Kiswahili" },
  { code: "am", name: "Amharic", native: "አማርኛ" },
  { code: "zu", name: "Zulu", native: "isiZulu" },
  { code: "so", name: "Somali", native: "Soomaali" },
  { code: "fr", name: "French", native: "Français" },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl" },
  { code: "pt", name: "Portuguese", native: "Português" },
];

export function getLanguage(code: string | null | undefined): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

// Greetings shown on the landing page. Written as commonly used.
export const GREETINGS: { word: string; lang: string }[] = [
  { word: "Sannu", lang: "Hausa" },
  { word: "Ẹ n lẹ", lang: "Yorùbá" },
  { word: "Ndewo", lang: "Igbo" },
  { word: "Habari", lang: "Kiswahili" },
  { word: "Sawubona", lang: "isiZulu" },
  { word: "Akwaaba", lang: "Twi" },
  { word: "Salaam", lang: "Arabic" },
  { word: "Selam", lang: "Amharic" },
  { word: "Bonjour", lang: "Français" },
  { word: "Nanga def", lang: "Wolof" },
  { word: "Molo", lang: "isiXhosa" },
  { word: "Olá", lang: "Português" },
  { word: "Bawo ni", lang: "Yorùbá" },
  { word: "Mhoro", lang: "Shona" },
  { word: "How far", lang: "Naijá" },
  { word: "Dumela", lang: "Setswana" },
];
