import { GoogleGenAI, Type } from "@google/genai";
import type { ProposalContent } from "./types";

const MODEL = "gemini-3.6-flash";

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

const titledPointSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
  },
  required: ["title", "description"],
  propertyOrdering: ["title", "description"],
};

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    project_title: {
      type: Type.STRING,
      description: "Short, specific project title shown on the cover under the business name, 3-7 words. E.g. 'Growing Smith Bakery's Online Presence'.",
    },
    footer_tagline: {
      type: Type.STRING,
      description: "One short line under the project title, e.g. 'Prepared for a stronger online presence.'",
    },
    service_tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: "3",
      maxItems: "5",
      description: "Short pill labels for the services covered, e.g. ['Content', 'Short-Form Video', 'Web Design', 'AI Automation'], adapted to this brief.",
    },
    problem_areas: {
      type: Type.ARRAY,
      items: titledPointSchema,
      minItems: "4",
      maxItems: "4",
      description: "Specific problem areas this client currently has, based on the brief. Title is a short label (3-6 words), description is one sentence.",
    },
    solution_benefits: {
      type: Type.ARRAY,
      items: titledPointSchema,
      minItems: "4",
      maxItems: "4",
      description: "Specific benefits of Dodo Digital's proposed solution for this client, each directly addressing one of the problem areas. Title is a short label (3-6 words), description is one sentence.",
    },
    package_categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
          price_weight: {
            type: Type.NUMBER,
            description: "This category's share of the total price, between 0 and 1. All categories' weights must sum to exactly 1.",
          },
        },
        required: ["title", "items", "price_weight"],
        propertyOrdering: ["title", "items", "price_weight"],
      },
      minItems: "2",
      maxItems: "5",
      description: "'What's Included' checklist categories (e.g. Social Media Content, Website, AI Automation), matching the brief. price_weight values across all categories must sum to 1.",
    },
    closing_message: {
      type: Type.STRING,
      description: "One warm closing sentence for the thank-you section, mentioning the client's business by name.",
    },
  },
  required: [
    "project_title", "footer_tagline", "service_tags", "problem_areas",
    "solution_benefits", "package_categories", "closing_message",
  ],
  propertyOrdering: [
    "project_title", "footer_tagline", "service_tags", "problem_areas",
    "solution_benefits", "package_categories", "closing_message",
  ],
};

export async function generateProposalContent(
  input: GenerateProposalInput
): Promise<ProposalContent> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

  const userMessage = `Client name: ${input.clientName}
Business name: ${input.businessName}
Package name: ${input.packageName}
Total investment: $${input.priceTotal}
Deposit: ${input.depositPercent}%
Delivery timeline: ${input.deliveryTimeline}
Revision rounds: ${input.revisionsRounds}

Project brief:
${input.briefText}

Write the client-specific proposal content now.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: userMessage,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini did not return structured proposal content.");
  }

  const generated = JSON.parse(text) as Omit<
    ProposalContent,
    "contact_email" | "contact_phone" | "contact_website"
  >;

  return {
    ...generated,
    contact_email: "[Email]",
    contact_phone: "[Phone / WhatsApp]",
    contact_website: "[Website / Portfolio]",
  };
}
