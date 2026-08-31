import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

export default {
  ...config,
  // Workers Builds runs `npm run build` then `wrangler deploy`. Point the npm
  // script at OpenNext, and invoke Next.js here so OpenNext does not recurse
  // into that same script.
  buildCommand: "next build",
};
