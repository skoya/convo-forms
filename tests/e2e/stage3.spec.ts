import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/seed");
});

test("visitor journey shows recommendations without dead ends", async ({ page }) => {
  await page.goto("/experience/exp-ubs-wealth-curated");

  await expect(page.getByTestId("chat-thread")).toContainText("Welcome");
  await page
    .getByTestId("visitor-input")
    .fill("How can I prepare for a portfolio review?");
  await page.getByTestId("visitor-send").click();

  await expect(page.getByTestId("chat-thread")).toContainText(
    "I ranked these items",
  );
  await expect(page.getByTestId("recommendation-cards")).toContainText(
    "UBS Wealth Management",
  );
});

test("recommendation cards include rationale and click tracking", async ({ page }) => {
  await page.goto("/experience/exp-ubs-wealth-runtime");

  await expect(page.getByTestId("recommendation-cards")).toContainText(
    "Source URL",
  );
  await expect(page.getByTestId("recommendation-cards")).toContainText(
    "Rationale:",
  );

  await page.getByRole("button", { name: "Open recommendation" }).first().click();

  await expect(page.getByTestId("last-event")).toContainText(
    "recommendation_click",
  );
});

test("language behavior matches the configured variant languages", async ({ page }) => {
  await page.goto("/experience/exp-ubs-wealth-runtime");

  await page.getByTestId("language-select").selectOption("de-CH");

  await expect(page.getByTestId("chat-thread")).toContainText("Willkommen");
  await expect(page.getByText("Aktive Sprache")).toBeVisible();
});
