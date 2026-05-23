import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Dribbble, Figma, Github, Linkedin, Mail } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Haqqımızda — Voltix" },
      { name: "description", content: "Voltix komandası və ağıllı enerji idarəetməsini dəstəkləyən texnologiyalar." },
    ],
  }),
  component: About,
});

const team = [
  {
    name: "Fatima Alizade",
    role: "Komanda rəhbəri və full stack developer",
    bio: "Layihə idarəetməsi, əsas sayt funksiyaları, idarə paneli, autentifikasiya və backend inkişafına cavabdehdir.",
    socials: [Github, Linkedin, Mail],
  },
  {
    name: "Sevda Mammadova",
    role: "Frontend developer",
    bio: "Frontend inkişafı, səhifələrin hazırlanması, responsive dizayn və istifadəçi interfeysi funksionallığı üzərində işləyir.",
    socials: [Github, Linkedin, Mail],
  },
  {
    name: "Ramazan Guluzade",
    role: "UI/UX dizayner",
    bio: "UI/UX dizayn, istifadəçi təcrübəsinin yaxşılaşdırılması, rəng palitrası, struktur və vizual istiqamətə cavabdehdir.",
    socials: [Figma, Dribbble, Linkedin],
  },
  {
    name: "Fidan Salmanova",
    role: "Kreativ UI dizayner",
    bio: "Vizual elementlər, animasiyalar, ikonlar, modern komponent dizaynları və estetik istifadəçi təcrübəsi yaradır.",
    socials: [Figma, Dribbble, Linkedin],
  },
];

function About() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <MarketingNav />
      <main className="mx-auto max-w-6xl px-6 pt-16">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            {t("aboutTitleStart")} <span className="text-gradient">{t("aboutTitleHighlight")}</span> {t("aboutTitleEnd")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            {t("aboutDescription")}
          </p>
        </motion.section>

        <section className="mt-16">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-3">Komanda</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{t("ourTeam")}</h2>
            <p className="mt-3 text-muted-foreground">
              Voltix-ni startup keyfiyyətində məhsula çevirən inkişaf, dizayn və istifadəçi təcrübəsi komandası.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {team.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                whileHover={{ y: -8, scale: 1.015 }}
              >
                <Card className="group relative h-full overflow-hidden glass-strong transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-x-0 top-0 h-24 opacity-80" style={{ background: "var(--gradient-hero)" }} />
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl transition-transform duration-500 group-hover:scale-150" />
                  <CardHeader className="relative items-center pt-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110" style={{ background: "var(--gradient-blue)" }}>
                      {m.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                    </div>
                    <CardTitle className="text-lg">{m.name}</CardTitle>
                    <Badge className="justify-center text-center">{m.role}</Badge>
                  </CardHeader>
                  <CardContent className="relative flex h-full flex-col gap-5">
                    <p className="text-center text-sm leading-6 text-muted-foreground">{m.bio}</p>
                    <div className="mt-auto flex justify-center gap-2 border-t pt-4">
                      {m.socials.map((Icon, index) => (
                        <span key={`${m.name}-${index}`} className="flex h-9 w-9 items-center justify-center rounded-full border bg-background/50 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-3xl glass p-10 text-center">
          <h3 className="text-2xl font-bold">{t("readyTitle")}</h3>
          <p className="mt-2 text-muted-foreground">{t("readyDescription")}</p>
          <Link to="/auth" className="mt-5 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover-lift">
            {t("getStarted")}
          </Link>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
