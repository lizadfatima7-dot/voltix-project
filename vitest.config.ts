import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "./src/frontend/components"),
      "@/hooks": path.resolve(__dirname, "./src/frontend/hooks"),
      "@/lib": path.resolve(__dirname, "./src/frontend/lib"),
      "@/backend": path.resolve(__dirname, "./src/backend"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "lcov"],
      include: ["src/lib/**"],
      exclude: [
        "src/__tests__/**",
        "src/lib/auth.tsx",
        "src/lib/i18n.tsx",
        "src/lib/theme.tsx",
        "src/lib/error-page.ts",
      ],
    },
  },
});
