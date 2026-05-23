import { Link, useRouterState } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme";
import { languages, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Globe2, Moon, Sun, Zap } from "lucide-react";

export function MarketingNav() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { theme, toggle } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const activeLanguage = languages.find((item) => item.code === language) ?? languages[0];
  const items: { to: string; label: string; external?: boolean }[] = [
    { to: "/", label: t("navHome") },
    { to: "/about", label: t("navAbout") },
    { to: "/faq", label: "FAQ", external: true },
    { to: "/contact", label: t("navContact") },
  ];
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl glass px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground" style={{ background: "var(--gradient-blue)" }}>
            <Zap className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">VoltX</span>
        </Link>
        <nav className="hidden gap-1 md:flex">
          {items.map((i) => (
            i.external ? (
              <a
                key={i.to}
                href={i.to}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {i.label}
              </a>
            ) : (
              <Link
                key={i.to}
                to={i.to}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${path === i.to ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {i.label}
              </Link>
            )
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl bg-background/60">
                <Globe2 className="h-4 w-4" />
                <span className="hidden sm:inline">{activeLanguage.nativeName}</span>
                <span className="sm:hidden">{activeLanguage.code.toUpperCase()}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{t("languageSelector")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {languages.map((item) => (
                <DropdownMenuItem key={item.code} onClick={() => setLanguage(item.code)} className="justify-between">
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.nativeName}</span>
                  </span>
                  {item.code === language && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("toggleTheme")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/auth">{t("signIn")}</Link></Button>
          <Button asChild size="sm"><Link to="/auth">{t("getStarted")}</Link></Button>
        </div>
      </div>
    </header>
  );
}
