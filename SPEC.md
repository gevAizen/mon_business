# 🟦 MonBusiness

**Mission:** Clarity for small business owners.

A simple offline-first PWA that allows small sellers to:

- Track products and stock
- Log sales
- Log expenses
- Automatically compute profit
- See business health at a glance

---

## 1️⃣ Core Principles

- Offline-first (local storage / IndexedDB)
- No backend
- No authentication (single-device usage)
- Flat data model (no transaction wrapper)
- Stock integrity must always be consistent
- Simple, fast input flows

---

## 2️⃣ Data Model (MVP Schema)

### Product

```ts
Product {
  id: string
  name: string
  quantity: number
  lowStockThreshold: number
  totalSold: number
  createdAt: Date
}
```

---

### Sale

```ts
Sale {
  id: string
  productId: string
  quantity: number
  amount: number
  date: Date
}
```

Effects:

- product.quantity -= quantity
- product.totalSold += quantity

On delete:

- product.quantity += quantity
- product.totalSold -= quantity

---

### Expense

```ts
Expense {
  id: string
  amount: number
  category: string
  note?: string
  productId?: string
  quantityAdded?: number
  date: Date
}
```

Categories (fixed list):

- Stock
- Transport
- Loyer
- Salaire
- Internet
- Autre

If category === "Stock":

Required:

- productId
- quantityAdded

Effect:

- product.quantity += quantityAdded

On delete:

- product.quantity -= quantityAdded

---

## 3️⃣ Pages Structure

### 🏠 Dashboard

Displays:

- Total sales (month)
- Total expenses (month)
- Net profit (month)
- Best-selling product
- Low stock alert indicator

Low stock logic:

```
product.quantity <= product.lowStockThreshold
```

---

### 📦 Products Page

Features:

- Add product (name, quantity, threshold)
- Edit product
- Manual stock correction (hidden inside edit)
- Show:
  - Current quantity
  - Total sold
  - Low stock badge if needed

---

### 💰 Sales Page

Add Sale:

- Select product
- Enter quantity
- Enter total amount

Validation:

- Cannot sell more than available stock

On save:

- Auto update stock

List sales history.

Allow delete with confirmation:

> “Cette action va remettre X unités en stock.”

---

### 💸 Expenses Page

Add Expense:

- Select category
- Enter amount
- Optional note

If category = Stock:

- Select product
- Enter quantity added

Auto-update stock accordingly.

Allow delete with proper stock reversal.

---

### 📊 Reports (Simple Section)

- Monthly revenue
- Monthly expenses
- Monthly net profit
- Most sold product (by quantity)
- Expense breakdown by category (simple list, no charts required for MVP)

---

### 📤 Export

- Export all data as JSON file
- Import JSON (optional but recommended)

---

## 4️⃣ Business Logic

### Net Profit

```
Net Profit = Total Sales - Total Expenses
```

---

### Best Product

By totalSold (current month filter)

---

### Daily / Monthly Filter

Default: current month.

Optional toggle: Today / This Month / All time.

---

## 5️⃣ Stock Integrity Rules

- Stock must never go negative
- Sale deletion restores stock
- Stock expense deletion removes added stock
- Stock updates only via:
  - Sale
  - Stock Expense
  - Manual correction (rare)

Stock is mutable but controlled.

---

## 6️⃣ UX Principles

- Large buttons
- Minimal forms
- Numeric keyboard for amounts
- Confirmation dialogs for destructive actions
- Clear alerts:
  - Low stock
  - Invalid quantity
  - Deleting impacts stock

Language: French-first.

---

## 7️⃣ Technical Stack

- React / Next.js (static export)
- PWA enabled
- localStorage (acceptable for MVP)
  OR
- IndexedDB (cleaner long term)

No backend.
No authentication.
Single device usage.

---

## 8️⃣ PWA Configuration

- Fixed app icon
- Offline support via service worker
- Installable on Android + iOS (Safari limitations acknowledged)

---

## 9️⃣ Performance Considerations

- Small dataset expected
- No need for pagination
- Simple array filtering for reports
- No AI needed in MVP

---

## 🔟 Out of Scope (MVP)

- Multi-user accounts
- Cloud sync
- Credit/debt tracking
- Supplier management
- Customer management
- Advanced analytics
- AI insights
- Dynamic PWA icon

---

## 🚀 Coming Soon (Phase 2 Ideas)

### Business Health Score

Composite score based on:

- Profit consistency
- Expense ratio
- Stock stability
- Growth trend

---

### Charts

- Monthly revenue chart
- Expense category pie chart
- Sales trend graph

---

### Margin Calculation

- Cost per unit tracking
- Gross margin per product

---

### AI Insights (One API Call Monthly)

Example:

> “Vos dépenses transport augmentent de 20% ce mois.”

---

### Customizable Shop Logo (Inside App Only)

User uploads image displayed on dashboard.
(Not PWA icon.)

---

### Smart Alerts

- Predict stock-out date
- Suggest reorder timing

---

### Cloud Backup

Optional account with phone number.
Data sync across devices.

---

## Final MVP Definition

MonBusiness is:

> A simple offline business tracker that automatically manages stock, tracks profit, and gives small sellers clarity every day.

Nothing more.
Nothing less.
