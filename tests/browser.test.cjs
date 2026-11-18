// Vérification de la page réelle. Nécessite Playwright et son navigateur Chromium.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { chromium } = require("playwright");

test("Interface, mode API et affichage à largeur mobile", async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CODE_SECRET_BROWSER ? { executablePath: process.env.CODE_SECRET_BROWSER } : {})
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, "../index.html")).href;
    await page.goto(url);
    assert.equal(await page.evaluate(() => typeof window.codeSecretTest), "undefined");

    // Le cas prévu dans le README est essayé avec les vraies commandes.
    for (let i = 1; i <= 3; i++) await page.selectOption(`[name=color${i}]`, "rouge");
    await page.getByRole("button", { name: "Valider la proposition" }).click();
    assert.match(await page.locator("#error").innerText(), /quatre couleurs/);
    assert.equal(await page.locator("#attempts").innerText(), "Essais : 0 / 10");
    assert.equal(await page.locator("#history > li").count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement.name), "color4");
    await page.selectOption("[name=color4]", "rouge");
    await page.getByRole("button", { name: "Valider la proposition" }).click();
    assert.equal(await page.locator("#history > li").count(), 1);
    assert.equal(await page.locator("#error").innerText(), "");

    await page.goto(url + "?test=1");
    assert.equal(await page.evaluate(() => window.codeSecretTest.getState().status), "not-started");
    await page.evaluate(() => window.codeSecretTest.startGame({ secret: ["rouge", "rouge", "bleu", "vert"] }));
    for (let i = 1; i <= 4; i++) await page.selectOption(`[name=color${i}]`, "rouge");
    await page.getByRole("button", { name: "Valider la proposition" }).click();
    assert.match(await page.locator(".result").innerText(), /2 bien placée\(s\) · 0 mal placée\(s\)/);
    assert.equal(await page.evaluate(() => window.codeSecretTest.getState().attempts), 1);
    assert.equal(await page.locator("#history > li").count(), 1);

    // Les commandes API mettent réellement à jour le compteur et la fin de partie.
    await page.evaluate(async () => {
      const api = window.codeSecretTest;
      await api.startGame({ secret: Array(4).fill("rouge") });
      for (let i = 0; i < 9; i++) await api.submitGuess(Array(4).fill("bleu"));
      await api.submitGuess(Array(4).fill("rouge"));
    });
    assert.match(await page.locator("#status").innerText(), /Bravo.*10 essais/);
    assert.equal(await page.locator("#history > li").count(), 10);
    assert.equal(await page.getByRole("button", { name: "Valider la proposition" }).isDisabled(), true);
    await page.getByRole("button", { name: "Nouvelle partie" }).click();
    assert.equal(await page.locator("#history > li").count(), 0);
    assert.equal(await page.locator("[name=color1]").inputValue(), "");

    // Navigation clavier réelle : choisir une couleur après le focus du redémarrage.
    assert.equal(await page.evaluate(() => document.activeElement.name), "color1");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Tab");
    assert.equal(await page.locator("[name=color1]").inputValue(), "rouge");
    assert.equal(await page.evaluate(() => document.activeElement.name), "color2");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.codeSecretTest.submitGuess(["rouge", "bleu", "vert", "jaune"]));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    if (process.env.CODE_SECRET_SCREENSHOT) {
      await page.screenshot({ path: process.env.CODE_SECRET_SCREENSHOT, fullPage: true });
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
