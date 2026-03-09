import os
from pathlib import Path

import google.generativeai as genai
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.environ.get("OPEN_ROUTER_API_KEY", "")

genai.configure(api_key=GEMINI_API_KEY)

_GEMINI_MODEL = "gemini-2.0-flash"
_OPENROUTER_MODEL = "meta-llama/llama-3.3-70b-instruct"

_openai_client = OpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
)

_ARIA_SYSTEM = (
    "You are Aria, an expert AI assistant for Skew — a NIFTY options analytics platform. "
    "You help traders interpret options data, PCR signals, open interest patterns, "
    "volatility surfaces, and volume anomalies. Be concise, accurate, and actionable."
)


def ask_gemini(prompt: str, system: str = "") -> str:
    system_instruction = system if system else (
        "You are Skew, an expert NIFTY options market analyst. "
        "Provide clear, data-driven insights for traders."
    )
    model = genai.GenerativeModel(
        model_name=_GEMINI_MODEL,
        system_instruction=system_instruction,
    )
    response = model.generate_content(prompt)
    return response.text


def ask_groq(message: str, history: list[dict] | None = None) -> str:
    messages: list[dict] = [{"role": "system", "content": _ARIA_SYSTEM}]
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": message})

    response = _openai_client.chat.completions.create(
        model=_OPENROUTER_MODEL,
        messages=messages,
    )
    return response.choices[0].message.content
