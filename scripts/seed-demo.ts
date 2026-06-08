import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  demoCandidates,
  demoCoaches,
  demoInterviewSession,
  demoSessions,
  demoTranscript,
  questionBank,
  rubricCategories
} from "../src/lib/demo-data";
import { createMockInterviewAiProvider } from "../src/lib/providers/mock";

async function main() {
  const provider = createMockInterviewAiProvider();
  const feedbackReport = await provider.generateFeedbackReport({
    session: demoInterviewSession,
    transcript: demoTranscript
  });
  const followUp = await provider.generateFollowUp({
    session: demoInterviewSession,
    questionId: "q_behavioral_ownership",
    transcript: demoTranscript
  });

  const seed = {
    generatedAt: new Date().toISOString(),
    note: "Public-safe fictional seed payload for local demo and screenshot capture.",
    coaches: demoCoaches,
    candidates: demoCandidates,
    questionBank,
    rubricCategories,
    sessions: demoSessions,
    transcript: demoTranscript,
    mockAi: {
      followUp,
      feedbackReport
    }
  };

  const target = join(process.cwd(), ".generated", "demo-seed.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, JSON.stringify(seed, null, 2));

  console.log(`Seeded ${demoCandidates.length} candidates, ${demoSessions.length} sessions, and ${questionBank.length} questions.`);
  console.log(`Wrote ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
