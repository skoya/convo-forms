import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MarketerSetupChat } from "@/components/marketer-setup-chat";
import {
  createCampaignAndVariants,
  getDefaultSetupValues,
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
});
