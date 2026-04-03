/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_OG_IMAGE_URL?: string;
  readonly VITE_ORG_NAME?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_TWITTER_SITE?: string;
  readonly VITE_TWITTER_CREATOR?: string;
  readonly VITE_ORG_SAME_AS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
