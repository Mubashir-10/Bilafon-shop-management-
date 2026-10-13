# Bilafon Mobile Shop Management System

Yeh project **do alag hisson** mein hai. Dono ka apna `package.json`, apna `npm install` aur apna README hai.

```
bilafon-mobile-shop-pro/
├── frontend/     React screen (UI)        -> http://localhost:5173
└── backend/      Node + Express + MongoDB -> http://localhost:5000/api
```

Frontend sirf screen dikhata hai. Saara data (products, sales, expenses, stock) **backend ke zariye MongoDB** mein save hota hai.

## Kya chahiye
- **Node.js 18 ya naya**
- **MongoDB** (computer par install, ya MongoDB Atlas)

---

## Chalane ke 4 aasaan qadam

### Qadam 1: MongoDB chalu karein
| System | Command |
|---|---|
| **Windows** | Aam tor par khud chalta hai. Na chale to *Services* mein **MongoDB Server** start karein, ya Administrator terminal mein `net start MongoDB` |
| **macOS** | `brew services start mongodb-community` |
| **Linux** | `sudo systemctl start mongod` |
| **Docker** | `docker run -d --name bilafon-mongo -p 27017:27017 -v bilafon-data:/data/db mongo:7` |

### Qadam 2: Backend chalayen (Terminal 1)
```bash
cd backend
npm install          # sirf pehli dafa
npm run seed         # sirf pehli dafa: demo data + admin user
npm start
```
Yeh likha aana chahiye:
```
MongoDB connected: mongodb://127.0.0.1:27017/bilafon
Bilafon API running on http://localhost:5000/api
```
Is terminal ko **band na karein**.

### Qadam 3: Frontend chalayen (Terminal 2, naya terminal kholein)
```bash
cd frontend
npm install          # sirf pehli dafa
npm run dev
```

### Qadam 4: Browser mein kholein
**http://localhost:5173**

```
Email:    admin@bilafon.com
Password: admin
```
Asal istemal se pehle yeh password **Settings > Change Password** se badal lein.
(Agar database mein koi user na ho to backend start hote hi yeh admin khud ban jata hai.)

---

## Naye features kahan hain
- **Categories:** har category ke saath laal dustbin icon. Click par pehle poochta hai, phir delete karta hai.
- **Shop Expenses:** upar Month dropdown (jaise 2026-03), **Print Month Slip** button (us mahine ki slip: tareekh, title, amount, kul kharcha), aur har row mein delete icon.
- **Products & Stock** page ke neeche **Stock Purchase History & Supplier Billing**: 1 Day / 15 Days / This Month / Custom Date Range, khareed ka table, aur **Print Overall Purchase Bill** (supplier bill, Grand Total ke saath).

Purchase history sirf us waqt se banti hai jab se stock add hota hai. Purane products ki khareed ka record pehle se maujood nahi hota.
Demo data ke saath purchase history dekhni ho to `cd backend` phir `npm run seed:reset` (yeh puraana sab mita deta hai).

## Roz ka istemal
Har din bas yeh karna hai:
1. MongoDB chalu hai (aam tor par khud hota hai)
2. Terminal 1: `cd backend` phir `npm start`
3. Terminal 2: `cd frontend` phir `npm run dev`

`npm install` aur `npm run seed` dobara nahi chalane.

## Masla aaye to
| Masla | Hal |
|---|---|
| `Could not connect to MongoDB` | MongoDB chalu nahi hai, Qadam 1 dekhein |
| Browser mein alert "Backend server se connect nahi ho paya" | Backend chalu nahi hai, Qadam 2 |
| "Email ya password galat hai" | Email/password dobara check karein. Default: `admin@bilafon.com` / `admin` (agar Settings se badla hai to naya wala) |
| `ENOENT ... package.json` | Aap galat folder mein hain. `cd backend` ya `cd frontend` karke chalayen |
| Port 5000 pehle se use mein | `backend/.env` mein `PORT=5001` aur `frontend/.env` mein `VITE_API_BASE_URL=http://localhost:5001/api` |
| Har restart par dobara login karna parta hai | `backend/.env` mein `JWT_SECRET` likhein |

## Mazeed tafseel
- Frontend: `frontend/README.md`
- Backend, API list aur tests: `backend/README.md`

## Zaroori baatein
- **Demo data dobara load karna** (puraana sab mita kar): `cd backend` phir `npm run seed:reset`. Aam `npm run seed` us database par nahi chalta jis mein pehle se data ho, taake galti se asal data na mite.
- **Admin password badalna:** login karke **Settings** page kholein, neeche **Change Password** form hai. Current password, naya password (kam az kam 4 characters) aur Confirm likh kar **Update Password** dabayen.
- **Password bhool gaye?** MongoDB mein `users` collection ka document delete karein (MongoDB Compass mein, ya `mongosh` mein `use bilafon; db.users.deleteMany({})`) aur backend dobara chalayen. Koi user na ho to backend khud `admin@bilafon.com` / `admin` bana deta hai.
- Sale ka waqt aur "aaj" ka hisaab **server computer ki ghari** se hota hai.
