// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath, URL } from "node:url";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    base: "/"
  },
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./frontend/src", import.meta.url)),
        "@/components": fileURLToPath(new URL("./frontend/src/components", import.meta.url)),
        "@/hooks": fileURLToPath(new URL("./frontend/src/hooks", import.meta.url)),
        "@/lib": fileURLToPath(new URL("./frontend/src/lib", import.meta.url)),
        "@/integrations": fileURLToPath(new URL("./frontend/src/integrations", import.meta.url)),
        "@/backend": fileURLToPath(new URL("./backend", import.meta.url)),
      },
    },
  },
});
