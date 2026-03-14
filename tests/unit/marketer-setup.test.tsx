import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarketerSetupChat } from "@/components/marketer-setup-chat";
import {
  cloneExperienceVariant,
  createCampaignAndVariants,
  createMarketerConfigArchive,
  deriveSetupValuesFromArchiveEntry,
  getDefaultVariantCloneValues,
  getDefaultSetupValues,
  importMarketerConfigArchive,
  parseMarketerConfigArchive,
  validateVariantCloneValues,
  validateSetupValues,
} from "@/lib/marketer/setup";
import { resetRepositories } from "@/lib/repos";
import type { RepositorySummary } from "@/lib/repos/types";

const emptySummary: RepositorySummary = {
  campaigns: 0,
  experiences: 0,
  leads: 0,
  analyticsEvents: 0,
};

describe("marketer setup helpers", () => {
  beforeEach(() => {
    resetRepositories();
  });

  it("provides defaults that support an A/B setup in seven steps", () => {
    const defaults = getDefaultSetupValues();

    expect(defaults.variantCount).toBe(2);
    expect(defaults.consentRequired).toBe(true);
    expect(defaults.leadFieldsText).toContain("fullName|Full name|required|text");
  });

  it("returns user-readable validation errors", () => {
    const errors = validateSetupValues({
      ...getDefaultSetupValues(),
      campaignName: "",
      headline: "",
      leadFieldsText: "bad-line",
      secondaryVariantName: "",
    });

    expect(errors.campaignName).toBe("Enter a campaign name to continue.");
    expect(errors.headline).toBe(
      "Add the ad headline so the journey has context.",
    );
    expect(errors.leadFieldsText).toBe(
      "Lead fields must use key|Label|required|type format.",
    );
    expect(errors.secondaryVariantName).toBe(
      "Add a second variant name to create the A/B test.",
    );
  });

  it("creates one campaign and two variants from the setup payload", () => {
    const result = createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Spring private banking launch",
      headline: "Discover a tailored planning path.",
    });

    expect(result.campaign.name).toBe("Spring private banking launch");
    expect(result.variants).toHaveLength(2);
    expect(result.variants[0].sharePath).toMatch(/^\/experience\/exp-/);
    expect(result.summary.experiences).toBeGreaterThanOrEqual(2);
  });

  it("exports and re-imports a typed workspace configuration archive", () => {
    createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Archive-ready setup",
      headline: "Re-use a high-conviction journey.",
    });

    const archive = createMarketerConfigArchive();
    const restored = importMarketerConfigArchive(
      parseMarketerConfigArchive(JSON.stringify(archive)),
    );

    expect(archive.campaigns).toHaveLength(1);
    expect(archive.campaigns[0].variants).toHaveLength(2);
    expect(restored.importedCampaigns).toBe(1);
    expect(restored.importedVariants).toBe(2);
    expect(restored.summary.experiences).toBeGreaterThanOrEqual(2);
  });

  it("derives setup values from an imported archive entry", () => {
    const created = createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Northern Europe private wealth",
      headline: "Make advisory conversations easier to start.",
    });

    const archive = createMarketerConfigArchive();
    const values = deriveSetupValuesFromArchiveEntry(archive.campaigns[0]);

    expect(values.campaignName).toBe(created.campaign.name);
    expect(values.primaryVariantName).toBe(created.variants[0].name);
    expect(values.variantCount).toBe(2);
    expect(values.languagesText).toContain("en-US");
  });

  it("validates and clones a variant into the same campaign", () => {
    const created = createCampaignAndVariants({
      ...getDefaultSetupValues(),
      campaignName: "Clone-ready journey",
      headline: "Keep the advisory path but change the wrapper.",
    });
    const sourceVariant = created.variants[0];
    const cloneValues = {
      ...getDefaultVariantCloneValues(sourceVariant),
      name: "Embedded clone",
      layoutMode: "embedded" as const,
      languagesText: "en-US, fr-CH",
    };

    expect(validateVariantCloneValues(cloneValues)).toEqual({});

    const result = cloneExperienceVariant(cloneValues);

    expect(result.variant.campaignId).toBe(sourceVariant.campaignId);
    expect(result.variant.layoutMode).toBe("embedded");
    expect(result.variant.languages).toEqual(["en-US", "fr-CH"]);
    expect(result.summary.experiences).toBeGreaterThanOrEqual(3);
  });
});

describe("MarketerSetupChat", () => {
  beforeEach(() => {
    resetRepositories();
  });

  it("shows inline validation on the first step", async () => {
    const user = userEvent.setup();

    render(
      <MarketerSetupChat
        initialExperiences={[]}
        initialSummary={emptySummary}
      />,
    );

    await user.clear(screen.getByLabelText("Campaign name"));
    await user.clear(screen.getByLabelText("Headline"));
    await user.click(screen.getByTestId("setup-continue"));

    expect(
      screen.getByText("Enter a campaign name to continue."),
    ).toBeVisible();
    expect(
      screen.getByText("Add the ad headline so the journey has context."),
    ).toBeVisible();
  });

  it("advances through steps and renders created share links", async () => {
    const user = userEvent.setup();
    const submitSetup = vi.fn().mockResolvedValue(
      createCampaignAndVariants({
        ...getDefaultSetupValues(),
        campaignName: "Nordic wealth expansion",
        headline: "Build confidence with every conversation.",
      }),
    );

    render(
      <MarketerSetupChat
        initialExperiences={[]}
        initialSummary={emptySummary}
        submitSetup={submitSetup}
      />,
    );

    await user.type(
      screen.getByLabelText("Campaign name"),
      "Nordic wealth expansion",
    );
    await user.type(
      screen.getByLabelText("Headline"),
      "Build confidence with every conversation.",
    );

    for (let index = 0; index < 6; index += 1) {
      await user.click(screen.getByTestId("setup-continue"));
    }

    expect(screen.getByTestId("setup-review")).toBeVisible();

    await user.click(screen.getByTestId("setup-continue"));

    expect(submitSetup).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("setup-result")).toBeVisible();
    expect(screen.getByText("Open Primary concierge path")).toBeVisible();
    expect(screen.getByText("Open Alternative insight-led path")).toBeVisible();
  });

  it("imports a configuration archive and reloads the setup form", async () => {
    const user = userEvent.setup();
    const archive = {
      version: 1 as const,
      exportedAt: "2026-03-14T12:00:00.000Z",
      campaigns: [
        {
          campaign: {
            id: "cmp-imported",
            name: "Imported wealth campaign",
            adContext: {
              source: "linkedin",
              audience: "uhnw-family-office",
              headline: "Imported headline",
              promise: "Imported promise",
              cta: "Imported CTA",
            },
            createdAt: "2026-03-14T12:00:00.000Z",
          },
          variants: [
            {
              id: "exp-imported-primary",
              campaignId: "cmp-imported",
              name: "Imported primary",
              conversionGoal: "advisor-consultation",
              contentMode: "curated" as const,
              curatedUrls: ["https://www.ubs.com/global/en/wealthmanagement.html"],
              languages: ["en-US", "de-CH"],
              qualificationEnabled: true,
              consentRequired: true,
              safetyProfile: "educational-only" as const,
              identificationMode: "anonymous-first" as const,
              leadFields: [
                {
                  key: "fullName",
                  label: "Full name",
                  required: true,
                  type: "text",
                },
              ],
              layoutMode: "fullscreen" as const,
              sharePath: "/experience/exp-imported-primary",
              createdAt: "2026-03-14T12:00:00.000Z",
            },
          ],
        },
      ],
    };
    const importConfig = vi.fn().mockResolvedValue({
      archive,
      importedCampaigns: 1,
      importedVariants: 1,
      summary: {
        campaigns: 1,
        experiences: 1,
        leads: 0,
        analyticsEvents: 0,
      },
      experiences: archive.campaigns[0].variants,
    });

    render(
      <MarketerSetupChat
        exportConfig={vi.fn()}
        importConfig={importConfig}
        initialExperiences={[]}
        initialSummary={emptySummary}
      />,
    );

    fireEvent.change(screen.getByTestId("config-archive-json"), {
      target: {
        value: JSON.stringify(archive, null, 2),
      },
    });
    await user.click(screen.getByTestId("config-import"));

    expect(importConfig).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("config-status").textContent).toContain(
      "Imported 1 campaign and 1 variant.",
    );
    expect(screen.getByLabelText("Campaign name")).toHaveValue(
      "Imported wealth campaign",
    );
    expect(screen.getByTestId("variant-list").textContent).toContain(
      "Imported primary",
    );
  });

  it("clones a selected variant from the wizard", async () => {
    const user = userEvent.setup();
    const sourceVariant = {
      id: "exp-source",
      campaignId: "cmp-source",
      name: "Source variant",
      conversionGoal: "advisor-consultation",
      contentMode: "curated" as const,
      curatedUrls: ["https://www.ubs.com/global/en/wealthmanagement.html"],
      languages: ["en-US"],
      qualificationEnabled: true,
      consentRequired: true,
      safetyProfile: "educational-only" as const,
      identificationMode: "anonymous-first" as const,
      leadFields: [
        {
          key: "email",
          label: "Email",
          required: true,
          type: "email",
        },
      ],
      layoutMode: "fullscreen" as const,
      sharePath: "/experience/exp-source",
      createdAt: "2026-03-14T12:00:00.000Z",
    };
    const cloneVariant = vi.fn().mockResolvedValue({
      variant: {
        ...sourceVariant,
        id: "exp-clone",
        name: "Embedded source clone",
        layoutMode: "embedded" as const,
        sharePath: "/experience/exp-clone",
      },
      summary: {
        campaigns: 1,
        experiences: 2,
        leads: 0,
        analyticsEvents: 0,
      },
      experiences: [
        sourceVariant,
        {
          ...sourceVariant,
          id: "exp-clone",
          name: "Embedded source clone",
          layoutMode: "embedded" as const,
          sharePath: "/experience/exp-clone",
        },
      ],
    });

    render(
      <MarketerSetupChat
        cloneVariant={cloneVariant}
        exportConfig={vi.fn()}
        importConfig={vi.fn()}
        initialExperiences={[sourceVariant]}
        initialSummary={{
          campaigns: 1,
          experiences: 1,
          leads: 0,
          analyticsEvents: 0,
        }}
      />,
    );

    await user.clear(screen.getByTestId("clone-name-input"));
    await user.type(
      screen.getByTestId("clone-name-input"),
      "Embedded source clone",
    );
    await user.selectOptions(screen.getByTestId("clone-source-select"), "exp-source");
    await user.click(screen.getByTestId("clone-submit"));

    await waitFor(() => {
      expect(cloneVariant).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByTestId("clone-status").textContent).toContain(
        "Cloned variant Embedded source clone.",
      );
    });
    expect(screen.getByTestId("variant-list").textContent).toContain(
      "Embedded source clone",
    );
  });
});
