import { expect, test, type Page } from "@playwright/test";
import {
  MARKETER_SESSION_COOKIE,
  MARKETER_SESSION_VALUE,
} from "@/lib/auth/marketer-session";

async function signInAsMarketer(page: Page) {
  await page.context().addCookies([
    {
      name: MARKETER_SESSION_COOKIE,
      value: MARKETER_SESSION_VALUE,
      url: "http://127.0.0.1:3001",
    },
  ]);
  await page.goto("/marketer");
}

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/seed");
});

test("submit is blocked without required consent", async ({ page }) => {
  await page.goto("/experience/exp-ubs-wealth-curated");

  await page.getByLabel("Full name").fill("Jordan Avery");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page.getByLabel("Primary planning need").fill("Portfolio review");
  await page.getByLabel("Decision timeline").fill("Next 90 days");
  await page.getByTestId("lead-submit-button").click();

  await expect(page.getByTestId("lead-errors")).toContainText(
    "Contact consent is required before submission.",
  );
  await expect(page.getByTestId("lead-errors")).toContainText(
    "Privacy notice acknowledgment is required.",
  );
});

test("qualification is shown only when enabled", async ({ page }) => {
  await page.goto("/experience/exp-ubs-wealth-curated");
  await expect(page.getByTestId("qualification-section")).toBeVisible();

  await page.goto("/experience/exp-ubs-wealth-runtime");
  await expect(page.getByTestId("qualification-section")).toHaveCount(0);
});

test("successful lead submission appears in the marketer CRM inspector", async ({
  page,
}) => {
  await page.goto("/experience/exp-ubs-wealth-curated");

  await page.getByLabel("Primary planning need").fill("Family planning");
  await page.getByLabel("Decision timeline").fill("This quarter");
  await page.getByLabel("Full name").fill("Jordan Avery");
  await page.getByLabel("Email address").fill("jordan@example.com");
  await page
    .getByText("I consent to being contacted about this educational inquiry.")
    .click();
  await page
    .getByText(
      "I acknowledge the privacy notice and understand how my information will be used.",
    )
    .click();
  await page.getByTestId("lead-submit-button").click();

  await expect(page.getByTestId("lead-submit-success")).toContainText(
    "Consent timestamp:",
  );

  await signInAsMarketer(page);
  await expect(page.getByTestId("crm-payload-inspector")).toContainText(
    "exp-ubs-wealth-curated",
  );
  await expect(page.getByTestId("crm-payload-inspector")).toContainText(
    "sess-exp-ubs-wealth-curated-visitor",
  );
});
