from DataExtractor.pdfReader import extract_pdf_text
from DataExtractor.martianAPIWrapper import MartianClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MartianClient(os.getenv("MARTIAN_KEY"))

def extract_data(pdf):
    text = extract_pdf_text(pdf)
    # Try different possible paths for the prompt file
    prompt_paths = [
        "DataExtractor/dataIsolation.prompt",  # When running from api/ directory
        "api/DataExtractor/dataIsolation.prompt",  # When running from project root
        os.path.join(os.path.dirname(__file__), "dataIsolation.prompt")  # Relative to this file
    ]
    
    prompt = None
    for path in prompt_paths:
        try:
            with open(path, "r") as file:
                prompt = file.read()
                break
        except FileNotFoundError:
            continue
    
    if prompt is None:
        raise FileNotFoundError("Could not find dataIsolation.prompt file in any expected location")
    messages = [
        {"role": "user", "content": prompt + text},
    ]
    response = client.chat_completions(
        model="openai/gpt-4.1-nano:cheap",
        messages=messages
    )
    return response, text
    
