# MediVision Buddy 🏥

AI-Powered Medical Decision Support System for Chest Disease Detection

## 🔬 Overview

MediVision Buddy is an intelligent medical assistant that combines advanced AI with medical expertise to help healthcare professionals and students analyze chest X-rays and symptoms with confidence.

## ✨ Features

### 🔬 X-Ray Analysis
Upload chest X-ray images and receive AI-powered analysis for:
- COVID-19
- Pneumonia
- Lung Opacity
- Normal classification

### 🩺 Symptom Checker
Input symptoms and receive supportive diagnostic insights based on established medical knowledge with risk level assessments.

### 💬 AI Medical Assistant
Chat with MediVision Buddy to:
- Understand analysis results
- Ask questions about chest diseases
- Get general medical precautions explained

### 🔐 Secure & Private
Your medical data is encrypted and protected with enterprise-grade security standards.

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **State Management**: TanStack React Query
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/TarrushSaxena/medivision-buddy-ai.git

# Navigate to the project directory
cd medivision-buddy-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Run ESLint |

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── integrations/   # Third-party integrations (Supabase)
├── lib/            # Utility functions
├── pages/          # Page components
└── test/           # Test files
```

## ⚠️ Disclaimer

MediVision Buddy is designed as a decision support tool and should not replace professional medical advice. Always consult with qualified healthcare professionals for medical decisions.

## 📄 License

This project is private and proprietary.

## 👨‍💻 Author

**Tarrush Saxena**
- GitHub: [@TarrushSaxena](https://github.com/TarrushSaxena)
