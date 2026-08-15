from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pypdf
import re
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(pdf_bytes):
    reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    text = ""
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted + " "
    return text

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    return text

def analyze_engineering_sections(raw_text):
    text_lower = raw_text.lower()
    
    sections = {
        "has_projects": bool(re.search(r'\b(project|projects)\b', text_lower)),
        "has_experience": bool(re.search(r'\b(experience|work experience|employment history)\b', text_lower)),
        "has_education": bool(re.search(r'\b(education|academic|qualification)\b', text_lower)),
        "has_skills_section": bool(re.search(r'\b(skills|technical skills|technologies)\b', text_lower)),
        "has_github": bool(re.search(r'\b(github|gitlab|portfolio)\b', text_lower)),
    }
    
    suggestions = []
    bonus_score = 0
    
    if sections["has_projects"]:
        bonus_score += 10
    else:
        suggestions.append("Add a dedicated 'Projects' section with links and dynamic tech stack details.")
        
    if sections["has_experience"]:
        bonus_score += 10
    else:
        suggestions.append("Include relevant work experience or internships with quantitative metrics.")
        
    if sections["has_github"]:
        bonus_score += 5
    else:
        suggestions.append("Add a GitHub profile or Portfolio URL to showcase engineering work.")
        
    if sections["has_skills_section"]:
        bonus_score += 5
    else:
        suggestions.append("Group your technical skills explicitly under a 'Skills' header for ATS parsing.")

    engineering_role = bool(re.search(r'\b(engineer|developer|data scientist|architect|sde|frontend|backend|fullstack|devops|software)\b', text_lower))
    
    return {
        "sections": sections,
        "bonus_score": bonus_score,
        "suggestions": suggestions,
        "is_engineering_role": engineering_role
    }

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...), jd_text: str = Form(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    pdf_bytes = await file.read()
    raw_resume_text = extract_text_from_pdf(pdf_bytes)
    
    if not raw_resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
        
    cleaned_resume = clean_text(raw_resume_text)
    cleaned_jd = clean_text(jd_text)
    
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform([cleaned_resume, cleaned_jd])
    
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    base_match_score = round(similarity * 100, 1)
    
    eng_analysis = analyze_engineering_sections(raw_resume_text)
    
    final_score = min(100, round(base_match_score + (eng_analysis["bonus_score"] * 0.3), 1))
    
    feature_names = vectorizer.get_feature_names_out()
    resume_words = set(cleaned_resume.split())
    jd_words = set(cleaned_jd.split())
    
    matched = [word for word in feature_names if word in resume_words and word in jd_words]
    missing = [word for word in feature_names if word in jd_words and word not in resume_words]
    
    return {
        "match_score": final_score,
        "base_tf_idf_score": base_match_score,
        "is_engineering_role": eng_analysis["is_engineering_role"],
        "section_checks": eng_analysis["sections"],
        "suggestions": eng_analysis["suggestions"],
        "matched_keywords": matched[:15],
        "missing_keywords": missing[:15]
    }