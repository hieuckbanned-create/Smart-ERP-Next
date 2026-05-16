# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests\user-journey.spec.ts >> smoke test: login page loads
- Location: tests\user-journey.spec.ts:3:1

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1 | import { test, expect } from "@playwright/test";
  2 | 
  3 | test("smoke test: login page loads", async ({ page }) => {
> 4 |   await page.goto("/");
    |              ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  5 |   await expect(page).toHaveURL(/login/);
  6 |   await expect(page.locator("form")).toBeVisible();
  7 | });
  8 | 
```