import { useMemo, useState } from "react";
import { Bot, Globe2, MessageCircle, Send, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { languages, type Language, useI18n } from "@/lib/i18n";

type Message = { role: "bot" | "user"; text: string };

type ChatCopy = {
  title: string;
  subtitle: string;
  placeholder: string;
  language: string;
  welcome: string;
  fallback: string;
  suggestions: string[];
  answers: { keywords: string[]; answer: string }[];
};

const chatCopy: Record<Language, ChatCopy> = {
  az: {
    title: "VoltX köməkçisi",
    subtitle: "Enerji, cihazlar və hesabatlar üzrə cavablar",
    placeholder: "Sualınızı yazın...",
    language: "Dil",
    welcome: "Salam! Mən enerji istifadəsi, cihaz monitorinqi, hesab ayarları və hesabatlarla bağlı suallarınızı cavablandıra bilərəm.",
    fallback: "Bu sualı tam anlamadım. Enerji istifadəsi, cihazlar, hesabatlar, hesab ayarları və ya qənaət tövsiyələri haqqında soruşa bilərsiniz.",
    suggestions: ["Bu ay nə qədər enerji istifadə etmişəm?", "PDF hesabatı necə yükləyim?", "Cihaz monitorinqi necə işləyir?"],
    answers: [
      { keywords: ["enerji", "istifadə", "kwh", "gündəlik", "aylıq"], answer: "Dashboard gündəlik və aylıq kWh istifadəsini, canlı gücü, saatlıq pikləri və 30 günlük trendləri göstərir." },
      { keywords: ["qiymət", "xərc", "pul", "tarif"], answer: "Sistem kWh istifadəsini elektrik tarifi ilə hesablayaraq təxmini aylıq xərci göstərir." },
      { keywords: ["cihaz", "monitor", "aktiv", "söndür"], answer: "Cihazlar bölməsində hər cihazın gücü, gündəlik işləmə saatı və aktiv/passiv statusu izlənir." },
      { keywords: ["pdf", "excel", "hesabat", "yüklə"], answer: "Hesabatlar bölməsindən professional PDF və Excel hesabatlarını yükləyə bilərsiniz. Hesabatlarda xülasə, cədvəllər və cihaz statistikası var." },
      { keywords: ["hesab", "ayar", "profil", "parol"], answer: "Account və Settings bölmələrində profil məlumatlarını, görünüş rejimini və hesab seçimlərini idarə edə bilərsiniz." },
      { keywords: ["co2", "karbon", "qənaət", "azalt"], answer: "VoltX qənaət edilmiş enerji faizini və CO₂ azalma göstəricisini hesablayaraq ətraf mühit təsirinizi göstərir." },
    ],
  },
  en: {
    title: "VoltX assistant",
    subtitle: "Answers about energy, devices, and reports",
    placeholder: "Type your question...",
    language: "Language",
    welcome: "Hi! I can answer questions about energy usage, device monitoring, account settings, reports, and savings recommendations.",
    fallback: "I did not fully understand that. You can ask about energy usage, devices, reports, account settings, or saving tips.",
    suggestions: ["How much energy did I use this month?", "How do I download a PDF report?", "How does device monitoring work?"],
    answers: [
      { keywords: ["energy", "usage", "kwh", "daily", "monthly"], answer: "The dashboard shows daily and monthly kWh usage, live power, hourly peaks, and 30-day trends." },
      { keywords: ["cost", "price", "bill", "tariff"], answer: "VoltX estimates monthly electricity cost by multiplying your kWh usage by the configured energy tariff." },
      { keywords: ["device", "monitor", "active", "turn off"], answer: "The Devices section tracks each appliance's power rating, daily runtime, and active/inactive status." },
      { keywords: ["pdf", "excel", "report", "download"], answer: "Open Reports to download professional PDF and Excel files with summaries, tables, and device statistics." },
      { keywords: ["account", "settings", "profile", "password"], answer: "Use Account and Settings to manage profile details, appearance mode, and account preferences." },
      { keywords: ["co2", "carbon", "saved", "reduce"], answer: "VoltX estimates saved energy percentage and carbon emission reduction to show your environmental impact." },
    ],
  },
  tr: {
    title: "VoltX asistanı",
    subtitle: "Enerji, cihazlar ve raporlar hakkında cevaplar",
    placeholder: "Sorunuzu yazın...",
    language: "Dil",
    welcome: "Merhaba! Enerji kullanımı, cihaz izleme, hesap ayarları, raporlar ve tasarruf önerileri hakkında sorularınızı yanıtlayabilirim.",
    fallback: "Bu soruyu tam anlayamadım. Enerji kullanımı, cihazlar, raporlar, hesap ayarları veya tasarruf ipuçları hakkında sorabilirsiniz.",
    suggestions: ["Bu ay ne kadar enerji kullandım?", "PDF raporu nasıl indiririm?", "Cihaz izleme nasıl çalışır?"],
    answers: [
      { keywords: ["enerji", "kullanım", "kwh", "günlük", "aylık"], answer: "Dashboard günlük ve aylık kWh kullanımını, canlı gücü, saatlik zirveleri ve 30 günlük trendleri gösterir." },
      { keywords: ["maliyet", "fiyat", "fatura", "tarife"], answer: "VoltX, kWh kullanımınızı enerji tarifesiyle çarparak tahmini aylık elektrik maliyetini hesaplar." },
      { keywords: ["cihaz", "izleme", "aktif", "kapat"], answer: "Cihazlar bölümünde her cihazın gücü, günlük çalışma süresi ve aktif/pasif durumu izlenir." },
      { keywords: ["pdf", "excel", "rapor", "indir"], answer: "Reports bölümünden özetler, tablolar ve cihaz istatistikleri içeren profesyonel PDF ve Excel dosyaları indirebilirsiniz." },
      { keywords: ["hesap", "ayar", "profil", "şifre"], answer: "Account ve Settings bölümlerinden profil bilgilerini, görünüm modunu ve hesap tercihlerini yönetebilirsiniz." },
      { keywords: ["co2", "karbon", "tasarruf", "azalt"], answer: "VoltX, çevresel etkinizi göstermek için tasarruf edilen enerji yüzdesini ve karbon emisyonu azalmasını hesaplar." },
    ],
  },
  ru: {
    title: "Помощник VoltX",
    subtitle: "Ответы об энергии, устройствах и отчётах",
    placeholder: "Введите вопрос...",
    language: "Язык",
    welcome: "Здравствуйте! Я могу отвечать на вопросы об энергопотреблении, мониторинге устройств, настройках аккаунта, отчётах и рекомендациях по экономии.",
    fallback: "Я не до конца понял вопрос. Вы можете спросить об энергии, устройствах, отчётах, настройках аккаунта или советах по экономии.",
    suggestions: ["Сколько энергии я использовал за месяц?", "Как скачать PDF отчёт?", "Как работает мониторинг устройств?"],
    answers: [
      { keywords: ["энерг", "расход", "квт", "день", "месяц"], answer: "Панель показывает дневное и месячное потребление кВт⋅ч, текущую мощность, пиковые часы и тренды за 30 дней." },
      { keywords: ["стоим", "цена", "счет", "тариф"], answer: "VoltX оценивает месячную стоимость электричества, умножая потребление кВт⋅ч на тариф." },
      { keywords: ["устрой", "монитор", "актив", "выключ"], answer: "Раздел Devices отслеживает мощность, время работы и активный/неактивный статус каждого прибора." },
      { keywords: ["pdf", "excel", "отчет", "скач"], answer: "В разделе Reports можно скачать профессиональные PDF и Excel файлы со сводками, таблицами и статистикой устройств." },
      { keywords: ["аккаунт", "настрой", "профиль", "пароль"], answer: "В Account и Settings можно управлять профилем, режимом отображения и настройками аккаунта." },
      { keywords: ["co2", "углерод", "эконом", "сниз"], answer: "VoltX рассчитывает процент сэкономленной энергии и снижение выбросов CO₂, чтобы показать экологический эффект." },
    ],
  },
};

function findAnswer(language: Language, question: string) {
  const normalized = question.toLowerCase();
  const copy = chatCopy[language];
  return copy.answers.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))?.answer ?? copy.fallback;
}

export function SmartChatbot() {
  const { language, setLanguage } = useI18n();
  const copy = chatCopy[language];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: copy.welcome }]);

  const activeLanguage = useMemo(() => languages.find((item) => item.code === language) ?? languages[0], [language]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((items) => [...items, { role: "user", text: trimmed }, { role: "bot", text: findAnswer(language, trimmed) }]);
    setInput("");
  };

  const switchLanguage = (code: Language) => {
    setLanguage(code);
    setMessages((items) => [...items, { role: "bot", text: chatCopy[code].welcome }]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-4 w-[min(92vw,390px)] overflow-hidden rounded-3xl border bg-card shadow-2xl">
          <div className="flex items-start justify-between gap-3 p-4" style={{ background: "var(--gradient-hero)", color: "white" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15"><Bot className="h-5 w-5" /></div>
              <div>
                <p className="font-semibold">{copy.title}</p>
                <p className="text-xs text-white/80">{copy.subtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 hover:text-white" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="flex items-center gap-2 border-b p-3">
            <Globe2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{copy.language}</span>
            <div className="ml-auto flex gap-1">
              {languages.map((item) => (
                <button key={item.code} onClick={() => switchLanguage(item.code)} className={`rounded-full px-2 py-1 text-xs transition ${item.code === activeLanguage.code ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  {item.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ScrollArea className="h-80 p-4">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "bot" && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-3.5 w-3.5 text-primary" /></div>}
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{message.text}</div>
                  {message.role === "user" && <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary"><User className="h-3.5 w-3.5" /></div>}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex flex-wrap gap-2 border-t p-3">
            {copy.suggestions.map((suggestion) => (
              <button key={suggestion} onClick={() => ask(suggestion)} className="rounded-full border px-3 py-1 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
                {suggestion}
              </button>
            ))}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); ask(input); }} className="flex gap-2 border-t p-3">
            <Input value={input} onChange={(event) => setInput(event.target.value)} placeholder={copy.placeholder} />
            <Button type="submit" size="icon"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      )}
      <Button onClick={() => setOpen((value) => !value)} size="lg" className="h-14 rounded-full gap-2 shadow-2xl">
        <MessageCircle className="h-5 w-5" />
        Çat
      </Button>
    </div>
  );
}
