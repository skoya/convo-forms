import { expect, test } from "@playwright/test";

test("demo seed produces showcase-ready data", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("seed-demo-button").click();

  await expect(page.getByTestId("repo-summary")).toContainText("Leads");
  await expect(page.getByTestId("repo-summary")).toContainText("1");
  await expect(page.getByTestId("repo-summary")).toContainText(
    "Analytics events",
  );
  await expect(page.getByTestId("repo-summary")).toContainText("3");
});

test("guided tour completes", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Launch walkthrough" }).click();
  await expect(page.getByTestId("guided-tour")).toBeVisible();

  for (let index = 0; index < 4; index += 1) {
    await page.getByTestId("tour-next").click();
  }

  await expect(page.getByTestId("tour-complete")).toContainText(
    "Walkthrough complete.",
  );
});

test("playbook sections exist and are readable", async ({ page }) => {
  await page.goto("/playbook");

  await expect(
    page.getByRole("heading", { name: "Run the prototype in under 10 minutes" }),
  ).toBeVisible();
  await expect(page.getByText("1. Seed the workspace")).toBeVisible();
  await expect(page.getByText("2. Configure the marketer path")).toBeVisible();
  await expect(page.getByText("3. Run the visitor demo")).toBeVisible();
  await expect(page.getByText("4. Inspect CRM and analytics")).toBeVisible();
});
