const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createGame } = require("../game.js");
const secret = ["rouge", "rouge", "bleu", "vert"];
const reds = Array(4).fill("rouge");
const blues = Array(4).fill("bleu");

test("Trois couleurs : refus sans essai ni historique ; un essai valide reste possible", async () => {
  const game = createGame();
  await game.startGame({ secret });
  const state = await game.submitGuess(["rouge", "bleu", "vert"]);
  assert.equal(state.lastError.code, "invalid-length");
  assert.equal(state.attempts, 0);
  assert.deepEqual(state.history, []);
  assert.equal(state.lastGuess, null);
  assert.equal((await game.submitGuess(reds)).lastError, null);
});

test("Quatre rouges face à rouge–rouge–bleu–vert : 2 bien, 0 mal et un essai", async () => {
  const game = createGame();
  await game.startGame({ secret });
  const state = await game.submitGuess(reds);
  assert.deepEqual(state.lastResult, { wellPlaced: 2, misplaced: 0 });
  assert.equal(state.attempts, 1);
  assert.equal(state.history.length, 1);
});

test("Les neuf exemples T01 à T09 du contrat", async () => {
  const unique = ["rouge", "bleu", "vert", "jaune"];
  const cases = [
    [unique, ["rouge", "vert", "bleu", "orange"], 1, 2],
    [unique, ["orange", "violet", "rouge", "bleu"], 0, 2],
    [unique, ["bleu", "rouge", "jaune", "vert"], 0, 4],
    [unique, ["rouge", "bleu", "jaune", "vert"], 2, 2],
    [unique, unique, 4, 0],
    [secret, reds, 2, 0],
    [secret, ["rouge", "bleu", "rouge", "vert"], 2, 2],
    [secret, secret, 4, 0],
    [secret, ["rouge", "bleu", "rouge", "rouge"], 1, 2]
  ];
  for (const [code, guess, wellPlaced, misplaced] of cases) {
    const game = createGame();
    await game.startGame({ secret: code });
    const state = await game.submitGuess(guess);
    assert.deepEqual(state.lastResult, { wellPlaced, misplaced });
    assert.equal(state.status, wellPlaced === 4 ? "won" : "playing");
    assert.equal(state.attempts, 1);
    assert.equal(state.history.length, 1);
  }
});

test("Victoire au dixième ; une saisie invalide à neuf ne consomme pas d’essai", async () => {
  const game = createGame();
  await game.startGame({ secret: reds });
  for (let i = 0; i < 9; i++) await game.submitGuess(blues);
  assert.equal((await game.submitGuess(["rouge"])).attempts, 9);
  const state = await game.submitGuess(reds);
  assert.equal(state.status, "won");
  assert.equal(state.attempts, 10);
  assert.equal(state.history.length, 10);
});

test("Défaite, refus après la fin, puis redémarrage à zéro", async () => {
  const game = createGame();
  await game.startGame({ secret: reds });
  for (let i = 0; i < 10; i++) await game.submitGuess(blues);
  const before = game.getState();
  assert.equal(before.status, "lost");
  const after = await game.submitGuess(null);
  assert.deepEqual(after, { ...before, lastError: { code: "game-finished", message: after.lastError.message } });
  const restart = await game.startGame();
  assert.deepEqual(restart, { status: "playing", attempts: 0, history: [], lastGuess: null, lastResult: null, lastError: null });
});

test("Erreurs : priorité état, type, longueur, couleur ; démarrage invalide sans mutation", async () => {
  const game = createGame();
  assert.equal(game.getState().status, "not-started");
  assert.equal((await game.submitGuess(null)).lastError.code, "game-not-started");
  await game.startGame({ secret });
  const invalid = [
    [null, "invalid-type"], [["rouge", null], "invalid-type"],
    [Array(4), "invalid-type"], [["rouge"], "invalid-length"],
    [["Violet", "rouge", "bleu", "vert"], "invalid-color"]
  ];
  for (const [guess, code] of invalid) assert.equal((await game.submitGuess(guess)).lastError.code, code);
  const before = game.getState();
  for (const [options, code] of [
    [null, "invalid-options"], [[], "invalid-options"], [{ extra: 1 }, "invalid-options"],
    [{ secret: undefined }, "invalid-type"], [{ secret: ["rouge"] }, "invalid-length"],
    [{ secret: ["rouge", "bleu", "vert", "purple"] }, "invalid-color"]
  ]) {
    await assert.rejects(game.startGame(options), error => error.code === code);
    assert.deepEqual(game.getState(), before);
  }
});

test("Entrées et résultats indépendants de la partie ; configuration et état sans secret", async () => {
  const game = createGame();
  const code = [...secret];
  await game.startGame({ secret: code });
  code.fill("violet");
  const guess = [...secret];
  const result = await game.submitGuess(guess);
  guess.fill("orange");
  result.history[0].guess.fill("jaune");
  result.lastResult.wellPlaced = 0;
  assert.equal(game.getState().status, "won");
  assert.deepEqual(game.getState().lastGuess, secret);
  assert.equal(game.getState().lastResult.wellPlaced, 4);
  const config = game.getConfig();
  config.colors.pop();
  assert.equal(game.getConfig().colors.length, 6);
  assert.equal(game.version, "0.2");
  assert.equal(Object.hasOwn(game.getState(), "secret"), false);
  assert.equal(Object.hasOwn(game.getState(), "solution"), false);
});
