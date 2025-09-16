/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLIENT_BUNDLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
