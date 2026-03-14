import type { Campaign, ExperienceVariant, LeadField } from "@/lib/domain/models";
import {
  campaignRepo,
  experienceRepo,
  getRepositorySummary,
  listCampaigns,
  listExperiences,
} from "@/lib/repos";
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

export type MarketerConfigArchiveEntry = {
  campaign: Campaign;
  variants: ExperienceVariant[];
};

export type MarketerConfigArchive = {
  version: 1;
  exportedAt: string;
  campaigns: MarketerConfigArchiveEntry[];
};

export type MarketerConfigImportResult = {
  archive: MarketerConfigArchive;
  importedCampaigns: number;
  importedVariants: number;
  summary: RepositorySummary;
  experiences: ExperienceVariant[];
};

export type VariantCloneValues = {
  sourceVariantId: string;
  name: string;
  contentMode: "curated" | "runtime-simulated";
  layoutMode: "embedded" | "fullscreen";
  languagesText: string;
};

export type VariantCloneErrors = Partial<Record<keyof VariantCloneValues, string>>;

export type VariantCloneResult = {
  variant: ExperienceVariant;
  summary: RepositorySummary;
  experiences: ExperienceVariant[];
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
      "https://www.blackrock.com/us/individual/insights\nhttps://www.fidelity.com/learning-center/overview",
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

export function getDefaultVariantCloneValues(
  variant?: ExperienceVariant,
): VariantCloneValues {
  return {
    sourceVariantId: variant?.id ?? "",
    name: variant ? `${variant.name} clone` : "",
    contentMode: variant?.contentMode ?? "curated",
    layoutMode: variant?.layoutMode ?? "fullscreen",
    languagesText: variant?.languages.join(", ") ?? "en-US",
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

function formatLeadFields(fields: LeadField[]): string {
  return fields
    .map((field) => {
      return [
        field.key,
        field.label,
        field.required ? "required" : "optional",
        field.type,
      ].join("|");
    })
    .join("\n");
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
      "Provide at least one reference URL for curated content mode.";
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

export function validateVariantCloneValues(
  values: VariantCloneValues,
  availableVariants: ExperienceVariant[] = listExperiences(),
): VariantCloneErrors {
  const errors: VariantCloneErrors = {};
  const sourceVariant = availableVariants.find((variant) => {
    return variant.id === values.sourceVariantId;
  });

  if (!values.sourceVariantId.trim() || !sourceVariant) {
    errors.sourceVariantId = "Choose a source variant to clone.";
  }

  if (!values.name.trim()) {
    errors.name = "Give the cloned variant a distinct name.";
  } else if (
    sourceVariant &&
    availableVariants
      .filter((variant) => variant.campaignId === sourceVariant.campaignId)
      .some((variant) => {
        return (
          variant.id !== values.sourceVariantId &&
          variant.name.trim().toLowerCase() === values.name.trim().toLowerCase()
        );
      })
  ) {
    errors.name = "Choose a name that is not already used in this campaign.";
  }

  if (parseDelimitedLines(values.languagesText).length === 0) {
    errors.languagesText = "Provide at least one language code for the clone.";
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isLeadField(value: unknown): value is LeadField {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.key === "string" &&
    typeof value.label === "string" &&
    typeof value.required === "boolean" &&
    typeof value.type === "string"
  );
}

function isCampaign(value: unknown): value is Campaign {
  if (!isRecord(value) || !isRecord(value.adContext)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.createdAt === "string" &&
    isOptionalString(value.adContext.source) &&
    isOptionalString(value.adContext.audience) &&
    isOptionalString(value.adContext.headline) &&
    isOptionalString(value.adContext.promise) &&
    isOptionalString(value.adContext.cta)
  );
}

function isExperienceVariant(value: unknown): value is ExperienceVariant {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.campaignId === "string" &&
    typeof value.name === "string" &&
    typeof value.conversionGoal === "string" &&
    (value.contentMode === "curated" ||
      value.contentMode === "runtime-simulated") &&
    isStringArray(value.curatedUrls) &&
    isStringArray(value.languages) &&
    typeof value.qualificationEnabled === "boolean" &&
    typeof value.consentRequired === "boolean" &&
    (value.safetyProfile === "educational-only" ||
      value.safetyProfile === "marketer-defined") &&
    (value.identificationMode === "anonymous-first" ||
      value.identificationMode === "early-identification") &&
    Array.isArray(value.leadFields) &&
    value.leadFields.every(isLeadField) &&
    (value.layoutMode === "embedded" || value.layoutMode === "fullscreen") &&
    typeof value.sharePath === "string" &&
    typeof value.createdAt === "string"
  );
}

function isMarketerConfigArchiveEntry(
  value: unknown,
): value is MarketerConfigArchiveEntry {
  if (!isRecord(value) || !Array.isArray(value.variants)) {
    return false;
  }

  return isCampaign(value.campaign) && value.variants.every(isExperienceVariant);
}

export function isMarketerConfigArchive(
  value: unknown,
): value is MarketerConfigArchive {
  if (!isRecord(value) || !Array.isArray(value.campaigns)) {
    return false;
  }

  return (
    value.version === 1 &&
    typeof value.exportedAt === "string" &&
    value.campaigns.every(isMarketerConfigArchiveEntry)
  );
}

export function coerceMarketerConfigArchive(
  value: unknown,
): MarketerConfigArchive {
  if (!isMarketerConfigArchive(value)) {
    throw new Error("Configuration JSON must match the workspace archive schema.");
  }

  return value;
}

export function parseMarketerConfigArchive(
  value: string,
): MarketerConfigArchive {
  try {
    return coerceMarketerConfigArchive(JSON.parse(value) as unknown);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error("Configuration JSON is invalid.");
    }

    throw error;
  }
}

function normalizeImportedVariant(
  campaignId: string,
  variant: ExperienceVariant,
): ExperienceVariant {
  return {
    ...variant,
    campaignId,
    sharePath: `/experience/${variant.id}`,
  };
}

export function createMarketerConfigArchive(): MarketerConfigArchive {
  const experiencesByCampaign = new Map<string, ExperienceVariant[]>();

  listExperiences().forEach((variant) => {
    const variants = experiencesByCampaign.get(variant.campaignId) ?? [];
    variants.push(variant);
    experiencesByCampaign.set(variant.campaignId, variants);
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    campaigns: listCampaigns().map((campaign) => {
      return {
        campaign,
        variants: experiencesByCampaign.get(campaign.id) ?? [],
      };
    }),
  };
}

export function importMarketerConfigArchive(
  archive: MarketerConfigArchive,
): MarketerConfigImportResult {
  archive.campaigns.forEach(({ campaign, variants }) => {
    campaignRepo.upsert(campaign);

    const importedVariantIds = new Set(variants.map((variant) => variant.id));
    experienceRepo.listByCampaignId(campaign.id).forEach((variant) => {
      if (!importedVariantIds.has(variant.id)) {
        experienceRepo.delete(variant.id);
      }
    });

    variants.forEach((variant) => {
      experienceRepo.upsert(normalizeImportedVariant(campaign.id, variant));
    });
  });

  return {
    archive,
    importedCampaigns: archive.campaigns.length,
    importedVariants: archive.campaigns.reduce((count, entry) => {
      return count + entry.variants.length;
    }, 0),
    summary: getRepositorySummary(),
    experiences: listExperiences(),
  };
}

export function deriveSetupValuesFromArchiveEntry(
  entry: MarketerConfigArchiveEntry,
): MarketerSetupValues {
  const defaults = getDefaultSetupValues();
  const primaryVariant = entry.variants[0];
  const secondaryVariant = entry.variants[1];

  if (!primaryVariant) {
    return {
      ...defaults,
      campaignName: entry.campaign.name,
      adSource: entry.campaign.adContext.source ?? defaults.adSource,
      audience: entry.campaign.adContext.audience ?? defaults.audience,
      headline: entry.campaign.adContext.headline ?? defaults.headline,
      promise: entry.campaign.adContext.promise ?? defaults.promise,
      cta: entry.campaign.adContext.cta ?? defaults.cta,
      variantCount: 1,
    };
  }

  return {
    campaignName: entry.campaign.name,
    adSource: entry.campaign.adContext.source ?? defaults.adSource,
    audience: entry.campaign.adContext.audience ?? defaults.audience,
    headline: entry.campaign.adContext.headline ?? defaults.headline,
    promise: entry.campaign.adContext.promise ?? defaults.promise,
    cta: entry.campaign.adContext.cta ?? defaults.cta,
    conversionGoal: primaryVariant.conversionGoal,
    contentMode: primaryVariant.contentMode,
    curatedUrlsText: primaryVariant.curatedUrls.join("\n"),
    languagesText: primaryVariant.languages.join(", "),
    leadFieldsText: formatLeadFields(primaryVariant.leadFields),
    qualificationEnabled: primaryVariant.qualificationEnabled,
    consentRequired: primaryVariant.consentRequired,
    safetyProfile: primaryVariant.safetyProfile,
    identificationMode: primaryVariant.identificationMode,
    layoutMode: primaryVariant.layoutMode,
    variantCount: entry.variants.length > 1 ? 2 : 1,
    primaryVariantName: primaryVariant.name,
    secondaryVariantName:
      secondaryVariant?.name ?? defaults.secondaryVariantName,
  };
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

export function cloneExperienceVariant(
  values: VariantCloneValues,
): VariantCloneResult {
  const sourceVariant = experienceRepo.getById(values.sourceVariantId);

  if (!sourceVariant) {
    throw new Error("Source variant not found.");
  }

  const id = nextVariantId(values.name);
  const clonedVariant: ExperienceVariant = {
    ...sourceVariant,
    id,
    name: values.name.trim(),
    contentMode: values.contentMode,
    layoutMode: values.layoutMode,
    languages: parseDelimitedLines(values.languagesText),
    sharePath: `/experience/${id}`,
    createdAt: new Date().toISOString(),
  };

  experienceRepo.upsert(clonedVariant);

  return {
    variant: clonedVariant,
    summary: getRepositorySummary(),
    experiences: listExperiences(),
  };
}
