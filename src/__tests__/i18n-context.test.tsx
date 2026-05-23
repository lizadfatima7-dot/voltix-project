import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { I18nProvider, useI18n, languages, type Language } from "@/lib/i18n";

// Test component that uses the i18n hook
function TestConsumer() {
  const { language, setLanguage, t } = useI18n();
  return (
    <div>
      <span data-testid="language">{language}</span>
      <span data-testid="translation">{t("navHome")}</span>
      <button onClick={() => setLanguage("en")}>Set English</button>
      <button onClick={() => setLanguage("az")}>Set Azerbaijani</button>
      <button onClick={() => setLanguage("tr")}>Set Turkish</button>
      <button onClick={() => setLanguage("ru")}>Set Russian</button>
    </div>
  );
}

describe("i18n.tsx - I18nContext", () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset document lang
    document.documentElement.lang = "";
  });

  describe("languages constant", () => {
    it("exports 4 languages", () => {
      expect(languages).toHaveLength(4);
    });

    it("includes Azerbaijani", () => {
      expect(languages.find((l) => l.code === "az")).toBeDefined();
    });

    it("includes English", () => {
      expect(languages.find((l) => l.code === "en")).toBeDefined();
    });

    it("includes Turkish", () => {
      expect(languages.find((l) => l.code === "tr")).toBeDefined();
    });

    it("includes Russian", () => {
      expect(languages.find((l) => l.code === "ru")).toBeDefined();
    });

    it("each language has code, label, nativeName, and flag", () => {
      languages.forEach((lang) => {
        expect(lang).toHaveProperty("code");
        expect(lang).toHaveProperty("label");
        expect(lang).toHaveProperty("nativeName");
        expect(lang).toHaveProperty("flag");
      });
    });
  });

  describe("I18nProvider", () => {
    it("renders children", () => {
      render(
        <I18nProvider>
          <div data-testid="child">Child Content</div>
        </I18nProvider>
      );
      expect(screen.getByTestId("child")).toHaveTextContent("Child Content");
    });

    it("defaults to Azerbaijani when no stored language", () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("language")).toHaveTextContent("az");
    });

    it("uses stored language from localStorage", () => {
      localStorage.setItem("voltx-language", "en");
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });

    it("falls back to az for invalid stored language", () => {
      localStorage.setItem("voltx-language", "invalid");
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("language")).toHaveTextContent("az");
    });

    it("updates document.documentElement.lang", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      // Wait for effect to run
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0));
      });
      
      expect(document.documentElement.lang).toBe("az");
    });

    it("stores language in localStorage when changed", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      const button = screen.getByRole("button", { name: /set english/i });
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(localStorage.getItem("voltx-language")).toBe("en");
    });
  });

  describe("setLanguage", () => {
    it("changes language to English", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      const button = screen.getByRole("button", { name: /set english/i });
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId("language")).toHaveTextContent("en");
    });

    it("changes language to Turkish", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      const button = screen.getByRole("button", { name: /set turkish/i });
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId("language")).toHaveTextContent("tr");
    });

    it("changes language to Russian", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      const button = screen.getByRole("button", { name: /set russian/i });
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId("language")).toHaveTextContent("ru");
    });

    it("updates document lang attribute", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      const button = screen.getByRole("button", { name: /set english/i });
      await act(async () => {
        fireEvent.click(button);
        await new Promise((r) => setTimeout(r, 0));
      });
      
      expect(document.documentElement.lang).toBe("en");
    });
  });

  describe("t (translation function)", () => {
    it("returns Azerbaijani translation by default", () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("translation")).toHaveTextContent("Ana səhifə");
    });

    it("returns English translation when language is en", async () => {
      localStorage.setItem("voltx-language", "en");
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("translation")).toHaveTextContent("Home");
    });

    it("returns Turkish translation when language is tr", async () => {
      localStorage.setItem("voltx-language", "tr");
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("translation")).toHaveTextContent("Ana sayfa");
    });

    it("returns Russian translation when language is ru", async () => {
      localStorage.setItem("voltx-language", "ru");
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      expect(screen.getByTestId("translation")).toHaveTextContent("Главная");
    });

    it("updates translation when language changes", async () => {
      render(
        <I18nProvider>
          <TestConsumer />
        </I18nProvider>
      );
      
      // Initially Azerbaijani
      expect(screen.getByTestId("translation")).toHaveTextContent("Ana səhifə");
      
      // Change to English
      const button = screen.getByRole("button", { name: /set english/i });
      await act(async () => {
        fireEvent.click(button);
      });
      
      expect(screen.getByTestId("translation")).toHaveTextContent("Home");
    });
  });

  describe("useI18n", () => {
    it("throws error when used outside I18nProvider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      
      expect(() => {
        render(<TestConsumer />);
      }).toThrow("useI18n must be used within I18nProvider");
      
      consoleSpy.mockRestore();
    });
  });
});
