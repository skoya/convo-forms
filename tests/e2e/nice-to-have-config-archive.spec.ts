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
}

test("exported configuration archives can be imported into a clean workspace", async ({
  page,
  request,
}) => {
  await signInAsMarketer(page);

  await page.getByLabel("Campaign name").fill("Reusable archive campaign");
  await page
    .getByLabel("Headline")
    .fill("Carry the same high-net-worth journey into the next demo.");

  for (let index = 0; index < 6; index += 1) {
    await page.getByTestId("setup-continue").click();
  }

  await page.getByTestId("setup-continue").click();
  await page.getByTestId("config-export").click();

  await expect(page.getByTestId("config-status")).toContainText("Exported 1");
  await expect(page.getByTestId("config-archive-json")).toHaveValue(
    /Reusable archive campaign/,
  );

  const archiveJson = await page.getByTestId("config-archive-json").inputValue();
  expect(archiveJson).toContain("Reusable archive campaign");

  await request.post("/api/demo/reset");
  await page.reload();

  await expect(page.getByTestId("marketer-summary")).toContainText("0");

  await page.getByTestId("config-archive-json").fill(archiveJson);
  await page.getByTestId("config-import").click();

  await expect(page.getByTestId("config-status")).toContainText(
    "Imported 1 campaign and 2 variants.",
  );
  await expect(page.getByLabel("Campaign name")).toHaveValue(
    "Reusable archive campaign",
  );
  await expect(page.getByTestId("variant-list")).toContainText(
    "Primary concierge path",
  );
});
