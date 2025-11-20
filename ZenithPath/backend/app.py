from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv, os, re

app = FastAPI(title="ZenithPath Backend", version="0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load helpline dataset
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def load_helplines():
    data = {}
    path = os.path.join(DATA_DIR, "helplines.csv")
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            data[row["country_code"]] = row
    return data

HELPLINES = load_helplines()

class ChatIn(BaseModel):
    message: str
    country: str = "IN"

class ChatOut(BaseModel):
    reply: str
    crisis: bool = False

CRISIS_RE = re.compile(r"(suicid|kill myself|end my life|self[- ]?harm|hurt myself|i want to die)", re.I)

@app.post("/api/chatbot", response_model=ChatOut)
def chatbot(inp: ChatIn):
    msg = inp.message.lower()
    if CRISIS_RE.search(msg):
        h = HELPLINES.get(inp.country, HELPLINES.get("IN"))
        return ChatOut(
            crisis=True,
            reply=f"""I'm really glad you told me. You’re not alone.
If you're in danger, call {h['emergency']}.
Helplines in {h['country']}: {h['primary']}, {h['secondary']}
Let's take a slow breath together — inhale 4, hold 4, exhale 4."""
        )
    if "breathe" in msg:
        return ChatOut(reply="Try Box Breathing: inhale 4, hold 4, exhale 4, hold 4.")
    if "stress" in msg or "anxious" in msg:
        return ChatOut(reply="Take a 2-min breathing break — tap Breathe → Start.")
    return ChatOut(reply="I’m here. Try asking about breathing or motivation.")

@app.get("/api/exercises")
def exercises():
    return [{"id": "box", "name": "Box Breathing (4-4-4-4)"}]

@app.get("/api/ping")
def ping():
    return {"ok": True, "message": "pong"}
