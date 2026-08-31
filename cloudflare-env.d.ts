interface CloudflareEnv {
  TEMPLATES: KVNamespace;
  ASSETS: Fetcher;
  DATABASE_URL: string;
  WORKER_SELF_REFERENCE: Fetcher;
}
