import os, json, requests

OLLAMA_BASE = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

CRITIC_PROMPT = """You are a strict capability critic for an MCP agent.
The agent ONLY has these tools: scrape_city, compare_cities, forecast_city, forecast_multi.
They work ONLY on air-quality data (PM2.5/PM10) over cities and time ranges.

Your job:
1) Decide if the user's request is fully supported by these tools.
2) If the request is MIXED (supported + unsupported actions like writing blogs, emailing, designing, exporting docs), split it:
   - Extract the supported subtask (rewrite it cleanly).
   - List the unsupported parts with reasons.
3) If the request is gibberish or entirely unrelated (e.g., cooking, poems, finance), mark as IRRELEVANT.

Return STRICT JSON:
{
  "category": "supported" | "mixed" | "irrelevant",
  "unsupported_reasons": [ "<why each part is not possible with the tools>" ],
  "supported_rewrite": "if category is mixed, rewrite only the supported part; else empty string",
  "examples": [
    "Compare Colombo and Kandy last 7 days",
    "Forecast Panadura next 3 days (train 7 days)"
  ]
}
Only JSON. No extra text.
"""

SYSTEM_PROMPT = """You are a planning agent. Turn the user's request into a JSON plan of tool calls.
Only use these tools and their JSON schemas. Return STRICT JSON with this shape:

{
  "plan": [
    {"name": "<tool_name>", "arguments": { ... }},
    ...
  ],
  "notes": "very brief explanation",
  "irrelevant": false
}

Strictly follow these Rules:
- Use only the listed tools; arguments must match the schemas.
- If the user asks to compare, use compare_cities with at least 2 cities.
- If forecasting multiple cities, use forecast_multi.
- If data may be stale, insert a scrape_city step BEFORE compare/forecast.
- REJECT requests like "Generate me an image comparing Colombo and Kandy for past 7 days", "Generate me an blogpost article comparing Colombo and Kandy for past 7 days", "Generate me an newspaper article forcasting Colombo and Kandy 7 days ahead"
- REJECT asks requiring non-available abilities (blog writing, emails, PDFs, images, SQL DDL, etc.).
- If the user's request is completely unrelated to air quality analysis (e.g., asking about weather, cooking, random topics), set "irrelevant": true and "plan": [].
- For mixed requests: plan only the tool-capable part, set irrelevant=false, and include notes with unsupported_reasons.
- Keep notes short. Do not include any text outside of the JSON object.
"""

def build_tool_catalog(tools: list[dict]) -> str:
    return json.dumps(tools, indent=2, ensure_ascii=False)

def critique_prompt(prompt: str, tools: list[dict], temperature: float = 0.0, timeout: int = 45) -> dict:
    """Critique a prompt to determine if it's supported, mixed, or irrelevant."""
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": CRITIC_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "format": "json",
        "options": {"temperature": temperature}
    }
    r = requests.post(f"{OLLAMA_BASE}/api/chat", json=payload, timeout=timeout)
    r.raise_for_status()
    raw = r.json()["message"]["content"]
    try:
        return json.loads(raw)
    except Exception:
        import re
        m = re.search(r"\{.*\}", raw, re.S)
        return json.loads(m.group(0)) if m else {"category":"irrelevant","unsupported_reasons":["Non-JSON critic output"],"supported_rewrite":""}

def plan_with_llama(prompt: str, tools: list[dict], temperature: float = 0.2, timeout: int = 60) -> dict:
    """Ask Ollama (local) to produce a JSON plan."""
    sys = SYSTEM_PROMPT + "\n\nTOOLS (JSON Schemas):\n" + build_tool_catalog(tools)
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": sys},
            {"role": "user", "content": prompt}
        ],
        "stream": False,
        "format": "json",
        "options": {"temperature": temperature}
    }
    r = requests.post(f"{OLLAMA_BASE}/api/chat", json=payload, timeout=timeout)
    r.raise_for_status()
    data = r.json()
    content = data["message"]["content"]

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        import re
        m = re.search(r"\{.*\}", content, re.S)
        if not m:
            raise RuntimeError("LLM did not return JSON plan")
        return json.loads(m.group(0))

def plan_with_critic(prompt: str, tools: list[dict], temperature: float = 0.2, timeout: int = 60) -> dict:
    """Two-stage planner: critique first, then plan if supported."""
    critic = critique_prompt(prompt, tools)
    cat = critic.get("category","irrelevant")
    
    if cat == "irrelevant":
        return {
            "plan": [], 
            "notes": None, 
            "irrelevant": True,
            "reason": "Your request cannot be done with the available tools.",
            "unsupported_reasons": critic.get("unsupported_reasons",[]),
            "critic": critic
        }
    
    # Use original prompt if supported, or rewritten prompt if mixed
    use_prompt = prompt if cat == "supported" else critic.get("supported_rewrite") or prompt
    
    # Fall back to existing LLM planner
    base = plan_with_llama(use_prompt, tools, temperature=temperature, timeout=timeout)
    
    # If mixed, carry reasons forward
    if cat == "mixed":
        base["unsupported_reasons"] = critic.get("unsupported_reasons",[])
        note = base.get("notes") or ""
        if base["unsupported_reasons"]:
            base["notes"] = (note + (" | " if note else "") +
                             "Unsupported: " + "; ".join(base["unsupported_reasons"]))
    
    base["critic"] = critic
    return base
