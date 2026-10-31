# 📄 PDF Suite - Cross-Platform Document Engine & Converter

A modern, full-stack, cross-platform document processing suite (Web, Android, iOS, and Python FastAPI backend) inspired by iLovePDF. Built with an open-source token rewards economy and real-time Super Admin telemetry.

---

## 🚀 Features

- **🖼️ Image to PDF**: Combine multiple images (JPG, PNG, WebP) into a high-quality PDF.
- **📄 PDF to Word (.docx)**: Convert PDFs into editable Microsoft Word documents.
- **📝 Word to PDF**: Convert `.docx` documents into clean PDF files.
- **📑 PDF to Images**: Extract all pages from a PDF as individual high-res images bundled in a ZIP archive.
- **🗜️ Compress PDF**: Smart compression (Extreme, Recommended, Low) reducing file sizes by up to 60%+.
- **🖼️ Compress Image**: Reduce image sizes with adjustable quality and max-dimension downsampling.
- **📦 File to ZIP / Unzip**: Archive multiple files into a compressed `.zip` file.
- **📜 PDF to Text**: Extract readable plain text from PDF documents.
- **🎁 Token Rewards Economy**: 100% free with 7 starter tokens. Users earn tokens via daily check-in, reading tips, sharing, and feedback.
- **🛡️ Super Admin Control Center**: Real-time telemetry monitoring conversions, token claims, active users, storage cleanup, and user management.

---

## 🏗️ Project Architecture

```
pdf-suite/
├── backend/            # FastAPI Python backend (Document processing engines, SQLite DB)
│   ├── app/
│   │   ├── routes/     # Auth, Conversion, Admin, Token routers
│   │   ├── services/   # PyMuPDF, ReportLab, Pillow, Zip engines
│   │   ├── models.py   # Database models
│   │   └── main.py     # FastAPI application entry point
│   └── requirements.txt
├── web/                # React 18 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/ # Navbar, Footer, Modals, Conversion Cards
│   │   ├── pages/      # Home, Admin Dashboard, Tool Pages
│   │   └── App.tsx
│   └── package.json
├── android/            # Jetpack Compose native Android app
└── ios/                # SwiftUI native iOS app
```

---

## 🛠️ Quick Start

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend (React + Vite)
```bash
cd web
npm install
npm run dev
```
Web app will be running at `http://localhost:3000`.

---

## 🔑 Default Credentials

- **Super Admin**:
  - Email: `admin@pdfsuite.com`
  - Password: `Admin@123456`
  - Dashboard: Auto-redirects to `/admin` upon sign-in.
- **Client User**:
  - Email: `user@pdfsuite.com`
  - Password: `User@123`
  - Token balance: 7 starter tokens.

---

## 🌐 Free Hosting & Deployment

- **Frontend**: Deploy on [Vercel](https://vercel.com) or [Netlify](https://netlify.com) with root directory set to `web`.
- **Backend**: Deploy on [Render.com](https://render.com) or [Railway](https://railway.app) with root directory set to `backend`. Set start command to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

---

## 📄 License
MIT License. Open-source and free to use.
