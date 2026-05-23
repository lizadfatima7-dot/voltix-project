import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { MarketingFooter } from "@/components/MarketingFooter";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Voltix" },
      { name: "description", content: "Voltix haqqında tez-tez verilən suallar." },
    ],
  }),
  component: FAQ,
});

function FAQ() {
  const { t } = useI18n();
  const faqs = t<string[]>("faqs").map((item) => {
    const [question, answer] = item.split("|");
    return { question, answer };
  });

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-soft)" }}>
      <MarketingNav />
      <main className="mx-auto max-w-4xl px-6 pt-16">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{t("faqTitle")}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{t("faqDescription")}</p>
        </motion.section>
        <section className="mt-10 grid gap-4">
          {faqs.map((faq, index) => (
            <motion.article
              key={faq.question}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border bg-card p-5 hover-lift"
              style={{ backgroundImage: "var(--gradient-card)" }}
            >
              <h2 className="font-semibold">{faq.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
            </motion.article>
          ))}
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
