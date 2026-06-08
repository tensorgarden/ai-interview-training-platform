import type { InterviewAiProvider } from "./types";

export function createAnthropicInterviewProvider(): InterviewAiProvider {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic. Use AI_PROVIDER=mock for the local portfolio demo.");
  }

  throw new Error(
    "Anthropic adapter not wired for demo. Implement prompt templates and streaming here for production."
  );
}
