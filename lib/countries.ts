// Reference data for African countries, used by the `country_facts` and
// `current_time` tools and by the country picker. Capitals and currencies
// change rarely; review this list once a year.

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  capital: string;
  currency: string; // ISO 4217
  currencyName: string;
  languages: string;
  dial: string;
  tz: string; // main IANA time zone
  region: "North" | "West" | "Central" | "East" | "Southern";
}

export const COUNTRIES: Country[] = [
  { code: "DZ", name: "Algeria", capital: "Algiers", currency: "DZD", currencyName: "Algerian dinar", languages: "Arabic, Tamazight; French widely used", dial: "+213", tz: "Africa/Algiers", region: "North" },
  { code: "AO", name: "Angola", capital: "Luanda", currency: "AOA", currencyName: "Angolan kwanza", languages: "Portuguese, Umbundu, Kimbundu, Kikongo", dial: "+244", tz: "Africa/Luanda", region: "Southern" },
  { code: "BJ", name: "Benin", capital: "Porto-Novo (government seat: Cotonou)", currency: "XOF", currencyName: "West African CFA franc", languages: "French, Fon, Yoruba", dial: "+229", tz: "Africa/Porto-Novo", region: "West" },
  { code: "BW", name: "Botswana", capital: "Gaborone", currency: "BWP", currencyName: "Botswana pula", languages: "English, Setswana", dial: "+267", tz: "Africa/Gaborone", region: "Southern" },
  { code: "BF", name: "Burkina Faso", capital: "Ouagadougou", currency: "XOF", currencyName: "West African CFA franc", languages: "Mooré, Dioula, Fula, French", dial: "+226", tz: "Africa/Ouagadougou", region: "West" },
  { code: "BI", name: "Burundi", capital: "Gitega", currency: "BIF", currencyName: "Burundian franc", languages: "Kirundi, French, English", dial: "+257", tz: "Africa/Bujumbura", region: "East" },
  { code: "CV", name: "Cabo Verde", capital: "Praia", currency: "CVE", currencyName: "Cape Verdean escudo", languages: "Portuguese, Cape Verdean Creole", dial: "+238", tz: "Atlantic/Cape_Verde", region: "West" },
  { code: "CM", name: "Cameroon", capital: "Yaoundé", currency: "XAF", currencyName: "Central African CFA franc", languages: "French, English, Cameroonian Pidgin", dial: "+237", tz: "Africa/Douala", region: "Central" },
  { code: "CF", name: "Central African Republic", capital: "Bangui", currency: "XAF", currencyName: "Central African CFA franc", languages: "Sango, French", dial: "+236", tz: "Africa/Bangui", region: "Central" },
  { code: "TD", name: "Chad", capital: "N'Djamena", currency: "XAF", currencyName: "Central African CFA franc", languages: "French, Arabic", dial: "+235", tz: "Africa/Ndjamena", region: "Central" },
  { code: "KM", name: "Comoros", capital: "Moroni", currency: "KMF", currencyName: "Comorian franc", languages: "Comorian, French, Arabic", dial: "+269", tz: "Indian/Comoro", region: "East" },
  { code: "CD", name: "DR Congo", capital: "Kinshasa", currency: "CDF", currencyName: "Congolese franc", languages: "French, Lingala, Swahili, Kikongo, Tshiluba", dial: "+243", tz: "Africa/Kinshasa", region: "Central" },
  { code: "CG", name: "Republic of the Congo", capital: "Brazzaville", currency: "XAF", currencyName: "Central African CFA franc", languages: "French, Lingala, Kituba", dial: "+242", tz: "Africa/Brazzaville", region: "Central" },
  { code: "CI", name: "Côte d'Ivoire", capital: "Yamoussoukro (economic capital: Abidjan)", currency: "XOF", currencyName: "West African CFA franc", languages: "French, Dioula, Baoulé", dial: "+225", tz: "Africa/Abidjan", region: "West" },
  { code: "DJ", name: "Djibouti", capital: "Djibouti", currency: "DJF", currencyName: "Djiboutian franc", languages: "French, Arabic, Somali, Afar", dial: "+253", tz: "Africa/Djibouti", region: "East" },
  { code: "EG", name: "Egypt", capital: "Cairo", currency: "EGP", currencyName: "Egyptian pound", languages: "Arabic", dial: "+20", tz: "Africa/Cairo", region: "North" },
  { code: "GQ", name: "Equatorial Guinea", capital: "Malabo", currency: "XAF", currencyName: "Central African CFA franc", languages: "Spanish, French, Portuguese, Fang", dial: "+240", tz: "Africa/Malabo", region: "Central" },
  { code: "ER", name: "Eritrea", capital: "Asmara", currency: "ERN", currencyName: "Eritrean nakfa", languages: "Tigrinya, Arabic, English", dial: "+291", tz: "Africa/Asmara", region: "East" },
  { code: "SZ", name: "Eswatini", capital: "Mbabane (royal and legislative: Lobamba)", currency: "SZL", currencyName: "Swazi lilangeni", languages: "siSwati, English", dial: "+268", tz: "Africa/Mbabane", region: "Southern" },
  { code: "ET", name: "Ethiopia", capital: "Addis Ababa", currency: "ETB", currencyName: "Ethiopian birr", languages: "Amharic, Afaan Oromo, Tigrinya, Somali, Afar", dial: "+251", tz: "Africa/Addis_Ababa", region: "East" },
  { code: "GA", name: "Gabon", capital: "Libreville", currency: "XAF", currencyName: "Central African CFA franc", languages: "French, Fang", dial: "+241", tz: "Africa/Libreville", region: "Central" },
  { code: "GM", name: "Gambia", capital: "Banjul", currency: "GMD", currencyName: "Gambian dalasi", languages: "English, Mandinka, Wolof, Fula", dial: "+220", tz: "Africa/Banjul", region: "West" },
  { code: "GH", name: "Ghana", capital: "Accra", currency: "GHS", currencyName: "Ghanaian cedi", languages: "English, Twi, Ewe, Ga, Dagbani", dial: "+233", tz: "Africa/Accra", region: "West" },
  { code: "GN", name: "Guinea", capital: "Conakry", currency: "GNF", currencyName: "Guinean franc", languages: "French, Pular, Maninka, Susu", dial: "+224", tz: "Africa/Conakry", region: "West" },
  { code: "GW", name: "Guinea-Bissau", capital: "Bissau", currency: "XOF", currencyName: "West African CFA franc", languages: "Portuguese, Guinea-Bissau Creole", dial: "+245", tz: "Africa/Bissau", region: "West" },
  { code: "KE", name: "Kenya", capital: "Nairobi", currency: "KES", currencyName: "Kenyan shilling", languages: "Swahili, English", dial: "+254", tz: "Africa/Nairobi", region: "East" },
  { code: "LS", name: "Lesotho", capital: "Maseru", currency: "LSL", currencyName: "Lesotho loti (South African rand also accepted)", languages: "Sesotho, English", dial: "+266", tz: "Africa/Maseru", region: "Southern" },
  { code: "LR", name: "Liberia", capital: "Monrovia", currency: "LRD", currencyName: "Liberian dollar (US dollar also used)", languages: "English, Liberian Kreyol", dial: "+231", tz: "Africa/Monrovia", region: "West" },
  { code: "LY", name: "Libya", capital: "Tripoli", currency: "LYD", currencyName: "Libyan dinar", languages: "Arabic, Tamazight", dial: "+218", tz: "Africa/Tripoli", region: "North" },
  { code: "MG", name: "Madagascar", capital: "Antananarivo", currency: "MGA", currencyName: "Malagasy ariary", languages: "Malagasy, French", dial: "+261", tz: "Indian/Antananarivo", region: "East" },
  { code: "MW", name: "Malawi", capital: "Lilongwe", currency: "MWK", currencyName: "Malawian kwacha", languages: "English, Chichewa", dial: "+265", tz: "Africa/Blantyre", region: "Southern" },
  { code: "ML", name: "Mali", capital: "Bamako", currency: "XOF", currencyName: "West African CFA franc", languages: "Bambara and other national languages; French as working language", dial: "+223", tz: "Africa/Bamako", region: "West" },
  { code: "MR", name: "Mauritania", capital: "Nouakchott", currency: "MRU", currencyName: "Mauritanian ouguiya", languages: "Arabic, Pulaar, Soninke, Wolof; French widely used", dial: "+222", tz: "Africa/Nouakchott", region: "North" },
  { code: "MU", name: "Mauritius", capital: "Port Louis", currency: "MUR", currencyName: "Mauritian rupee", languages: "English, French, Mauritian Creole", dial: "+230", tz: "Indian/Mauritius", region: "East" },
  { code: "MA", name: "Morocco", capital: "Rabat", currency: "MAD", currencyName: "Moroccan dirham", languages: "Arabic, Tamazight; French widely used", dial: "+212", tz: "Africa/Casablanca", region: "North" },
  { code: "MZ", name: "Mozambique", capital: "Maputo", currency: "MZN", currencyName: "Mozambican metical", languages: "Portuguese, Emakhuwa, Xichangana", dial: "+258", tz: "Africa/Maputo", region: "Southern" },
  { code: "NA", name: "Namibia", capital: "Windhoek", currency: "NAD", currencyName: "Namibian dollar", languages: "English, Oshiwambo, Afrikaans", dial: "+264", tz: "Africa/Windhoek", region: "Southern" },
  { code: "NE", name: "Niger", capital: "Niamey", currency: "XOF", currencyName: "West African CFA franc", languages: "Hausa, Zarma, Fula, French", dial: "+227", tz: "Africa/Niamey", region: "West" },
  { code: "NG", name: "Nigeria", capital: "Abuja", currency: "NGN", currencyName: "Nigerian naira", languages: "English, Hausa, Yoruba, Igbo, Nigerian Pidgin", dial: "+234", tz: "Africa/Lagos", region: "West" },
  { code: "RW", name: "Rwanda", capital: "Kigali", currency: "RWF", currencyName: "Rwandan franc", languages: "Kinyarwanda, English, French, Swahili", dial: "+250", tz: "Africa/Kigali", region: "East" },
  { code: "ST", name: "São Tomé and Príncipe", capital: "São Tomé", currency: "STN", currencyName: "São Tomé and Príncipe dobra", languages: "Portuguese, Forro", dial: "+239", tz: "Africa/Sao_Tome", region: "Central" },
  { code: "SN", name: "Senegal", capital: "Dakar", currency: "XOF", currencyName: "West African CFA franc", languages: "French, Wolof, Pulaar, Serer", dial: "+221", tz: "Africa/Dakar", region: "West" },
  { code: "SC", name: "Seychelles", capital: "Victoria", currency: "SCR", currencyName: "Seychellois rupee", languages: "Seychellois Creole, English, French", dial: "+248", tz: "Indian/Mahe", region: "East" },
  { code: "SL", name: "Sierra Leone", capital: "Freetown", currency: "SLE", currencyName: "Sierra Leonean leone", languages: "English, Krio", dial: "+232", tz: "Africa/Freetown", region: "West" },
  { code: "SO", name: "Somalia", capital: "Mogadishu", currency: "SOS", currencyName: "Somali shilling (US dollar widely used)", languages: "Somali, Arabic", dial: "+252", tz: "Africa/Mogadishu", region: "East" },
  { code: "ZA", name: "South Africa", capital: "Pretoria (executive), Cape Town (legislative), Bloemfontein (judicial)", currency: "ZAR", currencyName: "South African rand", languages: "12 official, incl. isiZulu, isiXhosa, Afrikaans, English, Sepedi, Setswana, Sesotho, SA Sign Language", dial: "+27", tz: "Africa/Johannesburg", region: "Southern" },
  { code: "SS", name: "South Sudan", capital: "Juba", currency: "SSP", currencyName: "South Sudanese pound", languages: "English, Juba Arabic, Dinka, Nuer", dial: "+211", tz: "Africa/Juba", region: "East" },
  { code: "SD", name: "Sudan", capital: "Khartoum", currency: "SDG", currencyName: "Sudanese pound", languages: "Arabic, English", dial: "+249", tz: "Africa/Khartoum", region: "North" },
  { code: "TZ", name: "Tanzania", capital: "Dodoma (largest city: Dar es Salaam)", currency: "TZS", currencyName: "Tanzanian shilling", languages: "Swahili, English", dial: "+255", tz: "Africa/Dar_es_Salaam", region: "East" },
  { code: "TG", name: "Togo", capital: "Lomé", currency: "XOF", currencyName: "West African CFA franc", languages: "French, Ewe, Kabiyè", dial: "+228", tz: "Africa/Lome", region: "West" },
  { code: "TN", name: "Tunisia", capital: "Tunis", currency: "TND", currencyName: "Tunisian dinar", languages: "Arabic; French widely used", dial: "+216", tz: "Africa/Tunis", region: "North" },
  { code: "UG", name: "Uganda", capital: "Kampala", currency: "UGX", currencyName: "Ugandan shilling", languages: "English, Swahili, Luganda", dial: "+256", tz: "Africa/Kampala", region: "East" },
  { code: "ZM", name: "Zambia", capital: "Lusaka", currency: "ZMW", currencyName: "Zambian kwacha", languages: "English, Bemba, Nyanja, Tonga, Lozi", dial: "+260", tz: "Africa/Lusaka", region: "Southern" },
  { code: "ZW", name: "Zimbabwe", capital: "Harare", currency: "ZWG", currencyName: "Zimbabwe Gold (ZiG); US dollar widely used", languages: "English, Shona, Ndebele and 13 others", dial: "+263", tz: "Africa/Harare", region: "Southern" },
];

export function findCountry(query: string | null | undefined): Country | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return COUNTRIES.find(
    (c) =>
      c.code.toLowerCase() === q ||
      c.name.toLowerCase() === q ||
      c.name.toLowerCase().replace(/[^a-z]/g, "") === q.replace(/[^a-z]/g, ""),
  ) ??
    COUNTRIES.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.name.toLowerCase()));
}
