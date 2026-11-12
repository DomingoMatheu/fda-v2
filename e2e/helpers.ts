import type { Page, Request } from "@playwright/test";

// WebKit logs these when its own native video controls cannot load their
// icons in the test browser; they do not come from the site.
const BROWSER_NOISE = /^Button failed to load, iconName = /;

// Vercel serves the Analytics script only on its own hosting, so it 404s
// when the production build runs locally.
const VERCEL_ONLY = /\/_vercel\//;

// Next.js cancels link prefetches (RSC requests) it no longer needs, for
// example when the links re-render; a cancelled prefetch is not a failure.
function isCancelledPrefetch(request: Request): boolean {
  const reason = request.failure()?.errorText ?? "";
  return (
    new URL(request.url()).searchParams.has("_rsc") &&
    /aborted|cancelled/i.test(reason)
  );
}

// Collects console errors, uncaught exceptions and failed same-origin
// requests so a test can assert the page loaded cleanly.
export function trackPageProblems(page: Page): string[] {
  const problems: string[] = [];
  const origin = (url: string): string => new URL(url).origin;

  page.on("console", (message) => {
    const text = message.text();
    const location = message.location().url;
    if (
      message.type() === "error" &&
      !BROWSER_NOISE.test(text) &&
      !VERCEL_ONLY.test(location)
    ) {
      problems.push(`console: ${text}`);
    }
  });
  page.on("pageerror", (error) => problems.push(`exception: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (
      origin(request.url()) === origin(page.url()) &&
      !VERCEL_ONLY.test(request.url()) &&
      !isCancelledPrefetch(request)
    ) {
      problems.push(`request failed: ${request.url()}`);
    }
  });
  page.on("response", (response) => {
    const sameOrigin =
      origin(response.url()) === origin(page.url()) &&
      !VERCEL_ONLY.test(response.url());
    if (
      sameOrigin &&
      response.status() >= 400 &&
      response.url() !== page.url()
    ) {
      problems.push(`HTTP ${response.status()}: ${response.url()}`);
    }
  });

  return problems;
}

export async function scrollTo(page: Page, y: number): Promise<void> {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    y,
  );
}
