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

Para usar a versão web, basta abrir o arquivo `index.html` no navegador. A interface permite treinar o JARViS, conversar e salvar a memória do treino localmente no navegador.

## Evitar erro 404 no GitHub Pages

Ao publicar no GitHub Pages, use sempre o link com o nome do repositório:

```
https://SEU_USUARIO.github.io/SEU_REPOSITORIO/
```

Este repositório também inclui um `404.html` que redireciona automaticamente para a página inicial, reduzindo erros caso o endereço esteja incompleto.

Se o site não abrir, confira se o workflow de GitHub Pages rodou na branch onde você fez o push (main, master ou work) e se o deploy foi concluído sem erros.

Modo interativo:

```bash
python ai_chat.py --train "Eu gosto de música." "Vamos conversar." --interactive
```

Se não houver treino fornecido, o script usa um pequeno corpus padrão.
