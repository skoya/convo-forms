import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
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

async function track(
  request: APIRequestContext,
  payload: Record<string, unknown>,
) {
  await request.post("/api/analytics/track", {
    data: payload,
  });
}

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/seed");

  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-curated",
    sessionId: "sess-curated-1",
    eventType: "session_start",
    language: "en-US",
    source: "linkedin",
    adContext: "Launch",
  });
  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-curated",
    sessionId: "sess-curated-2",
    eventType: "session_start",
    language: "en-US",
    source: "linkedin",
    adContext: "Launch",
  });
  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-curated",
    sessionId: "sess-curated-1",
    eventType: "lead_submit",
    language: "en-US",
    source: "linkedin",
    adContext: "Launch",
  });
  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-runtime",
    sessionId: "sess-runtime-1",
    eventType: "session_start",
    language: "de-CH",
    source: "newsletter",
    adContext: "Runtime",
  });
  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-runtime",
    sessionId: "sess-runtime-2",
    eventType: "session_start",
    language: "de-CH",
    source: "newsletter",
    adContext: "Runtime",
  });
  await track(request, {
    campaignId: "cmp-ubs-wealth-launch",
    variantId: "exp-ubs-wealth-runtime",
    sessionId: "sess-runtime-3",
    eventType: "session_start",
    language: "de-CH",
    source: "newsletter",
    adContext: "Runtime",
  });
});

test("variant comparison shows conversion deltas and denominator definitions", async ({
  page,
}) => {
  await signInAsMarketer(page);

  await expect(page.getByTestId("analytics-dashboard")).toContainText(
    "Conversion rate = lead_submit / session_start",
  );
  await expect(page.getByTestId("variant-comparison")).toContainText(
    "Curated guidance path",
  );
  await expect(page.getByTestId("variant-comparison")).toContainText(
    "Conversion rate 0.33",
  );
  await expect(page.getByTestId("variant-comparison")).toContainText(
    "Runtime simulation path",
  );
  await expect(page.getByTestId("variant-comparison")).toContainText(
    "Conversion rate 0.00",
  );
});

test("funnel math and split views stay consistent across refresh", async ({ page }) => {
  await signInAsMarketer(page);

  await expect(page.getByTestId("analytics-funnel")).toContainText(
    "Session start",
  );
  await expect(page.getByTestId("analytics-funnel")).toContainText("6");
  await expect(page.getByTestId("analytics-funnel")).toContainText(
    "Lead submit",
  );
  await expect(page.getByTestId("analytics-funnel")).toContainText("1");

  await page.reload();

  await expect(page.getByTestId("analytics-dashboard")).toContainText(
    "Language splits",
  );
  await expect(page.getByTestId("analytics-dashboard")).toContainText("de-CH");
  await expect(page.getByTestId("analytics-dashboard")).toContainText(
    "newsletter",
  );
  await expect(page.getByTestId("analytics-dashboard")).toContainText("Runtime");
});
