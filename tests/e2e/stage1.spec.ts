import { expect, test } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("landing-title")).toContainText(
    "Conversational wealth journeys",
  );
  await expect(page.getByTestId("repo-summary")).toContainText("Campaigns");
});

test("marketer route is blocked when unauthenticated", async ({ page }) => {
  await page.goto("/marketer");

  await expect(page.getByTestId("marketer-access-gate")).toContainText(
    "Marketer route is blocked",
  );
});

test("demo seed creates the expected entities", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("seed-demo-button").click();

  await expect(page.getByTestId("seed-result")).toContainText(
    "cmp-ubs-wealth-launch",
  );
  await expect(page.getByTestId("repo-summary")).toContainText("Campaigns");
  await expect(page.getByTestId("repo-summary")).toContainText("1");
  await expect(page.getByTestId("repo-summary")).toContainText(
    "Experience variants",
  );
  await expect(page.getByTestId("repo-summary")).toContainText("2");
  await page.getByRole("link", { name: "Open exp-ubs-wealth-curated" }).click();
  await expect(page).toHaveURL(/\/experience\/exp-ubs-wealth-curated$/);
  await expect(
    page.getByRole("heading", { name: "Curated guidance path" }),
  ).toBeVisible();
});
