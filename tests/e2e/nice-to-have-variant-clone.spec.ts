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

test("marketer can clone a seeded variant with the wizard", async ({ page }) => {
  await signInAsMarketer(page);

  await expect(page.getByTestId("marketer-summary")).toContainText("2");
  await page.getByTestId("clone-name-input").fill("Swiss planning clone");
  await page.getByTestId("clone-submit").click();

  await expect(page.getByTestId("clone-status")).toContainText(
    "Cloned variant Swiss planning clone.",
  );
  await expect(page.getByTestId("marketer-summary")).toContainText("3");
  await expect(page.getByTestId("variant-list")).toContainText(
    "Swiss planning clone",
  );
});
