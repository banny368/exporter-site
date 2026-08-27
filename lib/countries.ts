/**
 * Destination countries for the inquiry form.
 *
 * Not an exhaustive ISO list — these are the markets an Indian exporter of produce,
 * spices and furniture actually ships to, plus the major economies. A buyer whose
 * country is missing can type it into the message field, and the form says so.
 */
export interface Country {
  code: string;
  name: string;
  flag: string;
  dial: string;
}

export const COUNTRIES: Country[] = [
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dial: "+968" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dial: "+974" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dial: "+965" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dial: "+973" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dial: "+31" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dial: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dial: "+34" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dial: "+39" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dial: "+45" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dial: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dial: "+47" },
  { code: "PL", name: "Poland", flag: "🇵🇱", dial: "+48" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", dial: "+32" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351" },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dial: "+52" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dial: "+55" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dial: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dial: "+82" },
  { code: "CN", name: "China", flag: "🇨🇳", dial: "+86" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dial: "+61" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dial: "+64" },
  { code: "RU", name: "Russia", flag: "🇷🇺", dial: "+7" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿", dial: "+7" },
  { code: "UZ", name: "Uzbekistan", flag: "🇺🇿", dial: "+998" },
  { code: "TR", name: "Türkiye", flag: "🇹🇷", dial: "+90" },
  { code: "IR", name: "Iran", flag: "🇮🇷", dial: "+98" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", dial: "+964" },
  { code: "JO", name: "Jordan", flag: "🇯🇴", dial: "+962" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧", dial: "+961" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", dial: "+20" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", dial: "+212" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dial: "+27" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", dial: "+254" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬", dial: "+234" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dial: "+880" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dial: "+94" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dial: "+977" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dial: "+960" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dial: "+92" },
  { code: "IN", name: "India", flag: "🇮🇳", dial: "+91" },
];

export const INCOTERMS = ["EXW", "FOB", "CFR", "CIF", "CIP", "DDP", "Not sure yet"] as const;
