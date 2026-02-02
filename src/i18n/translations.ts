// Rimon CRM Translations - Hebrew & English

export const translations = {
  en: {
    // Greeting
    greeting: 'Hi',
    welcome: 'Welcome back',

    // Dashboard
    news: 'News',
    onTheWay: 'On the Way...',
    whatsOnYourMind: "What's on your mind?",
    lastReport: 'Last Report',
    support: 'Support',

    // Actions
    record: 'Record',
    send: 'Send',
    search: 'Search',
    attachFile: 'Attach file',
    attachImage: 'Attach image',

    // Events
    participants: 'participants',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',

    // Input placeholders
    typeMessage: 'Type a message or record voice...',
    searchPlaceholder: 'Search contacts, events, tasks...',

    // Notifications
    newContact: 'New contact added',
    newTask: 'New task created',
    newEvent: 'New event scheduled',
    registered: 'registered for',

    // Settings
    settings: 'Settings',
    language: 'Language',
    hebrew: 'Hebrew',
    english: 'English',
    whatsappEnabled: 'WhatsApp Integration',
    notifications: 'Notifications',

    // Bottom bar
    home: 'Home',
    contacts: 'Contacts',
    tasks: 'Tasks',
    calendar: 'Calendar',

    // Voice recording
    recording: 'Recording...',
    tapToStop: 'Tap to stop',
    processing: 'Processing...',

    // Days
    sunday: 'Sunday',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',

    // Months
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
  he: {
    // Greeting
    greeting: 'שלום',
    welcome: 'ברוך שובך',

    // Dashboard
    news: 'חדשות',
    onTheWay: 'בדרך...',
    whatsOnYourMind: 'מה עובר לך בראש?',
    lastReport: 'דיווח אחרון',
    support: 'תמיכה',

    // Actions
    record: 'הקלט',
    send: 'שלח',
    search: 'חיפוש',
    attachFile: 'צרף קובץ',
    attachImage: 'צרף תמונה',

    // Events
    participants: 'משתתפים',
    today: 'היום',
    tomorrow: 'מחר',
    thisWeek: 'השבוע',

    // Input placeholders
    typeMessage: 'הקלד הודעה או הקלט קול...',
    searchPlaceholder: 'חפש אנשי קשר, אירועים, משימות...',

    // Notifications
    newContact: 'איש קשר חדש נוסף',
    newTask: 'משימה חדשה נוצרה',
    newEvent: 'אירוע חדש נקבע',
    registered: 'נרשם/ה ל',

    // Settings
    settings: 'הגדרות',
    language: 'שפה',
    hebrew: 'עברית',
    english: 'אנגלית',
    whatsappEnabled: 'חיבור לוואטסאפ',
    notifications: 'התראות',

    // Bottom bar
    home: 'בית',
    contacts: 'אנשי קשר',
    tasks: 'משימות',
    calendar: 'יומן',

    // Voice recording
    recording: 'מקליט...',
    tapToStop: 'הקש לעצירה',
    processing: 'מעבד...',

    // Days
    sunday: 'יום ראשון',
    monday: 'יום שני',
    tuesday: 'יום שלישי',
    wednesday: 'יום רביעי',
    thursday: 'יום חמישי',
    friday: 'יום שישי',
    saturday: 'שבת',

    // Months
    january: 'ינואר',
    february: 'פברואר',
    march: 'מרץ',
    april: 'אפריל',
    may: 'מאי',
    june: 'יוני',
    july: 'יולי',
    august: 'אוגוסט',
    september: 'ספטמבר',
    october: 'אוקטובר',
    november: 'נובמבר',
    december: 'דצמבר',
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
