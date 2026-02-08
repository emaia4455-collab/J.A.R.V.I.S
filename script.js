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

let transitions = buildTransitions(defaultCorpus);

function appendMessage(text, type) {
  const message = document.createElement("div");
  message.className = `chat__message ${type === "user" ? "chat__message--user" : ""}`;
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

function handleTrain() {
  const lines = trainingField.value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  transitions = buildTransitions(lines.length ? lines : defaultCorpus);
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

trainButton.addEventListener("click", handleTrain);
sendButton.addEventListener("click", handleSend);

promptField.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSend();
  }
});
