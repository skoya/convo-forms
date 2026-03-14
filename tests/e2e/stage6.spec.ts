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

test("guided tour covers full marketer workflow", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Launch walkthrough" }).click();
  await expect(page.getByTestId("guided-tour")).toBeVisible();

  await expect(page.getByText("1) Enter marketer mode + set campaign context")).toBeVisible();
  await expect(page.getByText("Objective")).toBeVisible();
  await expect(page.getByText("Where to do it")).toBeVisible();
  await expect(page.getByText("Success signal")).toBeVisible();

  await page.getByTestId("tour-next").click();
  await expect(page.getByText("2) Configure variants from a marketer perspective")).toBeVisible();

  await page.getByTestId("tour-next").click();
  await expect(page.getByText("3) Run the visitor flow end-to-end")).toBeVisible();

  await page.getByTestId("tour-next").click();
  await expect(page.getByText("4) Inspect handoff, analytics, and iterate")).toBeVisible();

  await page.getByTestId("tour-next").click();
  await expect(page.getByTestId("tour-complete")).toContainText(
    "Walkthrough complete.",
  );
});

test("guided tour links route correctly", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Launch walkthrough" }).click();
  await page
    .getByTestId("guided-tour")
    .getByRole("link", { name: "Open marketer route" })
    .click();

  await expect(page).toHaveURL(/\/marketer$/);

  await page.goto("/");
  await page.getByRole("button", { name: "Launch walkthrough" }).click();
  await page.getByTestId("tour-next").click();
  await page.getByTestId("tour-next").click();
  await page
    .getByTestId("guided-tour")
    .getByRole("link", { name: "Open seeded visitor route" })
    .click();

  await expect(page).toHaveURL(/\/experience\/exp-ubs-wealth-curated$/);
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
  await expect(page.getByTestId("production-gap-register")).toContainText(
    "Prototype-to-production gap register",
  );
  await expect(page.getByText("Authentication and authorization")).toBeVisible();
});
