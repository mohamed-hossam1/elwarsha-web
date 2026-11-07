import { expect, test } from "@playwright/test";

test("switches between Arabic and English public pages", async ({ page }) => {
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } }),
    }),
  );
  await page.goto("/ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("اتعلّم");
  await page.getByRole("link", { name: "الخطة" }).click();
  await expect(page).toHaveURL(/\/ar\/roadmap/);
  await page.getByRole("button", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/roadmap\//);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await page.goto("/en/portal/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Sign in to see this week" }),
  ).toBeVisible();
});

test("serves crawlable localized HTML", async ({ request }) => {
  const response = await request.get("/en/roadmap/");
  const html = await response.text();
  expect(html).toContain("Eight weeks. One concept each week.");
  expect(html).toContain('lang="en"');
  expect(html).toContain("The eight-week ElWarsha learning roadmap.");
});

test("redirects invalid locales to Arabic", async ({ page }) => {
  await page.goto("/fr/faq/");
  await expect(page).toHaveURL(/\/ar\/faq\//);
});
