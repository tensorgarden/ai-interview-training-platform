import type { InterviewAiProvider } from "./types";

export function createOpenAiInterviewProvider(): InterviewAiProvider {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai. Use AI_PROVIDER=mock for the local portfolio demo.");
  }

  throw new Error(
    "OpenAI adapter not wired for demo. Implement prompt templates and streaming here for production."
  );
}
