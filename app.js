"use strict";

const form = document.querySelector("#guess-form");
const fields = document.querySelector("#guess-fields");
const newGameButton = document.querySelector("#new-game");
const historyList = document.querySelector("#history");
const abbreviations = { rouge:"R", bleu:"B", vert:"V", jaune:"J", orange:"O", violet:"Vi" };
let choices = [null, null, null, null];
let activePosition = 0;
const slots = [];

function disc(color) {
  const span = document.createElement("span");
  span.className = "disc";
  span.dataset.color = color;
  span.textContent = abbreviations[color];
  span.setAttribute("aria-label", color);
  return span;
}
function showChoices() {
  slots.forEach((button, i) => {
    button.textContent = choices[i] ? abbreviations[choices[i]] : String(i + 1);
    button.dataset.color = choices[i] || "";
    button.setAttribute("aria-label", `Position ${i + 1} : ${choices[i] || "vide"}`);
    button.setAttribute("aria-pressed", String(activePosition === i));
  });
  document.querySelector("#selection-help").textContent = `Couleur suivante : position ${activePosition + 1}. Touchez une position pour la modifier.`;
}
function render(state) {
  document.querySelector("#attempts").textContent = `Essais : ${state.attempts} / 10`;
  const messages = {
    "not-started":"Cliquez sur Nouvelle partie pour commencer.",
    playing:"À vous de trouver le code !",
    won:`Bravo ! Code trouvé en ${state.attempts} essai${state.attempts > 1 ? "s" : ""}.`,
    lost:"10 essais écoulés. Partie perdue. Recommencez !"
  };
  document.querySelector("#status").textContent = messages[state.status];
  document.querySelector("#error").textContent = state.lastError?.message ?? "";
  fields.disabled = state.status !== "playing";
  document.querySelector("#empty-history").hidden = state.history.length > 0;
  historyList.replaceChildren();
  state.history.forEach((entry, i) => {
    const item = document.createElement("li");
    const number = document.createElement("span");
    number.className = "attempt-number";
    number.textContent = String(i + 1);
    const colors = document.createElement("div");
    colors.className = "guess-colors";
    entry.guess.forEach(color => colors.append(disc(color)));
    const result = document.createElement("p");
    result.className = "result";
    result.textContent = `${entry.result.wellPlaced} / ${entry.result.misplaced}`;
    result.setAttribute("aria-label", `${entry.result.wellPlaced} bien placées, ${entry.result.misplaced} mal placées`);
    item.append(number, colors, result);
    historyList.append(item);
  });
  const scroll = document.querySelector("#history-scroll");
  scroll.scrollTop = scroll.scrollHeight;
  if (state.status === "playing" && state.attempts === 0 && !state.lastError) {
    choices = [null, null, null, null];
    activePosition = 0;
    showChoices();
  }
}
const game = createCodeSecretGame(render);
for (let i = 0; i < 4; i++) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "slot";
  button.addEventListener("click", () => { activePosition = i; showChoices(); });
  slots.push(button);
  document.querySelector("#slots").append(button);
}
for (const color of game.getConfig().colors) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "palette-button";
  button.dataset.choice = color;
  button.setAttribute("aria-label", color);
  const name = document.createElement("span");
  name.className = "name";
  name.textContent = color;
  button.append(disc(color), name);
  button.addEventListener("click", () => {
    choices[activePosition] = color;
    activePosition = Math.min(activePosition + 1, 3);
    showChoices();
  });
  document.querySelector("#palette").append(button);
}
showChoices();
form.addEventListener("submit", async event => {
  event.preventDefault();
  const state = await game.submitGuess(choices.filter(Boolean));
  if (state.lastError) {
    const empty = choices.indexOf(null);
    if (empty !== -1) { activePosition = empty; showChoices(); slots[empty].focus(); }
  }
});
newGameButton.addEventListener("click", async () => {
  await game.startGame();
  slots[0].focus();
});
const rules = document.querySelector("#rules");
document.querySelector("#show-rules").addEventListener("click", () => rules.showModal());
document.querySelector("#close-rules").addEventListener("click", () => rules.close());
render(game.getState());
if (new URLSearchParams(location.search).get("test") === "1") window.codeSecretTest = game;
else game.startGame();
