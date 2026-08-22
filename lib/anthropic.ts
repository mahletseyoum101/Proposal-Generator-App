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

const SYSTEM_PROMPT = `You are the proposal writer for Dodo Digital, a digital services agency. You write the copy for client proposals using a fixed, proven structure. Your job is ONLY to write persuasive, specific, professional prose and lists that fit into that structure — you never invent pricing, timelines, or deliverable counts, those are supplied to you.

Tone: confident, warm, plain-spoken, zero agency jargon or fluff. Short sentences. Specific to the client's actual business and the brief you're given, never generic filler. Write as "we" (Dodo Digital) speaking to the client.

You will be given: the client's name, their business name, the package name, the price, the delivery timeline, revision rounds, and a short brief describing the project. Use the brief as the source of truth for what problem the client has and what Dodo Digital will actually do about it.`;

const TOOL_SCHEMA = {
  name: "write_proposal_content",
  description: "Submit the written content for a client proposal, structured to fit the fixed Dodo Digital proposal template.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: { type: "string", description: "Cover page headline, 4-9 words. E.g. 'Digital Solutions That Help Your Business Grow Online'." },
      subheadline: { type: "string", description: "One short supporting line under the headline." },
      service_tags: {
        type: "array", items: { type: "string" }, minItems: 3, maxItems: 5,
        description: "Short pill labels for the services covered, e.g. ['Content', 'Short-Form Video', 'Web Design', 'AI Automation'], adapted to this brief.",
      },
      opportunity_intro: { type: "string", description: "1-2 sentence paragraph opening 'The Opportunity' section: the client already has something valuable, the challenge is presentation/reach." },
      pain_points: {
        type: "array", items: { type: "string" }, minItems: 4, maxItems: 6,
        description: "Bullet list of specific ways the client may be losing customers or opportunity right now, tailored to the brief.",
      },
      solution_paragraph: { type: "string", description: "1-2 sentences introducing Dodo Digital as the solution to those pain points, specific to this brief." },
      goals: {
        type: "array", minItems: 4, maxItems: 5,
        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] },
        description: "'What We'll Help You Achieve' — short outcome titles (2-4 words) each with a one-sentence description.",
      },
      services: {
        type: "array", minItems: 3, maxItems: 5,
        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] },
        description: "'What We Do' — the core services/workstreams for this project, each with a one-sentence description.",
      },
      package_categories: {
        type: "array", minItems: 2, maxItems: 5,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            items: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
          },
          required: ["title", "items"],
        },
        description: "'What's Included' checklist grouped by category (e.g. Social Media Content, Website, AI Automation), matching the services above and the brief.",
      },
      why_package_paragraph: { type: "string", description: "1-2 sentence explanation of why these pieces work best together, specific to this client's situation." },
      why_package_flow: {
        type: "array", items: { type: "string" }, minItems: 3, maxItems: 5,
        description: "Short words showing the value chain, e.g. ['Content', 'Attention', 'Trust', 'Conversion'], adapted to this brief.",
      },
      savings_points: {
        type: "array", items: { type: "string" }, minItems: 3, maxItems: 5,
        description: "'What This Saves You' — costs/friction of hiring separately for each of these services instead of one team.",
      },
      savings_benefits: {
        type: "array", items: { type: "string" }, minItems: 3, maxItems: 3,
        description: "Exactly 3 short benefit phrases of working with one team, e.g. 'One point of contact'.",
      },
      process_steps: {
        type: "array", minItems: 5, maxItems: 5,
        items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title", "description"] },
        description: "Exactly 5 process steps (Discover, Plan, Create, Review, Deliver in spirit) with one-sentence descriptions tailored to this project.",
      },
      expectation_questions: {
        type: "array", items: { type: "string" }, minItems: 4, maxItems: 5,
        description: "'What You Can Expect' — quoted rhetorical questions the client won't have to worry about anymore, in quotation marks.",
      },
      promise_paragraph: { type: "string", description: "1-2 sentence brand promise: excellent work, clear communication, confidence in what they're paying for." },
      closing_message: { type: "string", description: "One warm closing sentence for the thank-you section." },
    },
    required: [
      "headline", "subheadline", "service_tags", "opportunity_intro", "pain_points",
      "solution_paragraph", "goals", "services", "package_categories",
      "why_package_paragraph", "why_package_flow", "savings_points", "savings_benefits",
      "process_steps", "expectation_questions", "promise_paragraph", "closing_message",
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

Write the full proposal content now via the write_proposal_content tool.`;

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

  return toolUse.input as ProposalContent;
}
