🏥 CareCompanion — AI-Powered Healthcare & Wellness Platform

CareCompanion is a full-stack AI healthcare management web application built with the MERN stack + Python AI backend.
It empowers users to track, analyze, and optimize their health through intelligent insights, personalized care plans, and lifestyle management — all within a beautifully designed interface.

🎯 Repository: CareCompanion-Healthcare-Platform

🚀 Frontend: React + Vite + Tailwind
🧠 Backend: Node.js + Express + MongoDB + Python AI

📁 Project Structure
<pre> 🏥 CareCompanion/ ├── ⚙️ .env # 🔐 Environment configuration (frontend + backend) ├── 🧠 backend/ # 🧩 Express.js + Python hybrid backend │ ├── 📄 server.js # 🚀 Express entry point │ ├── 🧩 controllers/ # 🧠 Business logic (auth, profile, subscription) │ ├── 🛡️ middleware/ # 🔒 Authentication & validation middleware │ ├── 🧬 models/ # 🩸 MongoDB Schemas (User, Profile, Subscription) │ ├── 🧭 routes/ # 🗺️ API Routes (auth, profile, ai, subscription) │ ├── 🤖 ai_handler.py # 🧬 Python ML/AI handler for intelligent insights │ └── 📦 package.json # Backend dependencies │ ├── 💻 src/ # 🎨 React + TypeScript frontend │ ├── 📂 components/ # 🧱 Reusable UI components (Navbar, Cards, etc.) │ ├── 🧩 contexts/ # 🔄 Auth context + global state management │ ├── 🪝 hooks/ # 🧠 Custom hooks (useToast, useMobile) │ ├── ⚙️ lib/ # 🔧 API & Auth utilities (JWT, Axios) │ ├── 📄 pages/ # 📋 App pages (Home, Chat, Profile, Auth, Plans) │ ├── 🎨 styles/ # 💅 Tailwind styling & global CSS │ ├── 🧠 App.tsx # 🧩 App routing and layout │ └── 🧠 main.tsx # 🪶 Vite + React entry point │ ├── 🖼️ public/ # 🌐 Public assets (favicon, logos, dataset CSV) ├── 🐳 Dockerfile # 🧰 Docker setup for deployment ├── ⚙️ vite.config.ts # ⚡ Vite + proxy configuration ├── 📦 package.json # 🧩 Project metadata & dependencies └── 📝 README.md # 📘 Project documentation </pre>
🧰 Tech Stack
Tech / Tool	Purpose
React.js + TypeScript	Frontend UI framework
Vite	Lightning-fast dev environment
Tailwind CSS	Modern, responsive styling
shadcn/ui + Lucide	Beautiful, accessible UI components
Express.js	Node.js backend & API routing
MongoDB (Mongoose)	NoSQL database for profiles & users
JWT Auth	Secure login & route protection
bcrypt.js	Encrypted password handling
Python (Flask/FastAPI)	AI health insights module
Render / Vercel	Deployment (Backend + Frontend)
✨ Features Overview
👤 User Authentication

Register, login, and logout securely via JWT

Persistent sessions with local storage token

Email verification & password management

🧍 Profile Management

Add or update personal, health, and lifestyle data

Medication tracking with CRUD features

Profile completion tracker (progress % displayed)

Emergency contact & bio details

💊 Health & Lifestyle Tracking

Log allergies, medical history, and current conditions

Track exercise, diet, and habits dynamically

AI-assisted lifestyle recommendations

🧠 AI-Powered Healthcare Assistant

Integrated Python AI engine (ai_handler.py)

Generates health recommendations and predictions

Future-ready ML model integration for symptoms → diagnosis

💬 Smart Chat Interface

Real-time AI chat for medical queries

Context-aware responses powered by backend AI module

💸 Subscription Plans

Plan tiers: Free, Pro, and Ultimate

Role-based access (user, admin, doctor)

Automatic plan expiration and validation

🏥 Dashboard & Insights

Health completion score visualized

AI-generated personalized summaries

Upcoming appointments (future expansion)

🔐 Security

JWT token validation on every protected route

Account deactivation & reactivation logic

Environment-based configuration for production safety

🚀 Deployment

Frontend — Vercel
Backend — Render
Database — MongoDB Atlas

Add this to your .env files:

🧩 Backend .env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000

⚙️ Frontend .env
VITE_API_URL=https://your-render-backend.onrender.com

🛠️ Getting Started
1️⃣ Clone Repository
git clone https://github.com/MSC-0013/CareCompanion-Healthcare-Platform-.git
cd CareCompanion-Healthcare-Platform-

2️⃣ Setup Backend
cd backend
npm install
npm start

3️⃣ Setup Frontend
cd ..
npm install
npm run dev


Visit 👉 http://localhost:8080

📊 API Routes Overview
Endpoint	Method	Description
/api/auth/register	POST	Register a new user
/api/auth/login	POST	Authenticate user
/api/auth/me	GET	Get logged-in user
/api/profile/	GET/PUT	Get or update profile
/api/profile/medications	POST/PUT/DELETE	Manage medications
/api/subscription/	GET/PUT	Manage subscription plans
/api/ai/predict	POST	Get AI-generated health insights
🧠 Future Roadmap

🩺 Integration with wearable health devices (Fitbit, Apple Watch)

📈 AI-based health prediction graphs

🧬 Personalized nutrition and workout recommendation system

💬 Doctor–Patient chat module

📲 Mobile-friendly PWA version

👤 Author

Soumyashree Rout
🔗 GitHub: @MSC-0013

🌐 Portfolio: https://port-folio-tau-coral.vercel.app

📧 Email: soumyashreerout99@gmail.com

💼 LinkedIn: Soumyashree Rout

🧭 License

This project is licensed under the MIT License — feel free to use and build upon it.
