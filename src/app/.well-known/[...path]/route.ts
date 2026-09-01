import {
  a2aAgentCard,
  apiCatalog,
  ardCatalog,
  mcpDiscovery,
  mcpServerCard,
  SKILL_DOCS,
  skillsIndex,
} from "@/lib/agent";
import {
  jsonResponse,
  markdownResponse,
  optionsResponse,
} from "@/lib/agent-http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join("/");

  if (path === "api-catalog") {
    return jsonResponse(apiCatalog(), {
      "content-type":
        'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    });
  }
  if (path === "mcp/server-card.json" || path === "mcp/server-cards.json") {
    return jsonResponse(mcpServerCard());
  }
  if (path === "mcp.json") {
    return jsonResponse(mcpDiscovery());
  }
  if (path === "agent-card.json" || path === "agent.json") {
    return jsonResponse(a2aAgentCard());
  }
  if (path === "ai-catalog.json") {
    return jsonResponse(ardCatalog());
  }
  if (path === "agent-skills/index.json") {
    return jsonResponse(await skillsIndex());
  }
  const skill = path.match(/^agent-skills\/([^/]+)\/SKILL\.md$/);
  if (skill) {
    const doc = SKILL_DOCS[skill[1]];
    if (!doc) return jsonResponse({ error: "Not found" }, undefined, 404);
    return markdownResponse(doc.body);
  }

  return jsonResponse({ error: "Not found" }, undefined, 404);
}
