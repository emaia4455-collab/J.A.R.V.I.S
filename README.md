# Chatbot simples JARViS (I.A.)

Este repositório contém um exemplo de código de "I.A" simples em Python, com o nome JARViS inspirado no filme Homem de Ferro. Ele combina:

- Respostas baseadas em regras para comandos comuns.
- Um gerador de frases por Markov chain treinado com exemplos fornecidos.

## Requisitos

- Python 3.10+

## Como usar

Treinar com frases e responder a um prompt:

```bash
python ai_chat.py --train "Olá, tudo bem?" "Eu gosto de aprender." --prompt "Olá"
```

Para usar a versão web, basta abrir o arquivo `index.html` no navegador.

Modo interativo:

```bash
python ai_chat.py --train "Eu gosto de música." "Vamos conversar." --interactive
```

Se não houver treino fornecido, o script usa um pequeno corpus padrão.
