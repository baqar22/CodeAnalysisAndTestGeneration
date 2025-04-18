# backend/codegen.py
import requests
from fastapi import FastAPI, Body
from pydantic import BaseModel

app = FastAPI()

HF_API_URL = "https://api-inference.huggingface.co/models/codellama/CodeLlama-13b-Instruct-hf"
HF_API_TOKEN = "your_token_here"

class CodeRequest(BaseModel):
    code: str
    instruction: str

@app.post("/generate")
def generate_code(req: CodeRequest):
    headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
    payload = {"inputs": f"{req.instruction}\n\n{req.code}"}
    response = requests.post(HF_API_URL, headers=headers, json=payload)
    return response.json()
