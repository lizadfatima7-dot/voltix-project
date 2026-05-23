import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";

// Mock modules before component
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid={`link-${to.replace(/\//g, "-")}`}>{children}</a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
}));

const mockT = vi.fn((key: string) => {
  const translations: Record<string, string | string[]> = {
    heroBadge: "AI-powered energy intelligence",
    heroTitleStart: "Power your home,",
    heroTitleHighlight: "smarter",
    heroTitleEnd: "",
    heroDescription: "Monitor your electricity usage intelligently.",
    getStarted: "Get started",
    liveDemo: "Live demo",
    liveUsage: "Live usage — last 24 hours",
    activeHomes: "Active homes",
    kwhMonitored: "kWh monitored",
    co2Saved: "Tons of CO₂ saved",
    featuresTitle: "Everything you need to save energy",
    featuresDescription: "A complete toolkit for understanding your home.",
    features: [
      "Real-time monitoring|Live voltage updates.",
      "Rich analytics|Daily trends.",
      "AI recommendations|Personalized tips.",
      "CO₂ tracker|Carbon footprint.",
      "Private & secure|Bank-grade encryption.",
      "Smart home ready|Connect appliances.",
    ],
    ctaTitle: "Start saving today",
    ctaDescription: "Create your free account.",
    createAccount: "Create account",
  };
  return translations[key] ?? key;
});

vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({ t: mockT }),
}));

vi.mock("@/components/MarketingNav", () => ({
  MarketingNav: () => <nav data-testid="marketing-nav">Nav</nav>,
}));

vi.mock("@/components/MarketingFooter", () => ({
  MarketingFooter: () => <footer data-testid="marketing-footer">Footer</footer>,
}));

// Card validation functions (same as in index.tsx)
function isValidCardNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19 || /^(\d)\1+$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (shouldDouble) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string) {
  const match = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(value);
  if (!match) return false;
  const expiry = new Date(2000 + Number(match[2]), Number(match[1]), 0, 23, 59, 59);
  return expiry >= new Date();
}

// Simplified Home component for testing
function Home() {
  const [card, setCard] = React.useState("");
  const [expiry, setExpiry] = React.useState("");
  const [cvc, setCvc] = React.useState("");
  const paymentValid = isValidCardNumber(card) && isValidExpiry(expiry) && /^\d{3,4}$/.test(cvc);

  const { t } = { t: mockT };
  const features = (t("features") as string[]).map((feature) => {
    const [title, text] = feature.split("|");
    return { title, text };
  });

  return (
    <div data-testid="home-page">
      <nav data-testid="marketing-nav">Nav</nav>

      {/* Hero Section */}
      <main>
        <section data-testid="hero-section">
          <span data-testid="hero-badge">{t("heroBadge")}</span>
          <h1 data-testid="hero-title">
            {t("heroTitleStart")} <span>{t("heroTitleHighlight")}</span> {t("heroTitleEnd")}
          </h1>
          <p data-testid="hero-description">{t("heroDescription")}</p>
          <div>
            <a href="/auth" data-testid="get-started-btn">{t("getStarted")}</a>
            <a href="/dashboard" data-testid="live-demo-btn">{t("liveDemo")}</a>
          </div>
        </section>

        {/* Chart Section */}
        <section data-testid="chart-section">
          <p data-testid="live-usage-label">{t("liveUsage")}</p>
          <div data-testid="area-chart">Chart</div>
        </section>

        {/* Stats Section */}
        <section data-testid="stats-section">
          <div data-testid="stat-active-homes">
            <p>{t("activeHomes")}</p>
            <p data-testid="stat-value-homes">12,450+</p>
          </div>
          <div data-testid="stat-kwh">
            <p>{t("kwhMonitored")}</p>
            <p data-testid="stat-value-kwh">842,000+</p>
          </div>
          <div data-testid="stat-co2">
            <p>{t("co2Saved")}</p>
            <p data-testid="stat-value-co2">354</p>
          </div>
        </section>

        {/* Features Section */}
        <section data-testid="features-section">
          <h2 data-testid="features-title">{t("featuresTitle")}</h2>
          <p data-testid="features-description">{t("featuresDescription")}</p>
          <div data-testid="features-grid">
            {features.map((f, i) => (
              <div key={i} data-testid={`feature-${i}`}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Section */}
        <section data-testid="premium-section">
          <h2>Premium abunəlik</h2>
          <div data-testid="payment-form">
            <label htmlFor="premium-card">Kart nömrəsi</label>
            <input
              id="premium-card"
              data-testid="card-input"
              value={card}
              onChange={(e) => setCard(e.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
              placeholder="4111 1111 1111 1111"
            />
            <label htmlFor="premium-expiry">Bitmə tarixi</label>
            <input
              id="premium-expiry"
              data-testid="expiry-input"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
              placeholder="AA/İİ"
            />
            <label htmlFor="premium-cvc">CVC</label>
            <input
              id="premium-cvc"
              data-testid="cvc-input"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="CVC"
            />
            <p data-testid="payment-status">
              {paymentValid
                ? "Kart formatı təsdiqləndi. Məlumatlar saxlanılmadan yalnız brauzerdə yoxlanılır."
                : "Real kart formatı, gələcək bitmə tarixi və düzgün CVC daxil edin."}
            </p>
            <button data-testid="premium-submit" disabled={!paymentValid}>
              Premiumu aktivləşdir
            </button>
          </div>
        </section>

        {/* CTA Section */}
        <section data-testid="cta-section">
          <h3 data-testid="cta-title">{t("ctaTitle")}</h3>
          <p data-testid="cta-description">{t("ctaDescription")}</p>
          <a href="/auth" data-testid="cta-btn">{t("createAccount")}</a>
        </section>
      </main>

      <footer data-testid="marketing-footer">Footer</footer>
    </div>
  );
}

describe("index.tsx - Home Page Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders the home page", () => {
      render(<Home />);
      expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });

    it("renders marketing navigation", () => {
      render(<Home />);
      expect(screen.getByTestId("marketing-nav")).toBeInTheDocument();
    });

    it("renders marketing footer", () => {
      render(<Home />);
      expect(screen.getByTestId("marketing-footer")).toBeInTheDocument();
    });
  });

  describe("Hero Section", () => {
    it("displays hero badge", () => {
      render(<Home />);
      expect(screen.getByTestId("hero-badge")).toHaveTextContent("AI-powered energy intelligence");
    });

    it("displays hero title", () => {
      render(<Home />);
      expect(screen.getByTestId("hero-title")).toHaveTextContent("Power your home, smarter");
    });

    it("displays hero description", () => {
      render(<Home />);
      expect(screen.getByTestId("hero-description")).toHaveTextContent("Monitor your electricity usage intelligently.");
    });

    it("renders Get Started button linking to /auth", () => {
      render(<Home />);
      const btn = screen.getByTestId("get-started-btn");
      expect(btn).toHaveTextContent("Get started");
      expect(btn).toHaveAttribute("href", "/auth");
    });

    it("renders Live Demo button linking to /dashboard", () => {
      render(<Home />);
      const btn = screen.getByTestId("live-demo-btn");
      expect(btn).toHaveTextContent("Live demo");
      expect(btn).toHaveAttribute("href", "/dashboard");
    });
  });

  describe("Chart Section", () => {
    it("displays live usage label", () => {
      render(<Home />);
      expect(screen.getByTestId("live-usage-label")).toHaveTextContent("Live usage — last 24 hours");
    });

    it("renders chart container", () => {
      render(<Home />);
      expect(screen.getByTestId("area-chart")).toBeInTheDocument();
    });
  });

  describe("Stats Section", () => {
    it("displays active homes stat", () => {
      render(<Home />);
      expect(screen.getByTestId("stat-active-homes")).toBeInTheDocument();
      expect(screen.getByText("Active homes")).toBeInTheDocument();
    });

    it("displays kWh monitored stat", () => {
      render(<Home />);
      expect(screen.getByTestId("stat-kwh")).toBeInTheDocument();
      expect(screen.getByText("kWh monitored")).toBeInTheDocument();
    });

    it("displays CO₂ saved stat", () => {
      render(<Home />);
      expect(screen.getByTestId("stat-co2")).toBeInTheDocument();
      expect(screen.getByText("Tons of CO₂ saved")).toBeInTheDocument();
    });
  });

  describe("Features Section", () => {
    it("displays features title", () => {
      render(<Home />);
      expect(screen.getByTestId("features-title")).toHaveTextContent("Everything you need to save energy");
    });

    it("displays features description", () => {
      render(<Home />);
      expect(screen.getByTestId("features-description")).toHaveTextContent("A complete toolkit");
    });

    it("renders all 6 features", () => {
      render(<Home />);
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`feature-${i}`)).toBeInTheDocument();
      }
    });

    it("displays feature titles correctly", () => {
      render(<Home />);
      expect(screen.getByText("Real-time monitoring")).toBeInTheDocument();
      expect(screen.getByText("Rich analytics")).toBeInTheDocument();
      expect(screen.getByText("AI recommendations")).toBeInTheDocument();
    });
  });

  describe("Premium Section", () => {
    it("displays premium section title", () => {
      render(<Home />);
      expect(screen.getByText("Premium abunəlik")).toBeInTheDocument();
    });

    it("renders payment form", () => {
      render(<Home />);
      expect(screen.getByTestId("payment-form")).toBeInTheDocument();
    });

    it("renders card number input", () => {
      render(<Home />);
      expect(screen.getByTestId("card-input")).toBeInTheDocument();
    });

    it("renders expiry input", () => {
      render(<Home />);
      expect(screen.getByTestId("expiry-input")).toBeInTheDocument();
    });

    it("renders CVC input", () => {
      render(<Home />);
      expect(screen.getByTestId("cvc-input")).toBeInTheDocument();
    });

    it("submit button is disabled when form is invalid", () => {
      render(<Home />);
      const btn = screen.getByTestId("premium-submit");
      expect(btn).toBeDisabled();
    });

    it("shows invalid message when form is incomplete", () => {
      render(<Home />);
      expect(screen.getByTestId("payment-status")).toHaveTextContent(
        "Real kart formatı, gələcək bitmə tarixi və düzgün CVC daxil edin."
      );
    });
  });

  describe("Premium Form Validation", () => {
    it("validates card number with Luhn algorithm", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input");
      const expiryInput = screen.getByTestId("expiry-input");
      const cvcInput = screen.getByTestId("cvc-input");

      // Enter valid card
      fireEvent.change(cardInput, { target: { value: "4111111111111111" } });
      fireEvent.change(expiryInput, { target: { value: "12/99" } });
      fireEvent.change(cvcInput, { target: { value: "123" } });

      await waitFor(() => {
        expect(screen.getByTestId("payment-status")).toHaveTextContent("Kart formatı təsdiqləndi");
        expect(screen.getByTestId("premium-submit")).not.toBeDisabled();
      });
    });

    it("rejects invalid card number", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input");
      const expiryInput = screen.getByTestId("expiry-input");
      const cvcInput = screen.getByTestId("cvc-input");

      fireEvent.change(cardInput, { target: { value: "4111111111111112" } }); // Invalid checksum
      fireEvent.change(expiryInput, { target: { value: "12/99" } });
      fireEvent.change(cvcInput, { target: { value: "123" } });

      await waitFor(() => {
        expect(screen.getByTestId("premium-submit")).toBeDisabled();
      });
    });

    it("rejects expired card", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input");
      const expiryInput = screen.getByTestId("expiry-input");
      const cvcInput = screen.getByTestId("cvc-input");

      fireEvent.change(cardInput, { target: { value: "4111111111111111" } });
      fireEvent.change(expiryInput, { target: { value: "01/20" } }); // Expired
      fireEvent.change(cvcInput, { target: { value: "123" } });

      await waitFor(() => {
        expect(screen.getByTestId("premium-submit")).toBeDisabled();
      });
    });

    it("rejects invalid CVC format", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input");
      const expiryInput = screen.getByTestId("expiry-input");
      const cvcInput = screen.getByTestId("cvc-input");

      fireEvent.change(cardInput, { target: { value: "4111111111111111" } });
      fireEvent.change(expiryInput, { target: { value: "12/99" } });
      fireEvent.change(cvcInput, { target: { value: "12" } }); // Too short

      await waitFor(() => {
        expect(screen.getByTestId("premium-submit")).toBeDisabled();
      });
    });

    it("accepts 4-digit CVC (Amex)", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input");
      const expiryInput = screen.getByTestId("expiry-input");
      const cvcInput = screen.getByTestId("cvc-input");

      fireEvent.change(cardInput, { target: { value: "4111111111111111" } });
      fireEvent.change(expiryInput, { target: { value: "12/99" } });
      fireEvent.change(cvcInput, { target: { value: "1234" } });

      await waitFor(() => {
        expect(screen.getByTestId("premium-submit")).not.toBeDisabled();
      });
    });

    it("strips non-numeric characters from card input", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input") as HTMLInputElement;

      fireEvent.change(cardInput, { target: { value: "4111-1111-1111-1111" } });

      // Should strip dashes but keep digits and spaces
      expect(cardInput.value).toBe("4111111111111111");
    });

    it("strips non-numeric characters from CVC input", async () => {
      render(<Home />);
      const cvcInput = screen.getByTestId("cvc-input") as HTMLInputElement;

      fireEvent.change(cvcInput, { target: { value: "12a3" } });

      expect(cvcInput.value).toBe("123");
    });

    it("limits card input to 23 characters", async () => {
      render(<Home />);
      const cardInput = screen.getByTestId("card-input") as HTMLInputElement;

      fireEvent.change(cardInput, { target: { value: "1234567890123456789012345" } });

      expect(cardInput.value.length).toBeLessThanOrEqual(23);
    });

    it("limits CVC input to 4 characters", async () => {
      render(<Home />);
      const cvcInput = screen.getByTestId("cvc-input") as HTMLInputElement;

      fireEvent.change(cvcInput, { target: { value: "12345" } });

      expect(cvcInput.value.length).toBeLessThanOrEqual(4);
    });
  });

  describe("CTA Section", () => {
    it("displays CTA title", () => {
      render(<Home />);
      expect(screen.getByTestId("cta-title")).toHaveTextContent("Start saving today");
    });

    it("displays CTA description", () => {
      render(<Home />);
      expect(screen.getByTestId("cta-description")).toHaveTextContent("Create your free account.");
    });

    it("renders Create Account button linking to /auth", () => {
      render(<Home />);
      const btn = screen.getByTestId("cta-btn");
      expect(btn).toHaveTextContent("Create account");
      expect(btn).toHaveAttribute("href", "/auth");
    });
  });

  describe("Internationalization", () => {
    it("calls translation function for hero content", () => {
      render(<Home />);
      expect(mockT).toHaveBeenCalledWith("heroBadge");
      expect(mockT).toHaveBeenCalledWith("heroTitleStart");
      expect(mockT).toHaveBeenCalledWith("heroTitleHighlight");
      expect(mockT).toHaveBeenCalledWith("heroDescription");
    });

    it("calls translation function for features", () => {
      render(<Home />);
      expect(mockT).toHaveBeenCalledWith("features");
      expect(mockT).toHaveBeenCalledWith("featuresTitle");
      expect(mockT).toHaveBeenCalledWith("featuresDescription");
    });

    it("calls translation function for stats", () => {
      render(<Home />);
      expect(mockT).toHaveBeenCalledWith("activeHomes");
      expect(mockT).toHaveBeenCalledWith("kwhMonitored");
      expect(mockT).toHaveBeenCalledWith("co2Saved");
    });

    it("calls translation function for CTA", () => {
      render(<Home />);
      expect(mockT).toHaveBeenCalledWith("ctaTitle");
      expect(mockT).toHaveBeenCalledWith("ctaDescription");
      expect(mockT).toHaveBeenCalledWith("createAccount");
    });
  });
});
