"""Simple rule-based + Markov chain chatbot in pure Python.

Usage:
  python ai_chat.py --train "Olá mundo" "Como vai?"
  python ai_chat.py --interactive
"""
from __future__ import annotations

import argparse
import random
import re
from collections import defaultdict
from dataclasses import dataclass
from typing import DefaultDict, Dict, Iterable, List, Tuple

TOKEN_RE = re.compile(r"\w+|[^\w\s]", re.UNICODE)


def tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text.lower())


def detokenize(tokens: Iterable[str]) -> str:
    text = " ".join(tokens)
    return re.sub(r"\s+([.,!?;:])", r"\1", text)


@dataclass
class MarkovChain:
    transitions: DefaultDict[Tuple[str, str], List[str]]

    @classmethod
    def from_corpus(cls, corpus: Iterable[str]) -> "MarkovChain":
        transitions: DefaultDict[Tuple[str, str], List[str]] = defaultdict(list)
        for line in corpus:
            tokens = ["<start>", "<start>"] + tokenize(line) + ["<end>"]
            for i in range(len(tokens) - 2):
                key = (tokens[i], tokens[i + 1])
                transitions[key].append(tokens[i + 2])
        return cls(transitions)

    def generate(self, seed: str, max_tokens: int = 30) -> str:
        seed_tokens = tokenize(seed)
        if len(seed_tokens) >= 2:
            key = (seed_tokens[-2], seed_tokens[-1])
        elif len(seed_tokens) == 1:
            key = ("<start>", seed_tokens[-1])
        else:
            key = ("<start>", "<start>")

        result: List[str] = []
        for _ in range(max_tokens):
            options = self.transitions.get(key)
            if not options:
                break
            next_token = random.choice(options)
            if next_token == "<end>":
                break
            result.append(next_token)
            key = (key[1], next_token)
        if not result:
            return "Ainda estou aprendendo. Pode reformular?"
        return detokenize(result)


RULES: Dict[str, str] = {
    "oi": "Olá, eu sou o JARViS. Em que posso ajudar?",
    "ola": "Olá, eu sou o JARViS. Em que posso ajudar?",
    "jarvis": "JARViS online. Aguardando comandos.",
    "ajuda": "Sou o JARViS. Posso conversar e gerar respostas com base no texto de treino.",
    "tchau": "Até logo. JARViS encerrando.",
}


def rule_response(text: str) -> str | None:
    tokens = tokenize(text)
    for token in tokens:
        if token in RULES:
            return RULES[token]
    return None


def build_corpus_from_args(samples: List[str]) -> List[str]:
    corpus = [sample.strip() for sample in samples if sample.strip()]
    if not corpus:
        corpus = [
            "Olá. Eu sou o JARViS, assistente virtual inspirado no filme Homem de Ferro.",
            "Posso gerar frases com base no que você me ensinar.",
            "Forneça exemplos ou faça perguntas, senhor.",
        ]
    return corpus


def interactive_loop(chain: MarkovChain) -> None:
    print("Digite algo (ou 'sair' para encerrar):")
    while True:
        user_input = input("> ").strip()
        if not user_input:
            continue
        if user_input.lower() in {"sair", "exit", "quit"}:
            print("Encerrando. Até logo!")
            break
        canned = rule_response(user_input)
        if canned:
            print(canned)
            continue
        print(chain.generate(user_input))


def main() -> None:
    parser = argparse.ArgumentParser(description="Chatbot simples com Markov chain.")
    parser.add_argument(
        "--train",
        nargs="*",
        default=[],
        help="Frases para treinar o modelo.",
    )
    parser.add_argument(
        "--interactive",
        action="store_true",
        help="Inicia o modo interativo.",
    )
    parser.add_argument(
        "--prompt",
        help="Gera uma resposta única para o prompt fornecido.",
    )
    args = parser.parse_args()

    corpus = build_corpus_from_args(args.train)
    chain = MarkovChain.from_corpus(corpus)

    if args.prompt:
        canned = rule_response(args.prompt)
        print(canned if canned else chain.generate(args.prompt))
        return

    if args.interactive:
        interactive_loop(chain)
        return

    print("Nada a fazer. Use --interactive ou --prompt.")


if __name__ == "__main__":
    main()
