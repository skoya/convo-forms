import { expect, test, type Page } from "@playwright/test";
import {
  MARKETER_SESSION_COOKIE,
  MARKETER_SESSION_VALUE,
} from "@/lib/auth/marketer-session";

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/reset");
});

async function signInAsMarketer(page: Page) {
  await page.context().addCookies([
    {
      name: MARKETER_SESSION_COOKIE,
      value: MARKETER_SESSION_VALUE,
      url: "http://127.0.0.1:3001",
    },
  ]);
  await page.goto("/marketer");
  await expect(page.getByTestId("setup-step-title")).toContainText(
    "Campaign context",
  );
}

test("complete full setup and create two variants", async ({ page }) => {
  await signInAsMarketer(page);

  await page.getByLabel("Campaign name").fill("Summer advisory campaign");
  await page
    .getByLabel("Headline")
    .fill("Move from uncertainty to coordinated planning.");

  for (let index = 0; index < 6; index += 1) {
    await page.getByTestId("setup-continue").click();
  }

  await expect(page.getByTestId("setup-review")).toBeVisible();
  await page.getByTestId("setup-continue").click();

  await expect(page.getByTestId("setup-result")).toContainText(
    "Summer advisory campaign created.",
  );
  await expect(page.getByTestId("marketer-summary")).toContainText("1");
  await expect(page.getByTestId("variant-list")).toContainText(
    "Primary concierge path",
  );
  await expect(page.getByTestId("variant-list")).toContainText(
    "Alternative insight-led path",
  );
});

test("validation errors are readable in the marketer flow", async ({ page }) => {
  await signInAsMarketer(page);

  await page.getByLabel("Campaign name").fill("");
  await page.getByLabel("Headline").fill("");
  await page.getByTestId("setup-continue").click();

  await expect(page.getByText("Enter a campaign name to continue.")).toBeVisible();
  await expect(
    page.getByText("Add the ad headline so the journey has context."),
  ).toBeVisible();
});

test("created share links resolve to the visitor experience", async ({ page }) => {
  await signInAsMarketer(page);

  await page.getByLabel("Campaign name").fill("Autumn advice program");
  await page.getByLabel("Headline").fill("Elevate planning confidence.");

  for (let index = 0; index < 6; index += 1) {
    await page.getByTestId("setup-continue").click();
  }

  await page.getByTestId("setup-continue").click();
  await page.getByRole("link", { name: "Open Primary concierge path" }).click();

  await expect(page).toHaveURL(/\/experience\/exp-/);
  await expect(page.getByTestId("experience-title")).toContainText(
    "Primary concierge path",
  );
});
