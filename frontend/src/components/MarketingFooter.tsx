import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { LogoMark } from "@/components/LogoMark";

export function MarketingFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t bg-card/40 py-10 mt-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <LogoMark className="h-8 w-8" />
            <span className="font-semibold">VoltX</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("footerDescription")}
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">{t("product")}</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">{t("navHome")}</Link></li>
            <li><Link to="/auth" className="hover:text-foreground">{t("signIn")}</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">{t("dashboard")}</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">{t("company")}</p>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">{t("navAbout")}</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">{t("navContact")}</Link></li>
          </ul>
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VoltX. {t("footerCare")}
      </p>
    </footer>
  );
}
