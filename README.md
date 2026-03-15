<div align="center">
  <img src="https://raw.githubusercontent.com/TarrushSaxena/medivision-buddy-ai/main/public/favicon.ico" alt="MediVision Logo" width="120" />
  <h1>MediVision Buddy 🏥</h1>
  <p><strong>AI-Powered Medical Decision Support System for Chest Disease Detection</strong></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TS Badge"/>
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite Badge"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind Badge"/>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Badge"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white" alt="FastAPI Badge"/>
  <img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TF Badge"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase Badge"/>
</div>

<br />

## 🔬 Overview

MediVision Buddy is an intelligent medical assistant that combines advanced visual AI with medical expertise. It helps healthcare professionals and students analyze chest X-rays and evaluate symptoms with confidence, providing an explainable AI pipeline using Grad-CAM heatmaps to intimately interpret results.

## ✨ Features

### 🔬 X-Ray Analysis (DenseNet201)
Upload chest X-ray images and receive an AI-powered analysis powered by a specialized **DenseNet201** neural network. 
- **Explainable AI (XAI)**: Generates highly accurate **Grad-CAM Heatmaps** highlighting the affected regions on the X-ray structure contextually.
- Capable of detecting **COVID-19**, **Pneumonia**, **Lung Opacity**, and **Normal** lung conditions.

### 🩺 Advanced Symptom Checker (Random Forest)
Input a variety of symptoms and receive supportive diagnostic insights. 
- Built upon a refined Random Forest model ensuring reliable, data-driven outputs.
- Calculates normalized local impact to weigh individual symptoms.
- Provides specialized urgency logic matching standard medical protocol. 

### 💬 AI Medical Assistant
Chat with MediVision Buddy's integrated AI assistant to:
- Understand analysis results and complex diagnostics intuitively.
- Ask targeted questions about chest diseases.
- Obtain general medical precautions easily.

### 🔐 Secure & Private
Powered by Supabase edge-authentication, your medical data is heavily encrypted, highly secure, and adheres strictly to modern web safety protocols.

## 🛠️ Tech Stack & Architecture

### **Frontend App**
- **Core Engine:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS + shadcn/ui components
- **Routing & State:** React Router v6, TanStack React Query

### **Backend AI Server**
- **Framework:** Python 3.x, FastAPI, Uvicorn (ASGI server)
- **Deep Learning / Vision:** TensorFlow, Keras, OpenCV
- **Machine Learning:** Scikit-Learn (RandomForest)

### **Database & Auth**
- **MBaaS Engine:** Supabase (PostgreSQL, Authentication & Secure Storage)

## 🚀 Getting Started

Follow these steps to set up the system on your local machine. You will need to start both the Python Backend API and the Vite Frontend.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) and npm/yarn
- [Python 3.8+](https://www.python.org/downloads/)
- Optional: Virtual Environment setup (`venv` or `conda`)

### 1. Clone the repository
```bash
git clone https://github.com/TarrushSaxena/medivision-buddy-ai.git
cd medivision-buddy-ai
```

### 2. Set up the AI Backend
```bash
# Navigate to the server folder
cd server

# Install the required Python packages
pip install -r requirements.txt

# Start the FastAPI engine (runs on port 8000)
python model_api.py
```
*Note: Ensure your `densenet201_covid.h5` core model is placed correctly inside the `server/models/` directory for X-ray predictions to succeed.*

### 3. Set up the Frontend
Open a **new terminal window** alongside the backend process:
```bash
# Navigate back to the project root
cd ..

# Install frontend node modules
npm install

# Start the Vite development sever (runs on port 8080)
npm run dev
```

The application UI will be accessible natively at: `http://localhost:8080`

## 🏗️ Project Structure

```text
medivision-buddy-ai/
├── server/                     # Python AI Backend Engine
│   ├── models/                 # Pre-trained DL models (.h5 weights)
│   ├── model_api.py            # Main FastAPI server & prediction logic
│   └── requirements.txt        # Python dependencies
├── src/                        # React Frontend Source View
│   ├── components/             # Reusable UI components & shadcn imports
│   ├── contexts/               # React context providers
│   ├── hooks/                  # Custom abstractions
│   ├── integrations/           # Third-party integrations (Supabase endpoints)
│   ├── pages/                  # Main visual route layouts
│   └── lib/                    # Helper utility functions
├── public/                     # Static Web Assets
└── package.json                # NPM Scripts & Build config
```

## ⚠️ Disclaimer

MediVision Buddy is designed strictly as a **decision support tool** and **diagnostic aid** for educational context and professional referencing. It should **not replace** professional medical advice, comprehensive diagnosis, or emergency protocols. Always consult with qualified healthcare professionals for definitive medical decisions.

## 👨‍💻 Author & Open Source Context

**Tarrush Saxena**
- GitHub: [@TarrushSaxena](https://github.com/TarrushSaxena)

---
<div align="center">
  <i>Empowering diagnostic intelligence with accessible, explainable AI</i>
</div>
