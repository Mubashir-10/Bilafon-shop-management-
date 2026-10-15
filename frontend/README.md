# Frontend (React + Vite + Tailwind)

Yeh sirf shop ki screen (UI) hai. Data backend se aata hai.

## Chalane ka tareeqa
```bash
cd frontend
npm install        # sirf pehli dafa
npm run dev        # http://localhost:5173
```

**Zaroori:** pehle backend chalu hona chahiye (`../backend`), warna login/data nahi aayega.

## Backend ka address
Default: `http://localhost:5000/api`.
Badalna ho to `.env.example` ko `.env` naam se copy karke `VITE_API_BASE_URL` change karein.

## Folder
```
src/
├── services/api.js     Backend se baat karne wala code (Axios) + login token
├── App.jsx             Data load karta hai aur buttons ke actions backend ko bhejta hai
├── pages/              Dashboard, POS, Products, Expenses, Reports ...
└── components/         Sidebar, Header, modals
```
