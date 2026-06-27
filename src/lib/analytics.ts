import type { CandidateProfile, InterviewSession } from "./types";

const MIN_JOB_DESCRIPTION_SIGNALS = 2;
const MIN_COMPANY_RESEARCH_SIGNALS = 1;
const MIN_RESUME_EVIDENCE_ANCHORS = 2;

const GENERIC_CONTEXT_TERMS = new Set([
  "communication",
  "leadership",
  "teamwork",
  "problem solving",
  "culture fit",
  "company research"
]);

export interface AdminAnalyticsInput {
  candidates: CandidateProfile[];
  sessions: InterviewSession[];
}

export type CandidatePracticeContextMissingReason =
  | "job_description_signals"
  | "company_research_signals"
  | "resume_evidence_anchors";

export interface CandidatePracticeContextGap {
  candidateId: string;
  missing: CandidatePracticeContextMissingReason[];
}

export interface AdminAnalytics {
  totalCandidates: number;
  sessionsCompleted: number;
  sessionsScheduled: number;
  averageScore: number;
  roleCoverage: Record<string, number>;
  atRiskCandidateIds: string[];
  practiceContextReadyCandidates: number;
  practiceContextGaps: CandidatePracticeContextGap[];
}

function countSpecificContextValues(values: string[]): number {
  return values.filter((value) => {
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 && !GENERIC_CONTEXT_TERMS.has(normalized);
  }).length;
}

export function auditCandidatePracticeContext(candidates: CandidateProfile[]): CandidatePracticeContextGap[] {
  return candidates.flatMap((candidate) => {
    const missing: CandidatePracticeContextMissingReason[] = [];

    if (countSpecificContextValues(candidate.practiceContext.jobDescriptionSignals) < MIN_JOB_DESCRIPTION_SIGNALS) {
      missing.push("job_description_signals");
    }

    if (countSpecificContextValues(candidate.practiceContext.companyResearchSignals) < MIN_COMPANY_RESEARCH_SIGNALS) {
      missing.push("company_research_signals");
    }

    if (countSpecificContextValues(candidate.practiceContext.resumeEvidenceAnchors) < MIN_RESUME_EVIDENCE_ANCHORS) {
      missing.push("resume_evidence_anchors");
    }

    return missing.length === 0 ? [] : [{ candidateId: candidate.id, missing }];
  });
}

export function computeAdminAnalytics({ candidates, sessions }: AdminAnalyticsInput): AdminAnalytics {
  const completed = sessions.filter((session) => session.status === "completed");
  const scored = completed.filter((session) => typeof session.finalScore === "number");
  const scoreTotal = scored.reduce((sum, session) => sum + (session.finalScore ?? 0), 0);
  const roleCoverage = candidates.reduce<Record<string, number>>((counts, candidate) => {
    counts[candidate.targetRole] = (counts[candidate.targetRole] ?? 0) + 1;
    return counts;
  }, {});
  const practiceContextGaps = auditCandidatePracticeContext(candidates);

  return {
    totalCandidates: candidates.length,
    sessionsCompleted: completed.length,
    sessionsScheduled: sessions.filter((session) => session.status === "scheduled").length,
    averageScore: scored.length === 0 ? 0 : Math.round(scoreTotal / scored.length),
    roleCoverage,
    atRiskCandidateIds: candidates
      .filter((candidate) => candidate.readinessScore < 80)
      .map((candidate) => candidate.id),
    practiceContextReadyCandidates: candidates.length - practiceContextGaps.length,
    practiceContextGaps
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
