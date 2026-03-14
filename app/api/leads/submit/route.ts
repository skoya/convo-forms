import { NextRequest, NextResponse } from "next/server";
import { recordCrmPayload } from "@/lib/crm-sim/store";
import {
  buildLeadSubmissionResult,
  validateLeadSubmission,
  type LeadSubmissionInput,
} from "@/lib/leads/submission";
import { analyticsRepo, experienceRepo, leadRepo } from "@/lib/repos";

export const dynamic = "force-dynamic";

type SubmitLeadPayload = LeadSubmissionInput & {
  variantId: string;
};

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as SubmitLeadPayload;
  const experience = experienceRepo.getById(payload.variantId);

  if (!experience) {
    return NextResponse.json(
      {
        message: "Experience variant not found.",
      },
      { status: 404 },
    );
  }

  const errors = validateLeadSubmission(experience, payload);

  if (
    Object.keys(errors.leadFieldErrors).length > 0 ||
    Object.keys(errors.qualificationErrors).length > 0 ||
    errors.consentErrors.length > 0
  ) {
    return NextResponse.json(
      {
        message: "Lead submission is incomplete.",
        errors,
      },
      { status: 400 },
    );
  }

  const result = buildLeadSubmissionResult(experience, payload);
  leadRepo.upsert(result.lead);
  recordCrmPayload(result.crmPayload);
  result.analyticsEvents.forEach((event) => {
    analyticsRepo.upsert(event);
  });

  return NextResponse.json(result);
}
