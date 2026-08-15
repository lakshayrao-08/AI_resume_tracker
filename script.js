let selectedFile = null;

const fileInput = document.getElementById('fileInput');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const fileSelectedInfo = document.getElementById('fileSelectedInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const jdInput = document.getElementById('jdInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const btnText = document.getElementById('btnText');
const errorBox = document.getElementById('errorBox');
const errorText = document.getElementById('errorText');
const formSection = document.getElementById('formSection');
const resultsSection = document.getElementById('resultsSection');
const resetBtn = document.getElementById('resetBtn');

fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.type !== 'application/pdf') {
            showError('Please upload a valid PDF file.');
            return;
        }
        hideError();
        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = `${(file.size / 1024).toFixed(1)} KB • Click to change`;
        uploadPlaceholder.classList.add('hidden');
        fileSelectedInfo.classList.remove('hidden');
    }
});

analyzeBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showError('Please upload your PDF resume.');
        return;
    }
    if (!jdInput.value.trim()) {
        showError('Please paste the Job Description.');
        return;
    }

    hideError();
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('jd_text', jdInput.value);

    try {
        const response = await fetch('http://localhost:8000/analyze', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || 'Analysis failed');
        }

        const data = await response.json();
        renderResults(data);
    } catch (err) {
        showError(err.message || 'Server connection failed. Make sure Python FastAPI is running at localhost:8000');
    } finally {
        setLoading(false);
    }
});

resetBtn.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    jdInput.value = '';
    uploadPlaceholder.classList.remove('hidden');
    fileSelectedInfo.classList.add('hidden');
    resultsSection.classList.add('hidden');
    formSection.classList.remove('hidden');
    hideError();
});

function showError(msg) {
    errorText.textContent = msg;
    errorBox.classList.remove('hidden');
}

function hideError() {
    errorBox.classList.add('hidden');
}

function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    btnText.textContent = isLoading ? '🔄 Calculating ATS Match Score...' : '✨ Calculate Match Score & Extract Keywords';
}

function renderResults(data) {
    formSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    const score = data.match_score;
    document.getElementById('scoreText').textContent = `${score}%`;

    const circumference = 2 * Math.PI * 32;
    const offset = circumference * (1 - score / 100);
    document.getElementById('scoreCircle').style.strokeDashoffset = offset;

    const label = document.getElementById('scoreLabel');
    if (score >= 70) {
        label.textContent = 'Strong Match 🔥';
    } else if (score >= 40) {
        label.textContent = 'Moderate Match ⚠️';
    } else {
        label.textContent = 'Low Match ❌';
    }

    const matchedBox = document.getElementById('matchedBox');
    document.getElementById('matchedCount').textContent = `✅ Matched Keywords (${data.matched_keywords.length})`;
    matchedBox.innerHTML = data.matched_keywords.length > 0
        ? data.matched_keywords.map(w => `<span class="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg">✓ ${w}</span>`).join('')
        : '<p class="text-xs text-slate-500">No major keywords matched.</p>';

    const missingBox = document.getElementById('missingBox');
    document.getElementById('missingCount').textContent = `⚠️ Missing Key Terms (${data.missing_keywords.length})`;
    missingBox.innerHTML = data.missing_keywords.length > 0
        ? data.missing_keywords.map(w => `<span class="px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-lg">+ ${w}</span>`).join('')
        : '<p class="text-xs text-slate-500">No key terms missing!</p>';
}