import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolveVideosdkTokens } from "./scripts/videosdk-token.mjs";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (empty prefix) so we can read the non-public
  // VIDEOSDK_API_KEY / VIDEOSDK_SECRET here at build time. Deploys only need
  // those two vars: the client tokens are signed here and injected below, so
  // there is no manual mint step and no VITE_ token in .env. The secret is used
  // only in this Node config and is never shipped to the client.
  const env = loadEnv(mode, process.cwd(), "");
  const { rtc, crawler } = resolveVideosdkTokens(env);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    // Injected as literals; only the signed tokens ship, never the secret.
    define: {
      __VIDEOSDK_TOKEN__: JSON.stringify(rtc),
      __VIDEOSDK_API_TOKEN__: JSON.stringify(crawler),
    },
    server: {
      port: 5173,
      host: true,
    },
  };
});
