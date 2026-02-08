const rules = {
  oi: "Olá, eu sou o JARViS. Em que posso ajudar?",
  ola: "Olá, eu sou o JARViS. Em que posso ajudar?",
  jarvis: "JARViS online. Aguardando comandos.",
  ajuda: "Sou o JARViS. Posso conversar e gerar respostas com base no texto de treino.",
  tchau: "Até logo. JARViS encerrando.",
};

const defaultCorpus = [
  "Olá. Eu sou o JARViS, assistente virtual inspirado no filme Homem de Ferro.",
  "Posso gerar frases com base no que você me ensinar.",
  "Forneça exemplos ou faça perguntas, senhor.",
];

const tokenizer = /\w+|[^\w\s]/gu;

function tokenize(text) {
  return text.toLowerCase().match(tokenizer) ?? [];
}

function detokenize(tokens) {
  return tokens.join(" ").replace(/\s+([.,!?;:])/g, "$1");
}

function buildTransitions(corpus) {
  const transitions = new Map();

  corpus.forEach((line) => {
    const tokens = ["<start>", "<start>", ...tokenize(line), "<end>"];
    for (let i = 0; i < tokens.length - 2; i += 1) {
      const key = `${tokens[i]}|${tokens[i + 1]}`;
      const values = transitions.get(key) ?? [];
      values.push(tokens[i + 2]);
      transitions.set(key, values);
    }
  });

  return transitions;
}

function generateResponse(transitions, seed, maxTokens = 30) {
  const seedTokens = tokenize(seed);
  let key;

  if (seedTokens.length >= 2) {
    key = `${seedTokens[seedTokens.length - 2]}|${seedTokens[seedTokens.length - 1]}`;
  } else if (seedTokens.length === 1) {
    key = `<start>|${seedTokens[0]}`;
  } else {
    key = "<start>|<start>";
  }

  const result = [];

  for (let i = 0; i < maxTokens; i += 1) {
    const options = transitions.get(key);
    if (!options) {
      break;
    }
    const nextToken = options[Math.floor(Math.random() * options.length)];
    if (nextToken === "<end>") {
      break;
    }
    result.push(nextToken);
    const [previous, current] = key.split("|");
    key = `${current}|${nextToken}`;
    if (!previous) {
      break;
    }
  }

  if (!result.length) {
    return "Ainda estou aprendendo. Pode reformular?";
  }
  return detokenize(result);
}

function findRuleResponse(text) {
  const tokens = tokenize(text);
  for (const token of tokens) {
    if (rules[token]) {
      return rules[token];
    }
  }
  return null;
}

const chat = document.getElementById("chat");
const trainingField = document.getElementById("training");
const promptField = document.getElementById("prompt");
const trainButton = document.getElementById("train");
const sendButton = document.getElementById("send");
const saveTrainingButton = document.getElementById("save-training");
const clearTrainingButton = document.getElementById("clear-training");
const clearChatButton = document.getElementById("clear-chat");
const trainingStatus = document.getElementById("training-status");

let transitions = buildTransitions(defaultCorpus);
let currentTraining = [...defaultCorpus];

const storageKey = "jarvis-training";

function appendMessage(text, type) {
  const message = document.createElement("div");
  message.className = `chat__message ${type === "user" ? "chat__message--user" : ""}`;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function updateTrainingStatus(message) {
  trainingStatus.textContent = message;
}

function setTraining(lines, { persist = false } = {}) {
  currentTraining = lines.length ? lines : [...defaultCorpus];
  transitions = buildTransitions(currentTraining);
  trainingField.value = currentTraining.join("\n");
  if (persist) {
    localStorage.setItem(storageKey, JSON.stringify(currentTraining));
    updateTrainingStatus("Memória salva localmente no navegador.");
  } else {
    updateTrainingStatus("Treino atualizado (ainda não salvo).");
  }
}

function handleTrain() {
  const lines = trainingField.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  setTraining(lines, { persist: false });
  appendMessage("Treino atualizado. JARViS pronto.", "bot");
}

function handleSend() {
  const prompt = promptField.value.trim();
  if (!prompt) {
    return;
  }

  appendMessage(prompt, "user");
  promptField.value = "";

  const rule = findRuleResponse(prompt);
  const response = rule ?? generateResponse(transitions, prompt);
  appendMessage(response, "bot");
}

function handleSaveTraining() {
  const lines = trainingField.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  setTraining(lines, { persist: true });
}

function handleClearTraining() {
  localStorage.removeItem(storageKey);
  setTraining(defaultCorpus, { persist: false });
  updateTrainingStatus("Memória limpa. Usando o corpus padrão.");
  appendMessage("Memória limpa. Vamos recomeçar.", "bot");
}

function handleClearChat() {
  chat.innerHTML = "";
  appendMessage("Chat limpo. Em que posso ajudar agora?", "bot");
}

trainButton.addEventListener("click", handleTrain);
sendButton.addEventListener("click", handleSend);
saveTrainingButton.addEventListener("click", handleSaveTraining);
clearTrainingButton.addEventListener("click", handleClearTraining);
clearChatButton.addEventListener("click", handleClearChat);

promptField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});

const storedTraining = localStorage.getItem(storageKey);
if (storedTraining) {
  try {
    const parsed = JSON.parse(storedTraining);
    if (Array.isArray(parsed) && parsed.length) {
      setTraining(parsed, { persist: false });
      updateTrainingStatus("Memória carregada do navegador.");
    }
  } catch (error) {
    updateTrainingStatus("Não foi possível ler a memória salva.");
  }
} else {
  trainingField.value = defaultCorpus.join("\n");
  updateTrainingStatus("Usando corpus padrão. Salve se quiser guardar.");
}
