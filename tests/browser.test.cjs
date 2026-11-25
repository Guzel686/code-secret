const { test } = require("node:test");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
const { chromium } = require("playwright");

test("Pastilles, clavier, règles, API et historique compact sur mobile", async () => {
  const browser = await chromium.launch({headless:true,
    ...(process.env.CODE_SECRET_BROWSER ? {executablePath:process.env.CODE_SECRET_BROWSER} : {})});
  try {
    const page = await browser.newPage({viewport:{width:375,height:667}});
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    const url = process.env.CODE_SECRET_URL || pathToFileURL(path.resolve(__dirname,"../index.html")).href;
    await page.goto(url);
    assert.equal(await page.evaluate(() => typeof window.codeSecretTest), "undefined");
    const choose = color => page.locator(`[data-choice="${color}"]`).click();
    const validate = page.getByRole("button",{name:"Valider la proposition"});
    for(let i=0;i<3;i++) await choose("rouge");
    await validate.click();
    assert.match(await page.locator("#error").innerText(), /quatre couleurs/);
    assert.equal(await page.locator("#attempts").innerText(), "Essais : 0 / 10");
    assert.equal(await page.locator("#history > li").count(),0);
    assert.match(await page.locator(".slot:focus").getAttribute("aria-label"), /Position 4/);
    await choose("rouge");
    // La modification d’une position existante ne valide aucun essai.
    await page.locator(".slot").nth(1).click();
    await choose("bleu");
    assert.equal(await page.locator(".slot").nth(1).getAttribute("data-color"),"bleu");
    await validate.click();
    assert.equal(await page.locator("#history > li").count(),1);
    assert.equal(await page.locator("#error").innerText(),"");
    await page.getByRole("button",{name:"Règles",exact:true}).click();
    assert.equal(await page.locator("#rules").evaluate(el => el.open),true);
    assert.match(await page.locator("#rules").innerText(), /Chaque occurrence compte une seule fois/);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#rules").evaluate(el => el.open),false);
    assert.equal(await page.locator("#show-rules").evaluate(el=>el===document.activeElement),true);

    await page.goto(url+"?test=1");
    assert.equal(await page.evaluate(()=>window.codeSecretTest.getState().status),"not-started");
    await page.evaluate(()=>window.codeSecretTest.startGame({secret:["rouge","rouge","bleu","vert"]}));
    // Choix d’une couleur au clavier, sans souris pour l’activer.
    await page.locator('[data-choice="rouge"]').focus();
    await page.keyboard.press("Enter");
    for(let i=0;i<3;i++) await choose("rouge");
    await validate.click();
    assert.deepEqual(await page.evaluate(()=>window.codeSecretTest.getState().lastResult),{wellPlaced:2,misplaced:0});
    assert.equal(await page.locator(".result").innerText(),"Bien placées : 2\nMal placées : 0");
    assert.deepEqual(await page.locator("#history .disc").allTextContents(),["R","R","R","R"]);
    for(const [width,height] of [[375,667],[360,640],[320,568],[1280,800]]) {
      await page.setViewportSize({width,height});
      await page.evaluate(async()=>{
        const api=window.codeSecretTest;
        await api.startGame({secret:Array(4).fill("rouge")});
        for(let i=0;i<9;i++) await api.submitGuess(Array(4).fill("bleu"));
        await api.submitGuess(Array(4).fill("rouge"));
      });
      assert.match(await page.locator("#status").innerText(),/🏆 Bravo.*10 essais/);
      assert.equal(await page.locator("#history > li").count(),10);
      assert.equal(await validate.isDisabled(),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`largeur ${width}`);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight),true,`hauteur ${width}x${height}`);
      // Les dix entrées restent accessibles dans une région défilante au clavier.
      assert.equal(await page.locator("#history-scroll").getAttribute("tabindex"),"0");
      await page.locator("#history-scroll").evaluate(el=>{el.scrollTop=0});
      assert.equal(await page.locator("#history > li").first().isVisible(),true);
      await page.getByRole("button",{name:"Nouvelle partie"}).click();
      assert.equal(await page.locator("#history > li").count(),0);
      assert.deepEqual(await page.locator(".slot").allTextContents(),["1","2","3","4"]);
      assert.equal(await page.locator(".slot").first().evaluate(el=>el===document.activeElement),true);
      assert.deepEqual(await page.evaluate(()=>window.codeSecretTest.getState().attempts),0);
    }
    await page.setViewportSize({width:375,height:667});
    await page.evaluate(()=>window.codeSecretTest.startGame({secret:["rouge","rouge","bleu","vert"]}));
    await page.evaluate(()=>window.codeSecretTest.submitGuess(["rouge","rouge","rouge","rouge"]));
    await choose("rouge");
    await choose("bleu");
    if(process.env.CODE_SECRET_SCREENSHOT) await page.screenshot({path:process.env.CODE_SECRET_SCREENSHOT,fullPage:true});
    assert.deepEqual(errors,[]);
  } finally {await browser.close();}
});
