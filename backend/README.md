# Backend (Node.js + Express + MongoDB)

## Chalane ka tareeqa
```bash
cd backend
npm install          # sirf pehli dafa
npm run seed         # sirf pehli dafa: demo data + admin user
npm start            # http://localhost:5000/api
```
Development mein auto-restart ke liye: `npm run dev`

**Zaroori:** MongoDB pehle se chal raha ho (`mongodb://127.0.0.1:27017`).

## Login
`admin@bilafon.com` / `admin`  (asal istemal se pehle frontend ke Settings page se password badal lein).
Agar database mein koi user na ho to server start par (aur login par) yeh admin **khud ban jata hai**.

## Settings (optional)
`.env.example` ko `.env` naam se copy karein. Sab kuch ki default value maujood hai.
Asal istemal se pehle `JWT_SECRET` zaroor lamba random likhein.

| Variable | Default |
|---|---|
| PORT | 5000 |
| MONGO_URI | mongodb://127.0.0.1:27017/bilafon |
| JWT_SECRET | (khud temporary ban jata hai) |
| CORS_ORIGIN | http://localhost:5173,http://127.0.0.1:5173 |

## Folder
```
server.js        Yahan se start hota hai (MongoDB connect + server on)
app.js           Express app, CORS, routes
seed.js          Demo data
models/          Product, Category, Expense, Sale, User
routes/          URL ke raaste
controllers/     Asal logic (sale, stock, profit ...)
middleware/      Login check (JWT), errors
tests/           Automatic tests
```

## API
Sab `/api` ke andar. `/auth/*` aur `/health` ke ilawa har route ko `Authorization: Bearer <token>` chahiye.

| Method | Route | Kaam |
|---|---|---|
| POST | /auth/login | `{email, password}` -> `{token, user}` |
| PUT | /auth/change-password | Login zaroori. `{email, currentPassword, newPassword}` (email optional, apna hi hona chahiye). Naya password kam az kam 4 characters, bcrypt (10 rounds) se hash hota hai |
| POST | /auth/seed-admin | Pehla admin banata hai (sirf jab koi user na ho) |
| GET | /products?search=&category= | Products, search/filter ke saath |
| POST | /products | Naya product/stock (SKU khali ho to khud banta hai) |
| PUT | /products/:id | Details badlein; `stockQuantity` (exact) ya `stockAdjustment` (+/-) |
| DELETE | /products/:id | Product delete |
| GET / POST | /categories | Categories |
| DELETE | /categories/:id | Category hamesha ke liye delete (products delete nahi hote, unka category naam wahi rehta hai) |
| GET / POST | /expenses | Kharchay. Filter: `?month=2026-03` ya `?from=2026-03-01&to=2026-03-15` (galat date/format par 400) |
| DELETE | /expenses/:id | Kharcha delete |
| GET | /sales | Sab sales (naye pehle) |
| POST | /sales | `{customerName, paymentMethod, discount, items:[{productId, qty}]}` |
| GET | /purchases?range=today\|15days\|month\|custom&from=&to= | Stock purchase (Khareed) history + totals. `range` na ho to `month`. `custom` ke saath `from` aur `to` (YYYY-MM-DD) zaroori |
| GET | /dashboard/stats | Aaj ki sale/profit, total, low stock, net profit |

Password badalte waqt galat current password par **400** aata hai (401 nahi), taake app ise "login expire" na samjhe.

Status codes: 200 theek · 201 ban gaya · 400 galat data / stock kam / duplicate · 401 login nahi · 404 nahi mila · 500 server error.

### Purchase ledger kaise banta hai
Collection `stockpurchases`. Entry tab banti hai jab:
- naya product **stock ke saath** add ho (opening stock), ya
- product mein stock **barhaya** jaye (`stockAdjustment` positive, jaise +1 / +10).

Yeh purchase nahi ginte: stock kam karna (-1), ya `stockQuantity` ko seedha number set karna (stock theek karna), aur sale se stock ka kam hona.
Ek hi din, ek hi product, ek hi rate aur ek hi supplier ki entries ek row mein jama ho jati hain (taake +1 +1 +1 se list na bhare).
Product delete karne par uski purchase history rehti hai. Rate aur supplier us waqt ke product data se liye jate hain.

### Sale kaise mehfooz hai
- Browser sirf product id aur quantity bhejta hai. Price, cost, total aur profit **server khud** database se nikal kar hisaab karta hai.
- Stock ek shart ke saath kam hota hai (`stockQuantity >= qty`), is liye do log aakhri piece ek saath nahi bech sakte. Koi line fail ho to pichli wapas ho jati hain aur invoice save nahi hota.

## Tests
```bash
npm test
```
Yeh alag database `bilafon_test` istemal karta hai, aap ka asal data nahi chhoota.
