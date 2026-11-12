import { expect, test, type Page } from "@playwright/test";
import { buildSeed } from "../app/sistema/_data/seed";
import { DEMO_PASSWORD } from "../app/sistema/_data/users";
import { memberBalance } from "../app/sistema/_lib/billing";
import { DEMO_TODAY } from "../app/sistema/_lib/clock";
import { accountHolder } from "../app/sistema/_lib/members";
import { checkPoolAccess } from "../app/sistema/_lib/pool-access";
import type { Member } from "../app/sistema/_types";
import { trackPageProblems } from "./helpers";

// The demo builds the same club on every load, so the tests pick their
// members from the same seed instead of hard-coding them.
const SEED = buildSeed();

function findMember(
  description: string,
  matches: (member: Member) => boolean,
): Member {
  const member = SEED.members.find(matches);
  if (!member) throw new Error(`The seed has no ${description}`);
  return member;
}

const DEBTOR = findMember(
  "active member who owes three months or more",
  (member) =>
    member.status === "activo" &&
    accountHolder(member, SEED).id === member.id &&
    memberBalance(member, SEED, DEMO_TODAY).status === "moroso",
);
const ALLOWED = findMember(
  "member allowed into the pool",
  (member) => checkPoolAccess(member, SEED, DEMO_TODAY).allowed,
);
const DENIED = findMember(
  "active member denied at the gate",
  (member) =>
    member.status === "activo" &&
    !checkPoolAccess(member, SEED, DEMO_TODAY).allowed,
);

async function login(page: Page, username = "secretaria"): Promise<void> {
  await page.goto("/sistema/login");
  await page.getByLabel("Usuario").fill(username);
  await page.getByLabel("Clave").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/sistema$/);
}

test.describe("sistema", () => {
  test("redirects to the login without a session", async ({ page }) => {
    await page.goto("/sistema/socios");

    await expect(page).toHaveURL(/\/sistema\/login$/);
    await expect(
      page.getByRole("heading", { name: "Ingresá al sistema" }),
    ).toBeVisible();
  });

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/sistema/login");
    await page.getByLabel("Usuario").fill("secretaria");
    await page.getByLabel("Clave").fill("otra-clave");
    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page.locator(".sys-form__error")).toContainText(
      "no son correctos",
    );
    await expect(page).toHaveURL(/\/sistema\/login$/);
  });

  test("signs in and loads the dashboard without errors", async ({ page }) => {
    await login(page);
    // Track problems from a clean load: the login redirect and the reload
    // cancel requests (link prefetches) on purpose.
    await page.waitForLoadState("networkidle");
    const problems = trackPageProblems(page);
    await page.reload();

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Hola");
    await page.waitForLoadState("load");
    expect(problems).toEqual([]);
  });

  test("hides the modules a role cannot use", async ({ page }) => {
    await login(page, "porteria");
    // On a phone the sidebar is a closed drawer, so look at the links
    // themselves rather than at what is visible.
    const link = (href: string) => page.locator(`.sys-nav a[href="${href}"]`);

    await expect(link("/sistema/temporada")).toHaveCount(1);
    await expect(link("/sistema/cobranza")).toHaveCount(0);
    await expect(link("/sistema/configuracion")).toHaveCount(0);
  });

  test("filters the member list by DNI", async ({ page }) => {
    await login(page);
    await page.goto("/sistema/socios");
    await page
      .getByLabel("Buscar en el listado de socios")
      .fill(DEBTOR.documentNumber);

    const rows = page.locator(".sys-table tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText(DEBTOR.lastName);
  });

  test("registering a payment leaves the member up to date", async ({
    page,
  }) => {
    await login(page);
    await page.goto(`/sistema/socios/${DEBTOR.id}`);
    const badges = page.locator(".sys-member__badges");
    await expect(badges).toContainText("Moroso");

    await page.getByRole("button", { name: "Registrar cobro" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Registrar cobro" });
    await dialog.getByRole("button", { name: /Confirmar cobro/ }).click();

    await expect(dialog).toHaveCount(0);
    await expect(badges).toContainText("Al día");
  });

  test("keeps changes after a reload until the demo is reset", async ({
    page,
  }) => {
    await login(page);
    await page.goto(`/sistema/socios/${DEBTOR.id}`);
    const badges = page.locator(".sys-member__badges");
    await page.getByRole("button", { name: "Registrar cobro" }).first().click();
    await page
      .getByRole("dialog", { name: "Registrar cobro" })
      .getByRole("button", { name: /Confirmar cobro/ })
      .click();
    await expect(badges).toContainText("Al día");

    await page.reload();
    await expect(badges).toContainText("Al día");

    // On a phone the reset button lives in the closed menu.
    const openMenu = page.getByRole("button", { name: "Abrir menú" });
    if (await openMenu.isVisible()) await openMenu.click();
    await page.getByRole("button", { name: "Reiniciar demo" }).click();
    await page
      .getByRole("dialog", { name: "¿Reiniciar la demo?" })
      .getByRole("button", { name: "Reiniciar" })
      .click();
    await expect(badges).toContainText("Moroso");

    await page.reload();
    await expect(badges).toContainText("Moroso");
  });

  test("emails a debt notice to every debtor at once", async ({ page }) => {
    await login(page, "tesoreria");
    await page.goto("/sistema/cobranza");
    await page.getByRole("tab", { name: /Morosos/ }).click();
    const openNotice = page.getByRole("button", {
      name: "Avisar a todos por correo",
    });

    await openNotice.click();
    const dialog = page.getByRole("dialog", {
      name: "Avisar deuda por correo",
    });
    await expect(dialog.getByLabel("Vista previa del correo")).toContainText(
      "cuotas vencidas",
    );
    await dialog.getByRole("button", { name: /^Enviar \d+ avisos$/ }).click();
    await expect(page.locator(".sys-toast")).toContainText(
      "avisos de deuda por correo",
    );

    // Everyone was just warned, so nobody is picked again by default.
    await openNotice.click();
    await expect(
      dialog.getByRole("button", { name: "Enviar 0 avisos" }),
    ).toBeDisabled();
  });

  test("the gate allows and denies members", async ({ page }) => {
    await login(page, "porteria");
    await page.goto("/sistema/temporada");
    const input = page.getByLabel("DNI o número de socio");
    const verdict = page.locator(".sys-gate__verdict");

    await input.fill(ALLOWED.documentNumber);
    await input.press("Enter");
    await expect(verdict).toHaveText("Habilitado");

    await page.getByRole("button", { name: "Limpiar y buscar otro" }).click();
    await input.fill(DENIED.documentNumber);
    await input.press("Enter");
    await expect(verdict).toHaveText("No habilitado");
    const [reason] = checkPoolAccess(DENIED, SEED, DEMO_TODAY).reasons;
    await expect(page.getByText(reason).first()).toBeVisible();
  });

  test("an unknown member returns a 404", async ({ page }) => {
    await login(page);
    const response = await page.goto("/sistema/socios/no-existe");

    expect(response?.status()).toBe(404);
  });

  test("the system stays out of search engines", async ({ page, request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /sistema");

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).not.toContain("/sistema");

    await page.goto("/sistema/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});
