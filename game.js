/* Le moteur garde la partie. Il est partagé par la page et les tests. */
(function (root) {
  "use strict";
  const COLORS = ["rouge", "bleu", "vert", "jaune", "orange", "violet"];
  const CONFIG = {
    apiVersion: "0.2", rulesVersion: "code-couleurs-1.0",
    secretLength: 4, maxAttempts: 10, allowDuplicates: true, colors: COLORS
  };
  const MESSAGES = {
    "game-not-started": "Commencez une nouvelle partie pour jouer.",
    "game-finished": "Cette partie est terminée. Lancez une nouvelle partie.",
    "invalid-type": "La proposition doit être un tableau de noms de couleurs, sans case vide.",
    "invalid-length": "Choisissez exactement quatre couleurs avant de valider.",
    "invalid-color": "Une couleur proposée n’est pas autorisée.",
    "invalid-options": "Les options doivent être un objet contenant uniquement un éventuel secret."
  };
  const copy = value => JSON.parse(JSON.stringify(value));

  // Le type de chaque élément est vérifié avant la longueur et les couleurs.
  function validateCode(code) {
    if (!Array.isArray(code)) return "invalid-type";
    for (let i = 0; i < code.length; i++) {
      if (!Object.hasOwn(code, i) || typeof code[i] !== "string") return "invalid-type";
    }
    if (code.length !== 4) return "invalid-length";
    if (code.some(color => !COLORS.includes(color))) return "invalid-color";
    return null;
  }

  function score(secret, guess) {
    let wellPlaced = 0;
    const remainingSecret = [];
    const remainingGuess = [];
    for (let i = 0; i < 4; i++) {
      if (secret[i] === guess[i]) wellPlaced++;
      else {
        remainingSecret.push(secret[i]);
        remainingGuess.push(guess[i]);
      }
    }
    let misplaced = 0;
    for (const color of remainingGuess) {
      const index = remainingSecret.indexOf(color);
      if (index !== -1) {
        misplaced++;
        remainingSecret.splice(index, 1); // Cette occurrence est désormais utilisée.
      }
    }
    return { wellPlaced, misplaced };
  }

  function createGame(onChange = () => {}) {
    let secret = null;
    let state = {
      status: "not-started", attempts: 0, history: [],
      lastGuess: null, lastResult: null, lastError: null
    };
    const getState = () => copy(state);
    function publish() {
      onChange(getState());
      return getState();
    }
    async function startGame(options = {}) {
      let error = null;
      if (options === null || typeof options !== "object" || Array.isArray(options)
          || ![Object.prototype, null].includes(Object.getPrototypeOf(options))
          || Reflect.ownKeys(options).some(key => key !== "secret")) {
        error = "invalid-options";
      } else if (Object.hasOwn(options, "secret")) {
        error = validateCode(options.secret);
      }
      if (error) throw Object.assign(new Error(MESSAGES[error]), { code: error });
      secret = Object.hasOwn(options, "secret")
        ? [...options.secret]
        : Array.from({ length: 4 }, () => COLORS[Math.floor(Math.random() * COLORS.length)]);
      state = {
        status: "playing", attempts: 0, history: [],
        lastGuess: null, lastResult: null, lastError: null
      };
      return publish();
    }
    async function submitGuess(guess) {
      const error = state.status === "not-started" ? "game-not-started"
        : state.status !== "playing" ? "game-finished" : validateCode(guess);
      if (error) {
        state.lastError = { code: error, message: MESSAGES[error] };
        return publish();
      }
      const result = score(secret, guess);
      state.attempts++;
      state.history.push({ guess: [...guess], result: { ...result } });
      state.lastGuess = [...guess];
      state.lastResult = { ...result };
      state.lastError = null;
      if (result.wellPlaced === 4) state.status = "won";
      else if (state.attempts === 10) state.status = "lost";
      return publish();
    }
    return { version: "0.2", getConfig: () => copy(CONFIG), startGame, submitGuess, getState };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { createGame };
  else root.createCodeSecretGame = createGame;
})(globalThis);
