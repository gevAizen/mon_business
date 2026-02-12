# "MonBusiness" web app (PWA)

_"Tu travailles dur chaque jour, mais tu sais vraiment si ton business gagne de l’argent ? MonBusiness t’aide à voir clairement ce qui se passe dans ton commerce, sans paperasse compliquée ni calculs fastidieux. Entre tes ventes et tes dépenses, suis tes profits, surveille tes stocks et découvre l’état de ton business en un coup d’œil. Simple, rapide, et toujours à portée de main sur ton téléphone, même hors ligne."_

## 🎯 MVP Definition (Locked Scope)

Must have:

- Add daily sales & expenses
- Automatic profit calculation
- Monthly summary
- Business health score (deterministic)
- Stock tracking + threshold alert (in-app only)
- JSON export / import
- Works offline (PWA)
- No backend
- No auth
- LocalStorage only

Nothing else.

---

## 0️⃣ Project Setup (30–45 min)

- [x] Create Next.js app (app router)
- [x] Install Tailwind
- [x] Install `@serwist/next`
- [ ] Configure static export (if desired)
- [ ] Clean default template

---

## 1️⃣ Define Data Models (Core)

Create shared types:

- [ ] DailyEntry

```TS
 {
   date: string
   sales: number
   expenses: number
 }
```

- [ ] StockItem

```TS
 {
   id: string
   name: string
   quantity: number
   threshold: number
 }
```

- [ ] BusinessSettings

```TS
 {
   name: string
   dailyTarget?: number
 }
```

- [ ] Root storage object

```TS
 {
   settings,
   entries[],
   stock[]
 }
```

---

## 2️⃣ Local Storage Layer (Important)

Create simple utility:

- [ ] loadData()
- [ ] saveData()
- [ ] Safe JSON parsing
- [ ] Default fallback structure

No external state library needed.

Use useState + useEffect.

---

## 3️⃣ First-Time Setup Screen

If no data exists:

- [ ] Ask business name
- [ ] Optional daily target
- [ ] Save locally
- [ ] Redirect to dashboard

---

## 4️⃣ Add Daily Entry Page

Form:

- [ ] Sales input (number)
- [ ] Expenses input (number)
- [ ] Auto-set today’s date
- [ ] Save entry
- [ ] Prevent duplicate date entry (update instead)

---

## 5️⃣ Profit Calculation Engine

Create pure functions:

- [ ] getTodayProfit()
- [ ] getMonthlyProfit()
- [ ] getAverageDailyProfit()
- [ ] getLast7DaysTrend()

Keep logic separate from UI.

---

## 6️⃣ Business Health Score Logic

Create deterministic scoring function:

Example logic:

Start: 10

- [ ] Profit today < 0 → -3
- [ ] 3-day average decreasing → -2
- [ ] Expenses > 70% of sales → -2
- [ ] 2+ days missing entries → -1
- [ ] Week growth positive → +1

Clamp 0–10.

Return:

{
score: number,
message: string
}

---

## 7️⃣ Dashboard Page

Display:

- [ ] Greeting (Business Name)
- [ ] Today profit
- [ ] Monthly profit
- [ ] Health score (big visual)
- [ ] Trend indicator
- [ ] Low stock warning badge (if any)

Mobile-first design.

---

## 8️⃣ Stock Management Page

- [ ] Add product
- [ ] Edit quantity
- [ ] Set threshold
- [ ] Highlight items where quantity ≤ threshold
- [ ] Delete item

No alerts.
Just visual warning.

---

## 9️⃣ JSON Export / Import

Export:

- [ ] Button “Download My Data”
- [ ] Generate JSON file
- [ ] Trigger download

Import:

- [ ] Upload JSON file
- [ ] Validate structure
- [ ] Replace local data
- [ ] Confirmation modal

---

## 🔟 Offline / PWA Setup

- [ ] Configure next-pwa
- [ ] Add manifest.json
- [ ] Add app icons
- [ ] Test offline mode
- [ ] Test install on mobile
- [ ] Add small banner: “Install App”

---

## 1️⃣1️⃣ UI Polish (Last 1–2 Hours)

- [ ] Clean typography
- [ ] Large buttons (mobile friendly)
- [ ] Currency format (CFA)
- [ ] Color-coded profit (green/red)
- [ ] Health score color scale:
  - 8–10: Green
  - 5–7: Orange
  - 0–4: Red

Keep it minimal.

---

# 🧠 Architecture Principles

- No Redux
- No Context API unless needed
- No API routes
- No server actions
- No database
- Pure client app

Keep logic in /lib/
Keep types in /types/
