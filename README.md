# Email Triage Classifier

A machine learning powered web application that classifies emails into five categories in real time. Built with a React frontend, Flask backend, and a pre-trained ensemble model (Soft Voting: Logistic Regression + LinearSVC + Naive Bayes) trained on the Enron-Spam dataset with TF-IDF feature extraction.

Designed as the core classification engine for a Gmail triage dashboard.

---

## Categories

| Category | Description |
|---|---|
| `spam` | Scams, phishing, unsolicited bulk mail |
| `promotions` | Marketing emails, sales, newsletters, discount codes |
| `social` | Notifications from social platforms, forums, groups |
| `updates` | Receipts, order confirmations, shipping alerts, invoices |
| `personal` | Direct human-to-human communication |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, plain CSS |
| Backend | Python, Flask, Flask-CORS |
| ML Model | scikit-learn, TF-IDF + Soft Voting Ensemble |
| Serving | Nginx (static files + reverse proxy) |
| Containerization | Docker, Docker Compose |

---

## Quick Start

Requires [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/).

```bash
git clone https://github.com/your-username/email-triage.git
cd email-triage
docker-compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
email-triage/
├── backend/
│   ├── app.py                  # Flask REST API
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend container
│   └── model/
│       ├── email_classifier.pkl    # Trained voting ensemble
│       └── tfidf_vectorizer.pkl    # Fitted TF-IDF vectorizer
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   └── App.css             # Styles
│   ├── nginx.conf              # Nginx reverse proxy config
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Node dependencies
│   └── Dockerfile              # Multi-stage frontend container
├── docker-compose.yml
└── README.md
```

---

## Running the App

### Docker (recommended)

```bash
# Start
docker-compose up --build

# Stop
docker-compose down

# Rebuild after changes
docker-compose up --build --force-recreate
```

The backend is not exposed to the host directly. All traffic goes through Nginx on port 3000, which proxies `/api/*` requests to the Flask container internally.

### Local Development (without Docker)

```bash
# Terminal 1 — backend
cd backend
pip install -r requirements.txt
python app.py
# http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## API Reference

### `POST /api/classify`

Classifies an email into one of the five categories.

**Request**
```json
{
  "subject": "Your order #48291 has been shipped",
  "body": "Your package is on its way. Expected delivery: Friday. Tracking: PK-38471-XB."
}
```

**Response**
```json
{
  "category": "updates",
  "confidence": 91.4,
  "all_scores": {
    "spam": 1.2,
    "promotions": 3.1,
    "social": 0.9,
    "updates": 91.4,
    "personal": 3.4
  }
}
```

**Error Response `400`**
```json
{
  "error": "Both subject and body are required"
}
```

---

### `GET /api/health`

Returns the current status of the API and whether the model loaded successfully.

**Response**
```json
{
  "status": "ok",
  "model_loaded": true
}
```

---

## How the Model Works

1. **Preprocessing** — text is lowercased, URLs and emails are replaced with tokens, numbers are normalized, stopwords are removed, and words are lemmatized
2. **Feature extraction** — TF-IDF with unigrams and bigrams (`max_features=30000`). Subject line is weighted 3x by repetition before vectorization
3. **Classification** — Soft Voting Ensemble combines probability outputs from Logistic Regression (weight 3), LinearSVC (weight 2), and Multinomial Naive Bayes (weight 1)
4. **Imbalance handling** — SMOTE oversampling on the training set and `class_weight='balanced'` on LR and LinearSVC

---

## Model Training

The classifier was trained separately in a Colab notebook. The two `.pkl` files in `backend/model/` are the final artifacts. To retrain, refer to the training notebook in the repository.

> Do not delete or overwrite the `.pkl` files. The application will fail to start if they are missing.

---

## Architecture Notes

- The backend container is not bound to any host port — it is only reachable from within the Docker network via the service name `backend`
- Nginx handles both static file serving and API proxying in a single container, keeping the setup minimal
- The frontend uses relative URLs (`/api/classify`) so the same code works in both Docker and local dev mode without any environment variable switching

---

## License

MIT