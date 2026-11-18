"use strict";

const form = document.querySelector("#guess-form");
const selects = [...form.querySelectorAll("select")];
const fields = document.querySelector("#guess-fields");
const newGameButton = document.querySelector("#new-game");
const historyList = document.querySelector("#history");

function colorSwatch(color) {
  const swatch = document.createElement("span");
  swatch.className = "swatch";
  swatch.setAttribute("aria-hidden", "true");
  swatch.style.backgroundColor = color ? `var(--${color})` : "white";
  return swatch;
}

function resetSelection() {
  form.reset();
  for (const select of selects) select.previousElementSibling.replaceWith(colorSwatch(""));
}

function render(state) {
  document.querySelector("#attempts").textContent = `Essais : ${state.attempts} / 10`;
  const messages = {
    "not-started": "Cliquez sur Nouvelle partie pour commencer.",
    playing: "À vous de trouver le code secret !",
    won: `Bravo ! Code trouvé en ${state.attempts} essai${state.attempts > 1 ? "s" : ""}.`,
    lost: "Les dix essais sont écoulés. Partie perdue. Vous pouvez recommencer."
  };
  document.querySelector("#status").textContent = messages[state.status];
  document.querySelector("#error").textContent = state.lastError?.message ?? "";
  fields.disabled = state.status !== "playing";
  document.querySelector("#empty-history").hidden = state.history.length > 0;
  historyList.replaceChildren();
  for (const entry of state.history) {
    const item = document.createElement("li");
    const colors = document.createElement("div");
    colors.className = "guess-colors";
    for (const color of entry.guess) {
      const label = document.createElement("span");
      label.className = "color-label";
      label.append(colorSwatch(color), document.createTextNode(color));
      colors.append(label);
    }
    const result = document.createElement("p");
    result.className = "result";
    result.textContent = `${entry.result.wellPlaced} bien placée(s) · ${entry.result.misplaced} mal placée(s)`;
    item.append(colors, result);
    historyList.append(item);
  }
  // Un redémarrage par l’API remet aussi les choix visibles à zéro.
  if (state.status === "playing" && state.attempts === 0 && !state.lastError) resetSelection();
}

const game = createCodeSecretGame(render);
for (const select of selects) {
  for (const color of game.getConfig().colors) {
    const option = document.createElement("option");
    option.value = color;
    option.textContent = color;
    select.append(option);
  }
  select.addEventListener("change", () => {
    select.previousElementSibling.replaceWith(colorSwatch(select.value));
  });
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  // Les emplacements non choisis ne forment pas une couleur : une saisie
  // incomplète arrive au moteur comme une proposition de moins de quatre couleurs.
  const guess = selects.map(select => select.value).filter(Boolean);
  const state = await game.submitGuess(guess);
  if (state.lastError) selects.find(select => !select.value)?.focus();
});

newGameButton.addEventListener("click", async () => {
  await game.startGame();
  selects[0].focus();
});

render(game.getState());
if (new URLSearchParams(location.search).get("test") === "1") {
  window.codeSecretTest = game;
} else {
  game.startGame();
}
