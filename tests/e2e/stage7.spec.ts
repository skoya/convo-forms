import AxeBuilder from "@axe-core/playwright";
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

test("critical and serious accessibility checks stay clean on primary routes", async ({
  page,
}) => {
  const routes = ["/", "/marketer", "/experience/exp-ubs-wealth-curated"];

  for (const route of routes) {
    if (route === "/marketer") {
      await signInAsMarketer(page);
    } else {
      await page.goto(route);
    }

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter((violation) => {
      return violation.impact === "critical" || violation.impact === "serious";
    });

    expect(
      blockingViolations,
      `${route} has blocking accessibility violations`,
    ).toHaveLength(0);
  }
});

test("primary flows render across mobile, tablet, and desktop viewports", async ({
  page,
}) => {
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 834, height: 1194 },
    { name: "desktop", width: 1280, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/");
    await expect(page.getByTestId("landing-title")).toBeVisible();

    await signInAsMarketer(page);
    await expect(page.getByTestId("analytics-dashboard")).toBeVisible();

    await page.goto("/experience/exp-ubs-wealth-runtime");
    await expect(page.getByTestId("recommendation-cards")).toBeVisible();
  }
});
