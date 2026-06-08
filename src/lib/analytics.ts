import type { CandidateProfile, InterviewSession } from "./types";

export interface AdminAnalyticsInput {
  candidates: CandidateProfile[];
  sessions: InterviewSession[];
}

export interface AdminAnalytics {
  totalCandidates: number;
  sessionsCompleted: number;
  sessionsScheduled: number;
  averageScore: number;
  roleCoverage: Record<string, number>;
  atRiskCandidateIds: string[];
}

export function computeAdminAnalytics({ candidates, sessions }: AdminAnalyticsInput): AdminAnalytics {
  const completed = sessions.filter((session) => session.status === "completed");
  const scored = completed.filter((session) => typeof session.finalScore === "number");
  const scoreTotal = scored.reduce((sum, session) => sum + (session.finalScore ?? 0), 0);
  const roleCoverage = candidates.reduce<Record<string, number>>((counts, candidate) => {
    counts[candidate.targetRole] = (counts[candidate.targetRole] ?? 0) + 1;
    return counts;
  }, {});

  return {
    totalCandidates: candidates.length,
    sessionsCompleted: completed.length,
    sessionsScheduled: sessions.filter((session) => session.status === "scheduled").length,
    averageScore: scored.length === 0 ? 0 : Math.round(scoreTotal / scored.length),
    roleCoverage,
    atRiskCandidateIds: candidates
      .filter((candidate) => candidate.readinessScore < 80)
      .map((candidate) => candidate.id)
  };
}

export interface CandidateProgressPoint {
  date: string;
  score: number;
  label: string;
}

export function buildCandidateProgressTimeline({
  candidateId,
  sessions
}: {
  candidateId: string;
  sessions: InterviewSession[];
}): CandidateProgressPoint[] {
  return sessions
    .filter(
      (session) =>
        session.candidateId === candidateId &&
        session.status === "completed" &&
        typeof session.finalScore === "number"
    )
    .sort((left, right) => left.scheduledFor.localeCompare(right.scheduledFor))
    .map((session) => ({
      date: session.scheduledFor,
      score: session.finalScore ?? 0,
      label: session.title
    }));
}
