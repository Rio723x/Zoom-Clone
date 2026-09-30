/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIDEOSDK_TOKEN: string;
  readonly VITE_VIDEOSDK_API_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
