import type { Campaign, ExperienceVariant, LeadField } from "@/lib/domain/models";
import { campaignRepo, experienceRepo, getRepositorySummary } from "@/lib/repos";
import type { RepositorySummary } from "@/lib/repos/types";

export type MarketerSetupValues = {
  campaignName: string;
  adSource: string;
  audience: string;
  headline: string;
  promise: string;
  cta: string;
  conversionGoal: string;
  contentMode: "curated" | "runtime-simulated";
  curatedUrlsText: string;
  languagesText: string;
  leadFieldsText: string;
  qualificationEnabled: boolean;
  consentRequired: boolean;
  safetyProfile: "educational-only" | "marketer-defined";
  identificationMode: "anonymous-first" | "early-identification";
  layoutMode: "embedded" | "fullscreen";
  variantCount: 1 | 2;
  primaryVariantName: string;
  secondaryVariantName: string;
};

export type MarketerSetupErrors = Partial<
  Record<keyof MarketerSetupValues, string>
>;

export type MarketerSetupResult = {
  campaign: Campaign;
  variants: ExperienceVariant[];
  summary: RepositorySummary;
};

export function getDefaultSetupValues(): MarketerSetupValues {
  return {
    campaignName: "",
    adSource: "linkedin",
    audience: "hnw-executives",
    headline: "",
    promise: "Explore wealth planning themes through a guided conversation.",
    cta: "Start the conversation",
    conversionGoal: "advisor-consultation",
    contentMode: "curated",
    curatedUrlsText:
      "https://www.ubs.com/global/en/wealthmanagement.html\nhttps://www.ubs.com/global/en/wealthmanagement/chief-investment-office.html",
    languagesText: "en-US",
    leadFieldsText:
      "fullName|Full name|required|text\nemail|Email address|required|email",
    qualificationEnabled: true,
    consentRequired: true,
    safetyProfile: "educational-only",
    identificationMode: "anonymous-first",
    layoutMode: "fullscreen",
    variantCount: 2,
    primaryVariantName: "Primary concierge path",
    secondaryVariantName: "Alternative insight-led path",
  };
}

export function parseDelimitedLines(value: string): string[] {
  return value
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function parseLeadFields(value: string): LeadField[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, label, requiredValue, type] = line.split("|").map((part) => {
        return part.trim();
      });

      return {
        key,
        label,
        required:
          requiredValue === "required" ||
          requiredValue === "true" ||
          requiredValue === "yes",
        type,
      };
    });
}

function isLeadFieldDefinitionValid(line: string): boolean {
  const [key, label, requiredValue, type] = line.split("|").map((part) => {
    return part.trim();
  });

  return Boolean(
    key &&
      label &&
      type &&
      ["required", "optional", "true", "false", "yes", "no"].includes(
        requiredValue,
      ),
  );
}

export function validateSetupValues(
  values: MarketerSetupValues,
): MarketerSetupErrors {
  const errors: MarketerSetupErrors = {};

  if (!values.campaignName.trim()) {
    errors.campaignName = "Enter a campaign name to continue.";
  }

  if (!values.headline.trim()) {
    errors.headline = "Add the ad headline so the journey has context.";
  }

  if (!values.conversionGoal.trim()) {
    errors.conversionGoal = "Choose a conversion goal.";
  }

  if (
    values.contentMode === "curated" &&
    parseDelimitedLines(values.curatedUrlsText).length === 0
  ) {
    errors.curatedUrlsText =
      "Provide at least one UBS URL for curated content mode.";
  }

  if (parseDelimitedLines(values.languagesText).length === 0) {
    errors.languagesText = "Provide at least one language code.";
  }

  const leadFieldLines = values.leadFieldsText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (leadFieldLines.length === 0) {
    errors.leadFieldsText = "Provide at least one lead field definition.";
  } else if (!leadFieldLines.every(isLeadFieldDefinitionValid)) {
    errors.leadFieldsText =
      "Lead fields must use key|Label|required|type format.";
  }

  if (!values.primaryVariantName.trim()) {
    errors.primaryVariantName = "Give the primary variant a clear name.";
  }

  if (values.variantCount === 2 && !values.secondaryVariantName.trim()) {
    errors.secondaryVariantName =
      "Add a second variant name to create the A/B test.";
  }

  return errors;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function nextCampaignId(name: string): string {
  return `cmp-${slugify(name)}-${campaignRepo.count() + 1}`;
}

function nextVariantId(name: string): string {
  return `exp-${slugify(name)}-${experienceRepo.count() + 1}`;
}

function buildVariantNames(values: MarketerSetupValues): string[] {
  if (values.variantCount === 1) {
    return [values.primaryVariantName.trim()];
  }

  return [
    values.primaryVariantName.trim(),
    values.secondaryVariantName.trim(),
  ];
}

export function createCampaignAndVariants(
  values: MarketerSetupValues,
): MarketerSetupResult {
  const createdAt = new Date().toISOString();
  const campaignId = nextCampaignId(values.campaignName);
  const campaign: Campaign = {
    id: campaignId,
    name: values.campaignName.trim(),
    adContext: {
      source: values.adSource.trim(),
      audience: values.audience.trim(),
      headline: values.headline.trim(),
      promise: values.promise.trim(),
      cta: values.cta.trim(),
    },
    createdAt,
  };

  campaignRepo.upsert(campaign);

  const curatedUrls = parseDelimitedLines(values.curatedUrlsText);
  const languages = parseDelimitedLines(values.languagesText);
  const leadFields = parseLeadFields(values.leadFieldsText);

  const variants = buildVariantNames(values).map((variantName) => {
    const id = nextVariantId(variantName);
    const variant: ExperienceVariant = {
      id,
      campaignId,
      name: variantName,
      conversionGoal: values.conversionGoal.trim(),
      contentMode: values.contentMode,
      curatedUrls,
      languages,
      qualificationEnabled: values.qualificationEnabled,
      consentRequired: values.consentRequired,
      safetyProfile: values.safetyProfile,
      identificationMode: values.identificationMode,
      leadFields,
      layoutMode: values.layoutMode,
      sharePath: `/experience/${id}`,
      createdAt,
    };
    experienceRepo.upsert(variant);
    return variant;
  });

  return {
    campaign,
    variants,
    summary: getRepositorySummary(),
  };
}
