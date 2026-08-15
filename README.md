# ⚡ CareerZenith.ai - Local ATS Resume Optimizer

**CareerZenith.ai** is an intelligent, lightweight Applicant Tracking System (ATS) resume analyzer. It parses uploaded PDF resumes against target job descriptions, calculates ATS match scores using NLP techniques, checks for crucial engineering sections, and provides actionable recommendations to optimize your resume.

---

## 🚀 Key Features

* **⚡ Instant ATS Match Score:** Uses TF-IDF vectorization and Cosine Similarity to compare resume content against job descriptions.
* **🔍 Keyword Extraction:** Highlights matched keywords and identifies missing target keywords.
* **🛠️ Section Detection:** Detects essential sections like Projects, Work Experience, GitHub Links, and Skills headers.
* **💡 Engineering Mode Recommendations:** Provides smart feedback tailored for software engineering and technical roles.
* **🔒 Privacy-First & Fast:** Processes resumes locally in real time without third-party data tracking.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript, Tailwind CSS (via CDN)
* **Backend:** Python 3, FastAPI, Uvicorn
* **Data Processing & NLP:** Scikit-Learn (`TfidfVectorizer`, `cosine_similarity`), PyPDF, Regex

---

## 📂 Project Structure

```text
├── index.html        # Main Application Interface
├── script.js          # Client-side Handling & API Integration
├── main.py            # FastAPI Engine & NLP Algorithm
├── requirements.txt   # Python Dependencies
└── README.md          # Documentation
