import { createAnthropicInterviewProvider } from "./anthropic";
import { createMockInterviewAiProvider } from "./mock";
import { createOpenAiInterviewProvider } from "./openai";
import type { InterviewAiProvider } from "./types";

export function getInterviewAiProvider(): InterviewAiProvider {
  const provider = process.env.AI_PROVIDER ?? "mock";

  if (provider === "mock") {
    return createMockInterviewAiProvider();
  }

  if (provider === "openai") {
    return createOpenAiInterviewProvider();
  }

  if (provider === "anthropic") {
    return createAnthropicInterviewProvider();
  }

  throw new Error(`Unsupported AI_PROVIDER '${provider}'. Valid values: mock, openai, anthropic.`);
}
