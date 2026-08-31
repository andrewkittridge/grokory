interface CloudflareEnv {
  TEMPLATES: KVNamespace;
  ASSETS: Fetcher;
  DATABASE_URL: string;
  TURNSTILE_SECRET: string;
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: string;
  NEXT_PUBLIC_GA_ID?: string;
  NEXT_PUBLIC_AW_ID?: string;
  NEXT_PUBLIC_AW_ADD_LABEL?: string;
  NEXT_PUBLIC_AW_LIST_LABEL?: string;
  WORKER_SELF_REFERENCE: Fetcher;
}
