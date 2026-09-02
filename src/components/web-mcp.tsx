"use client";

import { useEffect } from "react";

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: Record<string, unknown>;
      execute: (args: Record<string, unknown>) => Promise<unknown>;
    },
    options?: { signal?: AbortSignal }
  ) => void;
};

export function WebMcp() {
  useEffect(() => {
    const nav = navigator as Navigator & { modelContext?: ModelContext };
    if (!nav.modelContext?.registerTool) return;
    const abort = new AbortController();
    const { signal } = abort;

    const register = (
      tool: Parameters<ModelContext["registerTool"]>[0]
    ) => {
      try {
        nav.modelContext?.registerTool(tool, { signal });
      } catch {
        nav.modelContext?.registerTool(tool);
      }
    };

    register({
      name: "search_grok_bots",
      description:
        "Search public Grok Bot listings on Grokdex by keyword.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
        },
      },
      execute: async (args) => {
        const url = new URL("/api/bots", window.location.origin);
        if (typeof args.query === "string" && args.query) {
          url.searchParams.set("q", args.query);
        }
        const response = await fetch(url);
        return response.json();
      },
    });

    register({
      name: "open_grokdex_board",
      description: "Open the Grokdex public board in this browser.",
      inputSchema: {
        type: "object",
        properties: {},
      },
      execute: async () => {
        const url = new URL("/templates", window.location.origin);
        window.location.assign(url);
        return { ok: true, url: url.toString() };
      },
    });

    return () => abort.abort();
  }, []);

  return null;
}
