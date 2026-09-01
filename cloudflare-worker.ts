// @ts-nocheck
// OpenNext generates `.open-next/worker.js` at build time.
import { default as handler } from "./.open-next/worker.js";

export default {
  async fetch(request, env, ctx) {
    return handler.fetch(request, env, ctx);
  },

  async scheduled(_controller, env, ctx) {
    const secret = env.CRON_SECRET;
    if (!secret) return;
    ctx.waitUntil(
      env.WORKER_SELF_REFERENCE.fetch(
        "https://grokdex.net/api/cron/check-links",
        {
          headers: { authorization: `Bearer ${secret}` },
        }
      ).then(async (response) => {
        if (!response.ok) {
          console.error(
            "check-links",
            response.status,
            await response.text()
          );
        }
      })
    );
  },
};
