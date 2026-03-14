import { expect, test, type Page } from "@playwright/test";
import {
  MARKETER_SESSION_COOKIE,
  MARKETER_SESSION_VALUE,
} from "@/lib/auth/marketer-session";

test.beforeEach(async ({ request }) => {
  await request.post("/api/demo/reset");
  await request.post("/api/demo/seed");
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
}

test("synthetic traffic generation populates replayable sessions", async ({
  page,
}) => {
  await signInAsMarketer(page);

  await page.getByTestId("synthetic-sessions-input").fill("2");
  await page.getByTestId("synthetic-generate").click();

  await expect(page.getByTestId("synthetic-status")).toContainText("Generated");
  await expect(page.getByTestId("replay-session-list")).toContainText("synthetic-");

  await page.getByTestId("replay-session-list").getByRole("button").first().click();

  await expect(page.getByTestId("replay-steps")).toContainText("Session started");
  await expect(page.getByTestId("replay-steps")).toContainText("Visitor asked:");
});
