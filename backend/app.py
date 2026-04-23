from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

app = Flask(__name__)
CORS(app)

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

model = None
vectorizer = None

CATEGORIES = ['spam', 'promotions', 'social', 'updates', 'personal']

def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'http\S+|www\S+', ' url ', text)
    text = re.sub(r'\S+@\S+', ' email ', text)
    text = re.sub(r'\d+', ' num ', text)
    text = re.sub(r'[^a-z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = text.split()
    tokens = [lemmatizer.lemmatize(t) for t in tokens if t not in stop_words and len(t) > 2]
    return ' '.join(tokens)

def preprocess(subject, body):
    subject_clean = clean_text(subject)
    body_clean = clean_text(body)
    return (subject_clean + ' ') * 3 + body_clean

@app.before_request
def load_model():
    global model, vectorizer
    if model is None:
        model = joblib.load('model/email_classifier.pkl')
        vectorizer = joblib.load('model/tfidf_vectorizer.pkl')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

@app.route('/classify', methods=['POST'])
def classify():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Both subject and body are required'}), 400
    
    subject = data.get('subject', '')
    body = data.get('body', '')
    
    if not subject and not body:
        return jsonify({'error': 'Both subject and body are required'}), 400
    
    processed_text = preprocess(subject, body)
    X = vectorizer.transform([processed_text])
    
    proba = model.predict_proba(X)[0]
    
    all_scores = {}
    for i, cat in enumerate(model.classes_):
        all_scores[cat] = round(proba[i] * 100, 1)
    
    predicted_category = model.predict(X)[0]
    confidence = round(all_scores[predicted_category], 1)
    
    return jsonify({
        'category': predicted_category,
        'confidence': confidence,
        'all_scores': all_scores
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)