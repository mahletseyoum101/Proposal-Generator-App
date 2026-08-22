import Anthropic from "@anthropic-ai/sdk";
import type { ProposalContent } from "./types";

const MODEL = "claude-opus-5";

export interface GenerateProposalInput {
  clientName: string;
  businessName: string;
  packageName: string;
  priceTotal: number;
  depositPercent: number;
  revisionsRounds: number;
  deliveryTimeline: string;
  briefText: string;
}

const SYSTEM_PROMPT = `You are the proposal writer for Dodo Digital, a digital services agency. Dodo Digital's proposal template is fixed — most of it is standing company copy (why us, our process, our promise, etc.) that never changes. Your only job is to draft the handful of sections that are genuinely specific to this one client: their problem areas, the benefits of the proposed solution, the package deliverables, a short project title, and a warm closing line. You never invent pricing, timelines, or deliverable counts — those are supplied to you.

Tone: confident, warm, plain-spoken, zero agency jargon or fluff. Short sentences. Specific to the client's actual business and the brief you're given, never generic filler. Write as "we" (Dodo Digital) speaking to the client.

You will be given: the client's name, their business name, the package name, the price, the delivery timeline, revision rounds, and a short brief describing the project. Use the brief as the source of truth for what problem the client has and what Dodo Digital will actually do about it.`;

const TOOL_SCHEMA = {
  name: "write_proposal_content",
  description: "Submit the client-specific written content for a proposal, structured to fit the fixed Dodo Digital proposal template.",
  input_schema: {
    type: "object" as const,
    properties: {
      project_title: { type: "string", description: "Short, specific project title shown on the cover under the business name, 3-7 words. E.g. 'Growing Smith Bakery's Online Presence'." },
      footer_tagline: { type: "string", description: "One short line under the project title, e.g. 'Prepared for a stronger online presence.'" },
      service_tags: {
        type: "array", items: { type: "string" }, minItems: 3, maxItems: 5,
        description: "Short pill labels for the services covered, e.g. ['Content', 'Short-Form Video', 'Web Design', 'AI Automation'], adapted to this brief.",
      },
      problem_areas: {
        type: "array", minItems: 4, maxItems: 4,
        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] },
        description: "Exactly 4 specific problem areas this client currently has, based on the brief. Title is a short label (3-6 words), description is one sentence.",
      },
      solution_benefits: {
        type: "array", minItems: 4, maxItems: 4,
        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] },
        description: "Exactly 4 specific benefits of Dodo Digital's proposed solution for this client, each directly addressing one of the problem areas. Title is a short label (3-6 words), description is one sentence.",
      },
      package_categories: {
        type: "array", minItems: 2, maxItems: 5,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            items: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
            price_weight: { type: "number", description: "This category's share of the total price, between 0 and 1. All categories' weights must sum to exactly 1." },
          },
          required: ["title", "items", "price_weight"],
        },
        description: "'What's Included' checklist grouped by category (e.g. Social Media Content, Website, AI Automation), matching the brief. price_weight values across all categories must sum to 1.",
      },
      closing_message: { type: "string", description: "One warm closing sentence for the thank-you section, mentioning the client's business by name." },
    },
    required: [
      "project_title", "footer_tagline", "service_tags", "problem_areas",
      "solution_benefits", "package_categories", "closing_message",
    ],
  },
};

export async function generateProposalContent(
  input: GenerateProposalInput
): Promise<ProposalContent> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  const userMessage = `Client name: ${input.clientName}
Business name: ${input.businessName}
Package name: ${input.packageName}
Total investment: $${input.priceTotal}
Deposit: ${input.depositPercent}%
Delivery timeline: ${input.deliveryTimeline}
Revision rounds: ${input.revisionsRounds}

Project brief:
${input.briefText}

Write the client-specific proposal content now via the write_proposal_content tool.`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [TOOL_SCHEMA],
    tool_choice: { type: "tool", name: "write_proposal_content" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Opus 5 did not return structured proposal content.");
  }

  const generated = toolUse.input as Omit<ProposalContent, "contact_email" | "contact_phone" | "contact_website">;

  return {
    ...generated,
    contact_email: "[Email]",
    contact_phone: "[Phone / WhatsApp]",
    contact_website: "[Website / Portfolio]",
  };
}
