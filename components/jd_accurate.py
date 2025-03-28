import pdfplumber
import pytesseract
from PIL import Image
import openai
import json
import re
import sys
import tiktoken  # For token counting (optional but recommended)

###################################
# 1. EXTRACT TEXT FROM PDF (with fallback OCR)
###################################

def extract_text_pdf_plumber(pdf_path):
    """
    Extract text from each page of a PDF using pdfplumber.
    If a page appears to have minimal text, fallback to OCR with pytesseract.
    """
    all_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for idx, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if not text or len(text.strip()) < 30:
                print(f"DEBUG: Page {idx} has low text, using OCR fallback.")
                # Convert PDF page to image
                page_image = page.to_image(resolution=300).original
                ocr_text = pytesseract.image_to_string(page_image, lang='eng')
                all_text.append(ocr_text)
            else:
                all_text.append(text)
    return "\n".join(all_text)

###################################
# 2. CHUNK TEXT
###################################

def chunk_text(text, max_tokens=2000):
    """
    Splits text into chunks that fit within the specified max_tokens limit.
    Uses tiktoken to estimate token counts.
    """
    encoder = tiktoken.get_encoding("cl100k_base")  # Suitable for GPT-3.5 and GPT-4
    words = text.split()
    chunks = []
    current_chunk = []
    current_token_count = 0

    for word in words:
        token_count = len(encoder.encode(word + " "))
        if current_token_count + token_count > max_tokens:
            chunks.append(" ".join(current_chunk))
            current_chunk = [word]
            current_token_count = token_count
        else:
            current_chunk.append(word)
            current_token_count += token_count

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

###################################
# 3. EXTRACT INFO FROM A TEXT CHUNK (USING OPENAI)
###################################

def extract_info_from_chunk(chunk_text, openai_api_key, model="gpt-3.5-turbo"):
    """
    Uses OpenAI's ChatCompletion API to extract structured information from a text chunk.
    The expected keys are 'experiences', 'skills', 'projects', and 'hobbies'.
    The prompt includes an explicit JSON example.
    """
    openai.api_key = openai_api_key

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant that extracts structured resume information. "
                "Return only valid JSON with the following keys: 'experiences', 'skills', 'projects', and 'hobbies'. "
                "For example: {\"experiences\": [\"Software Engineer at XYZ\"], \"skills\": [\"Python\", \"Machine Learning\"], "
                "\"projects\": [\"Project A\"], \"hobbies\": [\"Reading\"]}. "
                "If no relevant data exists in the text chunk, return empty lists for each key."
            )
        },
        {
            "role": "user",
            "content": (
                f"Text chunk:\n{chunk_text}\n\n"
                "Extract the experiences, skills, projects, and hobbies from the above text chunk. "
                "Return only valid JSON with the keys exactly as shown. If no relevant data exists, use empty lists for the values."
            )
        }
    ]

    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            max_tokens=500,
            temperature=0
        )
        result_text = response.choices[0].message["content"].strip()
        #print("DEBUG: Raw output from OpenAI for a chunk:")
        #print(result_text)
        try:
            partial_data = json.loads(result_text)
        except json.JSONDecodeError:
            #print("DEBUG: JSON parsing failed; initializing empty data for this chunk.")
            partial_data = {"experiences": [], "skills": [], "projects": [], "hobbies": []}

        # Ensure all expected keys exist.
        for key in ["experiences", "skills", "projects", "hobbies"]:
            if key not in partial_data:
                partial_data[key] = []

        return partial_data
    except Exception as e:
        #print("Error in extract_info_from_chunk:", e)
        return {"experiences": [], "skills": [], "projects": [], "hobbies": []}

###################################
# 4. MERGE PARTIAL EXTRACTIONS
###################################

def merge_extractions(extractions):
    """
    Merges multiple partial extraction dictionaries into one final structure.
    Experiences and projects are concatenated; skills and hobbies are deduplicated.
    """
    merged = {"experiences": [], "skills": [], "projects": [], "hobbies": []}
    for ext in extractions:
        merged["experiences"].extend(ext.get("experiences", []))
        merged["skills"].extend(ext.get("skills", []))
        merged["projects"].extend(ext.get("projects", []))
        merged["hobbies"].extend(ext.get("hobbies", []))

    merged["skills"] = list(set(merged["skills"]))
    merged["hobbies"] = list(set(merged["hobbies"]))
    return merged

###################################
# 5. EXTRACT RESUME DATA (END-TO-END)
###################################

def extract_resume_data(pdf_path, openai_api_key, model="gpt-3.5-turbo"):
    """
    High-level function to:
      1) Extract text from PDF (with fallback OCR)
      2) Chunk text to manage token limits
      3) Extract partial data from each chunk via OpenAI
      4) Merge partial data into a final JSON structure
    """
    full_text = extract_text_pdf_plumber(pdf_path)
    #print("DEBUG: Extracted full text length:", len(full_text))
    #print("DEBUG: Extracted text preview:", full_text[:500])

    chunks = chunk_text(full_text, max_tokens=2000)
    #print("DEBUG: Number of chunks:", len(chunks))
    for idx, chunk in enumerate(chunks, start=1):
        pass
        #print(f"DEBUG: Chunk {idx} preview: {chunk[:200]}")

    partial_extractions = []
    for idx, chunk in enumerate(chunks, start=1):
        #print(f"DEBUG: Processing chunk {idx}")
        data = extract_info_from_chunk(chunk, openai_api_key, model=model)
        #print(f"DEBUG: Extraction from chunk {idx}:", data)
        partial_extractions.append(data)

    final_data = merge_extractions(partial_extractions)
    return final_data

###################################
# 6. GET DOMAIN FROM RESUME & JOB DESCRIPTION
###################################

def get_domain_from_resume_and_jd(resume_data, job_description, openai_api_key, model="gpt-3.5-turbo", max_tokens=150):
    """
    Uses OpenAI's ChatCompletion API to determine the most appropriate job domain
    based on the candidate's resume data and the job description.
    
    The LLM is prompted to return a JSON object with keys:
      - "domain": e.g., "Software Engineering", "Data Science"
      - "rationale": a short explanation of why this domain fits (or a note if there's a mismatch).
    """
    openai.api_key = openai_api_key

    prompt = f"""
You are an expert career advisor.

Candidate Resume Data (in JSON):
{json.dumps(resume_data, indent=2)}

Job Description:
{job_description}

Based on the above, determine the most relevant domain for this candidate.
If the candidate's experience and the job requirements differ (for example, the resume shows data engineering experience while the job description requires backend software development), explain the mismatch.
Return your answer in the following JSON format:
{{"domain": "your domain", "rationale": "short rationale explaining the match or mismatch"}}
"""
    try:
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert career advisor."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=0
        )
        result_text = response.choices[0].message["content"].strip()
        #print("DEBUG: Domain output from OpenAI:")
        #print(result_text)
        try:
            domain_info = json.loads(result_text)
        except Exception as parse_error:
            #print("Error parsing JSON:", parse_error)
            domain_info = {"domain": "Unknown", "rationale": "Could not parse the response."}
    except Exception as e:
        #print("Error in get_domain_from_resume_and_jd:", e)
        domain_info = {"domain": "Unknown", "rationale": "An error occurred during API call."}

    return domain_info

###################################
# 7. EXAMPLE USAGE (Run as a script)
###################################

if __name__ == "__main__":
    jd = sys.argv[1]
    # Replace with your actual file path, job description text, and your OpenAI API key.
    pdf_path = "//Users//smukka//Documents//Hackathon//ai-powered-interview-assistant//public//resume.pdf"  # Update this with your resume PDF path.
    openai_api_key = "*******"  # Update this with your OpenAI API key.

    
    # Example job description. You can modify this as needed.
    job_description = jd
    # (
    #     "We are looking for a skilled Software Engineer with experience in building scalable backend systems, "
    #     "microservices, and RESTful APIs using languages like Java or Python. The ideal candidate should have "
    #     "experience in agile development and cloud-based architectures."
    # )

    # Extract resume data from the PDF.
    extracted_info = extract_resume_data(pdf_path, openai_api_key, model="gpt-3.5-turbo")
    #print("===== FINAL EXTRACTED RESUME INFORMATION =====")
    #print(json.dumps(extracted_info, indent=2))
    print(json.dumps(extracted_info))

    # Determine the domain based on the extracted resume data and the job description.
    domain_info = get_domain_from_resume_and_jd(extracted_info, job_description, openai_api_key, model="gpt-3.5-turbo")
    #print("===== DETERMINED DOMAIN INFORMATION =====")
    #print(json.dumps(domain_info, indent=2))
    merged = {**extracted_info, **domain_info}
    with open("//Users//smukka//Documents//Hackathon//ai-powered-interview-assistant//data//ResumeJd.json", "w") as f:
        json.dump(merged, f, indent=2)
    
    extracted_info
    
