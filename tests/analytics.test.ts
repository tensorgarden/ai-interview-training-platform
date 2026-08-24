import { describe, expect, it } from "vitest";
import {
  auditCandidatePracticeContext,
  auditSessionInterviewFormatReadiness,
  buildCandidateProgressTimeline,
  computeAdminAnalytics
} from "@/lib/analytics";
import { demoCandidates, demoCoaches, demoSessions, questionBank } from "@/lib/demo-data";

describe("admin analytics", () => {
  it("summarizes candidate role coverage, completion rate, and average score", () => {
    const analytics = computeAdminAnalytics({
      candidates: demoCandidates,
      sessions: demoSessions,
      questions: questionBank,
      coaches: demoCoaches
    });

    expect(analytics.totalCandidates).toBe(4);
    expect(analytics.sessionsCompleted).toBe(4);
    expect(analytics.averageScore).toBe(83);
    expect(analytics.roleCoverage).toEqual({
      "Product Manager": 2,
      "Full Stack Engineer": 1,
      "Customer Success Manager": 1
    });
    expect(analytics.practiceContextReadyCandidates).toBe(4);
    expect(analytics.practiceContextGaps).toEqual([]);
    expect(analytics.formatCheckedUpcomingSessions).toBe(1);
    expect(analytics.formatReadyUpcomingSessions).toBe(1);
    expect(analytics.interviewFormatGaps).toEqual([]);
  });

  it("builds a chronological progress timeline for one candidate", () => {
    const timeline = buildCandidateProgressTimeline({
      candidateId: "cand_maya",
      sessions: demoSessions
    });

    expect(timeline).toEqual([
      { date: "2026-05-21", score: 76, label: "PM behavioral screen" },
      { date: "2026-05-29", score: 88, label: "PM product strategy loop" }
    ]);
  });

  it("keeps candidates anchored to job-specific signals and resume evidence", () => {
    for (const candidate of demoCandidates) {
      expect(candidate.practiceContext.jobDescriptionSignals.length).toBeGreaterThanOrEqual(2);
      expect(candidate.practiceContext.companyResearchSignals.length).toBeGreaterThanOrEqual(1);
      expect(candidate.practiceContext.resumeEvidenceAnchors.length).toBeGreaterThanOrEqual(2);
    }

    expect(demoCandidates[0].practiceContext.jobDescriptionSignals).toContain("activation analytics");
    expect(demoCandidates[0].practiceContext.companyResearchSignals).toContain("usage-based pricing motion");
  });

  it("makes AI-use boundaries explicit without treating authenticity cues as proof", () => {
    expect(new Set(demoCandidates.map((candidate) => candidate.practiceContext.aiUsePolicy))).toEqual(
      new Set(["practice_only", "disclosure_required", "employer_policy_unknown"])
    );
    expect(demoCandidates.find((candidate) => candidate.id === "cand_priya")?.practiceContext.aiUsePolicy).toBe(
      "employer_policy_unknown"
    );
  });

  it("checks upcoming sessions against the candidate interview format", () => {
    const scheduledBehavioralSession = demoSessions.find((session) => session.id === "sess_lena_followup");

    if (!scheduledBehavioralSession) {
      throw new Error("Missing scheduled behavioral demo session");
    }

    expect(
      auditSessionInterviewFormatReadiness({
        candidates: demoCandidates,
        sessions: demoSessions,
        questions: questionBank
      })
    ).toEqual([]);

    expect(
      auditSessionInterviewFormatReadiness({
        candidates: demoCandidates,
        sessions: [{ ...scheduledBehavioralSession, id: "sess_lena_misaligned", selectedQuestionIds: ["q_product_strategy"] }],
        questions: questionBank
      })
    ).toEqual([
      {
        sessionId: "sess_lena_misaligned",
        candidateId: "cand_lena",
        interviewFormat: "behavioral_loop",
        missing: ["format_question_alignment"],
        requiredQuestionSignals: ["behavioral", "coachability", "career-changer"]
      }
    ]);
  });

  it("keeps async video screener practice aligned to timed, self-contained answers", () => {
    const asyncVideoCandidate = {
      ...demoCandidates[0],
      id: "cand_async_video",
      practiceContext: {
        ...demoCandidates[0].practiceContext,
        interviewFormat: "async_video_screen" as const
      }
    };
    const asyncVideoQuestion = questionBank.find((question) => question.id === "q_async_video_answer");

    expect(asyncVideoQuestion?.tags).toContain("async-video");
    expect(asyncVideoQuestion?.tags).toContain("concise-answer");
    expect(asyncVideoQuestion?.prompt.toLowerCase()).toContain("ninety seconds");

    const misalignedSession = {
      ...demoSessions[4],
      id: "sess_async_video_misaligned",
      candidateId: "cand_async_video",
      selectedQuestionIds: ["q_product_strategy"]
    };

    expect(
      auditSessionInterviewFormatReadiness({
        candidates: [asyncVideoCandidate],
        sessions: [misalignedSession],
        questions: questionBank
      })
    ).toEqual([
      {
        sessionId: "sess_async_video_misaligned",
        candidateId: "cand_async_video",
        interviewFormat: "async_video_screen",
        missing: ["format_question_alignment"],
        requiredQuestionSignals: ["behavioral", "concise-answer"]
      }
    ]);

    expect(
      auditSessionInterviewFormatReadiness({
        candidates: [asyncVideoCandidate],
        sessions: [{ ...misalignedSession, selectedQuestionIds: ["q_async_video_answer"] }],
        questions: questionBank
      })
    ).toEqual([]);
  });

  it("includes career-narrative practice for non-linear candidates", () => {
    const careerNarrativeQuestion = questionBank.find((question) => question.tags.includes("career-changer"));
    const lenaFollowUp = demoSessions.find((session) => session.id === "sess_lena_followup");

    expect(careerNarrativeQuestion?.prompt.toLowerCase()).toContain("transferable evidence");
    expect(careerNarrativeQuestion?.prompt.toLowerCase()).toContain("job description");
    expect(careerNarrativeQuestion?.tags).toContain("non-linear-path");
    expect(lenaFollowUp?.selectedQuestionIds).toContain("q_career_pivot_narrative");
  });

  it("includes company- and role-specific closing-question practice", () => {
    const closingQuestion = questionBank.find((question) => question.id === "q_closing_questions");
    const lenaFollowUp = demoSessions.find((session) => session.id === "sess_lena_followup");

    expect(closingQuestion?.prompt.toLowerCase()).toContain("company research signal");
    expect(closingQuestion?.prompt.toLowerCase()).toContain("success criterion");
    expect(closingQuestion?.prompt.toLowerCase()).toContain("evaluate the role and team");
    expect(closingQuestion?.tags).toContain("two-way-fit");
    expect(lenaFollowUp?.selectedQuestionIds).toContain("q_closing_questions");
  });

  it("flags generic or under-evidenced practice context before sessions become canned", () => {
    const gaps = auditCandidatePracticeContext([
      ...demoCandidates,
      {
        ...demoCandidates[0],
        id: "cand_generic",
        practiceContext: {
          interviewFormat: "recruiter_screen",
          aiUsePolicy: 'practice_only',
          jobDescriptionSignals: ["communication", "leadership"],
          companyResearchSignals: ["company research"],
          resumeEvidenceAnchors: ["teamwork"]
        }
      }
    ]);

    expect(gaps).toEqual([
      {
        candidateId: "cand_generic",
        missing: ["job_description_signals", "company_research_signals", "resume_evidence_anchors"]
      }
    ]);
  });

  it("surfaces per-coach workload so admins can spot overloaded coaches", () => {
    const analytics = computeAdminAnalytics({
      candidates: demoCandidates,
      sessions: demoSessions,
      questions: questionBank,
      coaches: demoCoaches
    });

    expect(Object.keys(analytics.coachWorkload)).toHaveLength(2);

    const ava = analytics.coachWorkload["coach_ava"];
    expect(ava.coachName).toBe("Ava Patel");
    expect(ava.candidateCount).toBe(2);
    expect(ava.atRiskCandidateIds).toEqual(["cand_lena"]);

    const omar = analytics.coachWorkload["coach_omar"];
    expect(omar.coachName).toBe("Omar Chen");
    expect(omar.candidateCount).toBe(2);
    expect(omar.averageReadiness).toBe(83);
    expect(omar.atRiskCandidateIds).toEqual([]);
  });
});
