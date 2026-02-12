# Stock & Expense Categorization Feature Plan

## Problem Statement

Current system lacks inventory tracking depth and expense insights:

- Sales are arbitrary amounts (no product tracking)
- Expenses are lump sums with no categorization
- No visibility into what products sell best
- Stock updates are manual (error-prone)

## Solution Overview

1. **Stock Tracking**: Add `totalSold` field to StockItem; auto-decrement stock when selling
2. **Expense Categories**: 6 predefined categories (Stock, Transport, Loyer, Salaire, Internet, Autre)
3. **Smart Data Model**: DailyEntry redesigned to track product sales & categorized expenses separately
4. **UI/UX**:
   - Tab/Accordion system in AddEntry to switch between sales & expenses
   - Dashboard shows low-stock alerts + top performers snippet
   - New Analytics page: pie chart for expenses + top-performing products

---

## Workplan

### Phase 1: Data Model & Types

- [ ] Update `StockItem` type: add `totalSold: number` field (tracks cumulative units sold)
- [ ] Create new types:
  - [ ] `ExpenseCategory` enum: 'Stock' | 'Transport' | 'Loyer' | 'Salaire' | 'Internet' | 'Autre'
  - [ ] `SaleLineItem`: { productId, quantity, unitPrice?, total }
  - [ ] `ExpenseLineItem`: { category, amount }
  - [ ] Update `DailyEntry`: remove generic `sales`/`expenses`, add `saleItems[]` & `expenseItems[]`
- [ ] Add validation utilities for new types

### Phase 2: Localization (i18n)

- [ ] Add French translations for:
  - [ ] Expense category names (Stock, Transport, Loyer, Salaire, Internet, Autre)
  - [ ] UI labels: "Ajouter une vente", "Ajouter une dépense", "Catégorie de dépense"
  - [ ] Analytics page: "Analyse des dépenses", "Produits les plus vendus"

### Phase 3: Core Logic Updates

- [ ] Create `lib/expenses.ts`:
  - [ ] Function to sum expenses by category (for pie chart)
  - [ ] Function to format category breakdown (list of categories + totals)
- [ ] Create `lib/stock.ts`:
  - [ ] Function to update stock when entry is saved (decrement by quantity sold)
  - [ ] Function to get top-selling products (sort by totalSold desc)
  - [ ] Function to detect low-stock items for alerts
- [ ] Update `lib/profit.ts`:
  - [ ] Modify getTodayProfit/getMonthlyProfit to work with new `saleItems[]` structure
  - [ ] Ensure profit calculation still works: sum all sales - sum all expenses by category

### Phase 4: Storage & Migration

- [ ] Update `lib/storage.ts`:
  - [ ] Add validation for new DailyEntry structure
  - [ ] Add data migration logic (convert old simple sales/expenses to new structure)
  - [ ] Backward compatibility: handle both old & new formats on load
- [ ] Test migration with sample data

### Phase 5: AddEntry Component Redesign

- [ ] Refactor AddEntry.tsx:
  - [ ] Add tab/accordion system: "Vente" | "Dépense"
  - [ ] **Sales Tab**:
    - [ ] Dropdown to select product from stock
    - [ ] Input field for quantity
    - [ ] Display unit price (if available) & calculated total
    - [ ] "Add Line Item" button to stack multiple products
    - [ ] Show list of selected products with ability to remove
  - [ ] **Expense Tab**:
    - [ ] Dropdown/buttons for expense category (6 predefined)
    - [ ] Input field for amount
    - [ ] "Add Line Item" button to stack multiple expenses
    - [ ] Show list of added expenses with ability to remove
  - [ ] Total profit calculation: sum(sales) - sum(expenses)
  - [ ] On save: auto-decrement stock for each product sold

### Phase 6: StockManagement Updates

- [ ] Update `StockManagement.tsx`:
  - [ ] Display `totalSold` field (read-only, for reference)
  - [ ] Show low-stock alert on each item (if quantity ≤ threshold)
  - [ ] Optional: add unit price field (for future cost tracking)

### Phase 7: Dashboard Enhancements

- [ ] Update `Dashboard.tsx`:
  - [ ] **Low-Stock Alert Section**: Show 2-3 top low-stock items
  - [ ] **Top Performers Snippet**: Show 2-3 best-selling products by totalSold
  - [ ] Link to Analytics page for detailed view

### Phase 8: New Analytics Page

- [ ] Create `app/components/Analytics.tsx`:
  - [ ] **Expense Breakdown**:
    - [ ] Pie chart: 6 expense categories with percentages
    - [ ] List view: category names + amounts + % of total
    - [ ] Filter by date range (optional: today, this month, all time)
  - [ ] **Top Performing Products**:
    - [ ] Table/List: product name, totalSold, total revenue from that product
    - [ ] Sort by totalSold desc or by revenue
  - [ ] "Back" button to return to Dashboard

### Phase 9: Navigation & Routing

- [ ] Update `app/page.tsx`:
  - [ ] Add Analytics tab to bottom navigation (4 tabs → 5 tabs or rearrange)
  - [ ] Ensure active state styling works for Analytics

### Phase 10: Testing & Validation

- [ ] Build & verify no TypeScript errors
- [ ] Manual test:
  - [ ] Add entry with multiple products → verify stock decrements
  - [ ] Add entry with categorized expenses → verify pie chart shows breakdown
  - [ ] Test migration: old data loads correctly
  - [ ] Low-stock alerts show correctly
  - [ ] Top performers update as sales accumulate
- [ ] Test edge cases:
  - [ ] Selling product that doesn't exist (error handling)
  - [ ] Deleting an entry → should stock be restored? (decide & implement)
  - [ ] Zero-quantity products in sales

---

## UI/UX Flow

### AddEntry Modal (Redesigned)

```
┌─────────────────────────────────┐
│  Ajouter une entrée             │ [X]
├─────────────────────────────────┤
│ [Vente] [Dépense]               │  <- Tab/Accordion
├─────────────────────────────────┤
│ Produit: [Dropdown: "Chaussures"]│  <- Sales tab
│ Quantité: [2]                   │
│ Prix unitaire: 25,000 CFA       │
│ Total: 50,000 CFA               │
│ [+ Ajouter autre produit]       │
│ ┌─────────────────────────────┐ │
│ │ Chaussures × 2              │ │
│ │ 50,000 CFA              [✕] │ │
│ └─────────────────────────────┘ │
│                                 │
│ Profit: 50,000 CFA              │
├─────────────────────────────────┤
│ [Annuler] [Enregistrer]         │
└─────────────────────────────────┘

When "Dépense" tab clicked:
┌─────────────────────────────────┐
│ Catégorie: [Dropdown: "Stock"]   │  <- Expense tab
│ Montant: 15,000 CFA             │
│ [+ Ajouter autre dépense]       │
│ ┌─────────────────────────────┐ │
│ │ Stock: 15,000 CFA       [✕] │ │
│ │ Transport: 5,000 CFA    [✕] │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### Dashboard (Enhanced)

```
┌─────────────────────────────────┐
│ Bonjour, [Business Name]        │
├─────────────────────────────────┤
│ 📊 Profit: 50,000 CFA (green)   │
│ 📈 Tendance: En croissance      │
│ 💪 Santé: 7/10 - Bon            │
├─────────────────────────────────┤
│ ⚠️  Stock faible:                │
│ • Chaussures (2/10 seuil)   [→] │
│ • Shirts (3/15 seuil)       [→] │
├─────────────────────────────────┤
│ ⭐ Produits les plus vendus:     │
│ • Chaussures (50 vendues)   [→] │
│ • Shirts (20 vendues)       [→] │
│ [Voir l'analyse complète]   [→] │
├─────────────────────────────────┤
│ [+ Ajouter] [📋] [📦] [📊] [⚙️] │
└─────────────────────────────────┘
```

### Analytics Page

```
┌─────────────────────────────────┐
│ ← Analyse des dépenses          │
├─────────────────────────────────┤
│        PIE CHART                │
│    (6 expense categories)       │
│                                 │
│ Répartition:                    │
│ • Stock: 45,000 CFA (45%)  ■    │
│ • Transport: 20,000 CFA (20%) ■ │
│ • Salaire: 30,000 CFA (30%) ■   │
│ • Internet: 5,000 CFA (5%) ■    │
├─────────────────────────────────┤
│ Produits les plus vendus:       │
│ # | Produit    | Vendus | Total │
│ 1 | Chaussures | 50     | 1.25M │
│ 2 | Shirts     | 20     | 500K  │
│ 3 | Pantalons  | 15     | 750K  │
├─────────────────────────────────┤
│ Filtrer: [Aujourd'hui] [Mois]   │
│          [Tout]                 │
└─────────────────────────────────┘
```

---

## Technical Decisions

### Stock Decrement Strategy

- **When**: On entry save (after validation)
- **Rollback**: If entry is deleted, stock is NOT automatically restored (user manually adjusts)
- **Reason**: Simplicity + force user awareness of deletions

### Expense Categories (Hardcoded)

- 6 fixed categories as predefined dropdowns
- No user custom categories (to keep analytics clean)

### Migration Strategy

- Old entries (with generic `sales`/`expenses`) converted on load
- `sales` → single `saleItem` with generic product ID
- `expenses` → single `expenseItem` with category "Autre"
- No data loss, gradual transition as user adds new entries

### Analytics Date Filter

- Start simple: default to "current month"
- Optional enhancement: add date range picker later

---

## Considerations & Notes

- **Performance**: With many products/expenses, pie chart may get large. Consider limiting to top categories + "Other"
- **Stock Deletion**: Should deleting a stock item zero out totalSold? Decide: Keep history (safer) or reset
- **Expense without Product**: Current design requires product for sales. Expense-only entries are common (rent, utilities) → works as standalone expense
- **Mobile**: AddEntry tab switching needs clear visual feedback on small screens
