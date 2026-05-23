import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "az" | "en" | "tr" | "ru";

type TranslationValue = string | string[] | Record<string, unknown>;
type TranslationTree = Record<string, TranslationValue>;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <T = string>(key: string) => T;
};

export const languages: { code: Language; label: string; nativeName: string; flag: string }[] = [
  { code: "az", label: "Azerbaijani", nativeName: "Azərbaycan", flag: "🇦🇿" },
  { code: "en", label: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "tr", label: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ru", label: "Russian", nativeName: "Русский", flag: "🇷🇺" },
];

const translations: Record<Language, TranslationTree> = {
  az: {
    navHome: "Ana səhifə",
    navAbout: "Haqqımızda",
    navContact: "Əlaqə",
    signIn: "Daxil ol",
    getStarted: "Başla",
    toggleTheme: "Mövzunu dəyiş",
    language: "Dil",
    languageSelector: "Dil seçimi",
    heroBadge: "Süni intellektlə enerji analitikası",
    heroTitleStart: "Evinizin enerjisini",
    heroTitleHighlight: "daha ağıllı",
    heroTitleEnd: "idarə edin",
    heroDescription: "Elektrik istifadənizi ağıllı şəkildə izləyin və enerji israfını azaldın. VoltX xam məlumatları aydın, icra edilə bilən tövsiyələrə çevirir.",
    liveDemo: "Canlı demo",
    liveUsage: "Canlı istifadə — son 24 saat",
    activeHomes: "Aktiv evlər",
    kwhMonitored: "İzlənən kWh",
    co2Saved: "Qənaət edilən CO₂ tonu",
    featuresTitle: "Enerjiyə qənaət üçün lazım olan hər şey",
    featuresDescription: "Evinizin enerjidən necə istifadə etdiyini anlamaq, idarə etmək və optimallaşdırmaq üçün tam alətlər dəsti.",
    features: [
      "Real vaxt monitorinqi|Canlı gərginlik, cari istifadə və aktiv cihazlar hər saniyə yenilənir.",
      "Zəngin analitika|Gündəlik, həftəlik və aylıq trendlər, pik saat analizi ilə.",
      "Ağıllı tövsiyələr|İstifadə vərdişlərinizdən öyrənən fərdiləşdirilmiş məsləhətlər.",
      "CO₂ təsir izləyicisi|Karbon izinizi və nə qədər kompensasiya etdiyinizi görün.",
      "Məxfi və təhlükəsiz|Bank səviyyəli şifrələmə və istifadəçi üzrə məlumat izolyasiyası.",
      "Ağıllı evə hazır|Cihazları qoşun və qənaəti kod yazmadan avtomatlaşdırın.",
    ],
    ctaTitle: "Qənaətə bu gün başlayın",
    ctaDescription: "Pulsuz hesabınızı yaradın, cihazlarınızı əlavə edin və enerji xərclərinizin azalmasını izləyin.",
    createAccount: "Hesab yarat",
    footerDescription: "Müasir evlər üçün ağıllı enerji idarəetməsi.",
    product: "Məhsul",
    dashboard: "İdarə paneli",
    company: "Şirkət",
    footerCare: "Diqqətlə hazırlanıb.",
    aboutTitleStart: "Enerjini",
    aboutTitleHighlight: "görünən",
    aboutTitleEnd: "etmək üçün qurulub",
    aboutDescription: "VoltX-nin missiyası sadədir: hər bir ev təsərrüfatına xoş və ağıllı alətlərlə elektrik istehlakını anlamağa və azaltmağa kömək etmək.",
    ourTeam: "Komandamız",
    teamLeader: "Komanda rəhbəri",
    engineer: "Mühəndis",
    technologies: "Texnologiyalar",
    readyTitle: "İdarəni ələ almağa hazırsınız?",
    readyDescription: "Hesabınızı yaradın və idarə panelini kəşf edin.",
    contactTitle: "Bizimlə əlaqə",
    contactDescription: "Sizdən xəbər almaqdan məmnun olarıq. Bizə yazın, ən qısa zamanda cavab verəcəyik.",
    email: "E-poçt",
    phone: "Telefon",
    location: "Məkan",
    baku: "Bakı, Azərbaycan",
    sendMessageTitle: "Bizə mesaj göndərin",
    name: "Ad",
    message: "Mesaj",
    sendMessage: "Mesaj göndər",
    contactSuccess: "Təşəkkürlər! Tezliklə sizinlə əlaqə saxlayacağıq.",
    faqTitle: "Tez-tez verilən suallar",
    faqDescription: "Enerji istifadəsi, cihaz monitorinqi, hesab ayarları, hesabatlar və sistem xüsusiyyətləri haqqında sürətli cavablar.",
    faqs: [
      "Enerji istifadəm necə hesablanır?|VoltX cihaz gücü, gündəlik işləmə saatı və canlı monitorinq məlumatlarını birləşdirərək kWh istifadəsini hesablayır.",
      "Cihaz monitorinqi nə göstərir?|Hər cihazın aktiv statusu, gücü, gündəlik işləmə müddəti və aylıq enerji payı göstərilir.",
      "Hesabatları necə yükləyə bilərəm?|Hesabatlar bölməsində PDF və Excel düymələrindən istifadə edərək peşəkar hesabatları yükləyə bilərsiniz.",
      "CO₂ azalması necə hesablanır?|Sistem qənaət edilən kWh dəyərini karbon emissiya əmsalı ilə müqayisə edir.",
      "Hesab ayarlarını haradan dəyişə bilərəm?|Parametrlər və Profil bölmələrində şəxsi məlumatlarınızı və tətbiq seçimlərinizi idarə edə bilərsiniz.",
      "Premium abunəlik nə verir?|Premium plan benchmark, anomaliya analizi, tarif optimallaşdırması və daha detallı hesabat imkanlarını açır.",
      "Kart məlumatlarım saxlanılırmı?|Xeyr. Kart sahələri yalnız format yoxlaması üçün istifadə olunur və məlumatlar brauzerdən kənara göndərilmir.",
      "Benchmark göstəriciləri necə işləyir?|Sistem sizin sərfiyyatınızı oxşar müəssisələr və qonşu obyektlərin simulyasiya edilmiş orta göstəriciləri ilə müqayisə edir.",
      "Anomaliya xəbərdarlıqları realdırmı?|Demo rejimində SMS və push xəbərdarlıqları simulyasiya olunur, real inteqrasiyada isə bildiriş kanallarına qoşula bilər.",
      "Gecə tarifi necə optimallaşdırılır?|VoltX gündüz və gecə tariflərini müqayisə edərək enerji tutumlu işləri daha ucuz saatlara planlamağı tövsiyə edir.",
      "Dil seçimini dəyişə bilərəmmi?|Bəli. Dil seçimi menyusundan Azərbaycan, İngilis, Türk və Rus dilləri arasında keçid edə bilərsiniz.",
      "Məlumatlarım təhlükəsizdirmi?|İstifadəçi məlumatları sessiya və verilənlər bazası səviyyəsində ayrılır, şəxsi cihaz məlumatları digər istifadəçilərə göstərilmir.",
    ],
    notFoundTitle: "Səhifə tapılmadı",
    notFoundDescription: "Axtardığınız səhifə mövcud deyil.",
    goHome: "Ana səhifəyə qayıt",
    errorTitle: "Nəsə xəta baş verdi",
    tryAgain: "Yenidən cəhd et",
  },
  en: {
    navHome: "Home", navAbout: "About", navContact: "Contact", signIn: "Sign in", getStarted: "Get started", toggleTheme: "Toggle theme", language: "Language", languageSelector: "Language selector", heroBadge: "AI-powered energy intelligence", heroTitleStart: "Power your home,", heroTitleHighlight: "smarter", heroTitleEnd: "", heroDescription: "Monitor your electricity usage intelligently and reduce energy waste. VoltX turns raw data into clear, actionable insights.", liveDemo: "Live demo", liveUsage: "Live usage — last 24 hours", activeHomes: "Active homes", kwhMonitored: "kWh monitored", co2Saved: "Tons of CO₂ saved", featuresTitle: "Everything you need to save energy", featuresDescription: "A complete toolkit for understanding, controlling, and optimizing how your home uses power.", features: ["Real-time monitoring|Live voltage, current usage, and active devices update every second.", "Rich analytics|Daily, weekly and monthly trends with peak-hour analysis.", "AI recommendations|Personalized tips that learn from your usage patterns.", "CO₂ impact tracker|See your carbon footprint and how much you've offset.", "Private & secure|Bank-grade encryption and per-user data isolation.", "Smart home ready|Connect appliances and automate savings without code."], ctaTitle: "Start saving today", ctaDescription: "Create your free account, add your devices, and watch your energy bill shrink.", createAccount: "Create account", footerDescription: "Smart energy management for modern homes.", product: "Product", dashboard: "Dashboard", company: "Company", footerCare: "Designed with care.", aboutTitleStart: "Built to make energy", aboutTitleHighlight: "visible", aboutTitleEnd: "", aboutDescription: "VoltX's mission is simple: help every household understand and reduce its electricity consumption with delightful, intelligent tools.", ourTeam: "Our team", teamLeader: "Team Leader", engineer: "Engineer", technologies: "Technologies", readyTitle: "Ready to take control?", readyDescription: "Create your account and explore the dashboard.", contactTitle: "Contact us", contactDescription: "We'd love to hear from you. Drop us a line and we'll respond as soon as possible.", email: "Email", phone: "Phone", location: "Location", baku: "Baku, Azerbaijan", sendMessageTitle: "Send us a message", name: "Name", message: "Message", sendMessage: "Send message", contactSuccess: "Thanks! We'll get back to you shortly.", faqTitle: "Frequently Asked Questions", faqDescription: "Quick answers about energy usage, device monitoring, account settings, reports, and platform features.", faqs: ["How is my energy usage calculated?|VoltX combines device wattage, daily runtime, and monitoring data to estimate kWh usage.", "What does device monitoring show?|It shows each device's active status, power rating, daily runtime, and monthly energy share.", "How can I download reports?|Use the PDF and Excel buttons in Reports to download professional energy reports.", "How is CO₂ reduction calculated?|The system compares saved kWh against a carbon emission factor to estimate reduced emissions.", "Where can I change account settings?|Use Settings and Profile to manage personal information and application preferences."], notFoundTitle: "Page not found", notFoundDescription: "The page you're looking for doesn't exist.", goHome: "Go home", errorTitle: "Something went wrong", tryAgain: "Try again",
  },
  tr: {
    navHome: "Ana sayfa", navAbout: "Hakkımızda", navContact: "İletişim", signIn: "Giriş yap", getStarted: "Başla", toggleTheme: "Temayı değiştir", language: "Dil", languageSelector: "Dil seçici", heroBadge: "Yapay zekâ destekli enerji zekâsı", heroTitleStart: "Evinizin enerjisini", heroTitleHighlight: "daha akıllı", heroTitleEnd: "yönetin", heroDescription: "Elektrik kullanımınızı akıllıca izleyin ve enerji israfını azaltın. VoltX ham verileri açık, uygulanabilir içgörülere dönüştürür.", liveDemo: "Canlı demo", liveUsage: "Canlı kullanım — son 24 saat", activeHomes: "Aktif evler", kwhMonitored: "İzlenen kWh", co2Saved: "Tasarruf edilen CO₂ tonu", featuresTitle: "Enerji tasarrufu için ihtiyacınız olan her şey", featuresDescription: "Evinizin enerjiyi nasıl kullandığını anlamak, kontrol etmek ve optimize etmek için eksiksiz araç seti.", features: ["Gerçek zamanlı izleme|Canlı voltaj, anlık kullanım ve aktif cihazlar her saniye güncellenir.", "Zengin analizler|Pik saat analiziyle günlük, haftalık ve aylık trendler.", "AI önerileri|Kullanım alışkanlıklarınızdan öğrenen kişiselleştirilmiş ipuçları.", "CO₂ etki izleyici|Karbon ayak izinizi ve ne kadar dengelediğinizi görün.", "Gizli ve güvenli|Banka düzeyinde şifreleme ve kullanıcı bazlı veri izolasyonu.", "Akıllı eve hazır|Cihazları bağlayın ve tasarrufu kod yazmadan otomatikleştirin."], ctaTitle: "Bugün tasarrufa başlayın", ctaDescription: "Ücretsiz hesabınızı oluşturun, cihazlarınızı ekleyin ve enerji faturanızın küçülmesini izleyin.", createAccount: "Hesap oluştur", footerDescription: "Modern evler için akıllı enerji yönetimi.", product: "Ürün", dashboard: "Kontrol paneli", company: "Şirket", footerCare: "Özenle tasarlandı.", aboutTitleStart: "Enerjiyi", aboutTitleHighlight: "görünür", aboutTitleEnd: "kılmak için geliştirildi", aboutDescription: "VoltX'nin misyonu basit: Her hanenin elektrik tüketimini keyifli ve akıllı araçlarla anlamasına ve azaltmasına yardımcı olmak.", ourTeam: "Ekibimiz", teamLeader: "Takım Lideri", engineer: "Mühendis", technologies: "Teknolojiler", readyTitle: "Kontrolü ele almaya hazır mısınız?", readyDescription: "Hesabınızı oluşturun ve kontrol panelini keşfedin.", contactTitle: "Bize ulaşın", contactDescription: "Sizden haber almayı çok isteriz. Bize yazın, en kısa sürede yanıtlayalım.", email: "E-posta", phone: "Telefon", location: "Konum", baku: "Bakü, Azerbaycan", sendMessageTitle: "Bize mesaj gönderin", name: "Ad", message: "Mesaj", sendMessage: "Mesaj gönder", contactSuccess: "Teşekkürler! Kısa süre içinde size döneceğiz.", faqTitle: "Sıkça Sorulan Sorular", faqDescription: "Enerji kullanımı, cihaz izleme, hesap ayarları, raporlar ve platform özellikleri hakkında hızlı cevaplar.", faqs: ["Enerji kullanımım nasıl hesaplanır?|VoltX cihaz gücü, günlük çalışma süresi ve izleme verilerini birleştirerek kWh kullanımını tahmin eder.", "Cihaz izleme ne gösterir?|Her cihazın aktif durumu, gücü, günlük çalışma süresi ve aylık enerji payını gösterir.", "Raporları nasıl indirebilirim?|Reports bölümündeki PDF ve Excel düğmeleriyle profesyonel enerji raporları indirebilirsiniz.", "CO₂ azalması nasıl hesaplanır?|Sistem tasarruf edilen kWh değerini karbon emisyon faktörüyle karşılaştırır.", "Hesap ayarlarını nereden değiştirebilirim?|Settings ve Profile bölümlerinden kişisel bilgileri ve uygulama tercihlerini yönetebilirsiniz."], notFoundTitle: "Sayfa bulunamadı", notFoundDescription: "Aradığınız sayfa mevcut değil.", goHome: "Ana sayfaya dön", errorTitle: "Bir şeyler ters gitti", tryAgain: "Tekrar dene",
  },
  ru: {
    navHome: "Главная", navAbout: "О нас", navContact: "Контакты", signIn: "Войти", getStarted: "Начать", toggleTheme: "Переключить тему", language: "Язык", languageSelector: "Выбор языка", heroBadge: "Энергетическая аналитика на базе ИИ", heroTitleStart: "Управляйте энергией дома", heroTitleHighlight: "умнее", heroTitleEnd: "", heroDescription: "Интеллектуально отслеживайте потребление электроэнергии и сокращайте потери. VoltX превращает сырые данные в понятные и полезные рекомендации.", liveDemo: "Живая демонстрация", liveUsage: "Текущее потребление — последние 24 часа", activeHomes: "Активные дома", kwhMonitored: "кВт⋅ч отслежено", co2Saved: "Тонн CO₂ сэкономлено", featuresTitle: "Всё для экономии энергии", featuresDescription: "Полный набор инструментов для понимания, контроля и оптимизации энергопотребления вашего дома.", features: ["Мониторинг в реальном времени|Напряжение, текущее потребление и активные устройства обновляются каждую секунду.", "Подробная аналитика|Дневные, недельные и месячные тренды с анализом пиковых часов.", "Рекомендации ИИ|Персональные советы, обучающиеся на ваших привычках потребления.", "Трекер влияния CO₂|Смотрите свой углеродный след и объём компенсации.", "Приватно и безопасно|Шифрование банковского уровня и изоляция данных по пользователям.", "Готово для умного дома|Подключайте приборы и автоматизируйте экономию без кода."], ctaTitle: "Начните экономить сегодня", ctaDescription: "Создайте бесплатный аккаунт, добавьте устройства и наблюдайте, как уменьшается счёт за энергию.", createAccount: "Создать аккаунт", footerDescription: "Умное управление энергией для современных домов.", product: "Продукт", dashboard: "Панель", company: "Компания", footerCare: "Создано с заботой.", aboutTitleStart: "Создано, чтобы сделать энергию", aboutTitleHighlight: "видимой", aboutTitleEnd: "", aboutDescription: "Миссия VoltX проста: помочь каждому дому понимать и сокращать потребление электроэнергии с помощью удобных интеллектуальных инструментов.", ourTeam: "Наша команда", teamLeader: "Руководитель команды", engineer: "Инженер", technologies: "Технологии", readyTitle: "Готовы взять контроль?", readyDescription: "Создайте аккаунт и изучите панель управления.", contactTitle: "Свяжитесь с нами", contactDescription: "Мы будем рады вашему сообщению. Напишите нам, и мы ответим как можно скорее.", email: "Email", phone: "Телефон", location: "Локация", baku: "Баку, Азербайджан", sendMessageTitle: "Отправьте нам сообщение", name: "Имя", message: "Сообщение", sendMessage: "Отправить сообщение", contactSuccess: "Спасибо! Мы скоро свяжемся с вами.", faqTitle: "Часто задаваемые вопросы", faqDescription: "Быстрые ответы об энергопотреблении, мониторинге устройств, настройках аккаунта, отчётах и функциях платформы.", faqs: ["Как рассчитывается энергопотребление?|VoltX объединяет мощность устройств, ежедневное время работы и данные мониторинга для оценки кВт⋅ч.", "Что показывает мониторинг устройств?|Он показывает активность, мощность, время работы и долю месячного потребления каждого устройства.", "Как скачать отчёты?|В разделе Reports используйте кнопки PDF и Excel для загрузки профессиональных отчётов.", "Как рассчитывается снижение CO₂?|Система сравнивает сэкономленные кВт⋅ч с коэффициентом выбросов углерода.", "Где изменить настройки аккаунта?|В Settings и Profile можно управлять личными данными и настройками приложения."], notFoundTitle: "Страница не найдена", notFoundDescription: "Страница, которую вы ищете, не существует.", goHome: "На главную", errorTitle: "Что-то пошло не так", tryAgain: "Попробовать снова",
  },
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "az";
  const stored = window.localStorage.getItem("voltx-language");
  return languages.some((language) => language.code === stored) ? (stored as Language) : "az";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("voltx-language", language);
  }, [language]);

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage: setLanguageState,
    t: <T = string>(key: string) => translations[language][key] as T,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
