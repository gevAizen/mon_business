/**
 * French localization - Main language for the app
 * Easy to add more languages by duplicating this structure
 */

export const fr = {
  // Onboarding
  onboarding: {
    title: "Vos profits, clairs et simples",
    subtitle: "Suivez votre business en toute simplicité",
    description:
      "Découvrez en un clin d’œil si votre business est rentable, en toute transparence.",
    businessNameLabel: "Le nom de votre activité",
    businessNamePlaceholder: 'Coiffure "Chez Marie", Boutique "Mode & Style"',
    dailyTargetLabel: "Votre objectif de profit (facultatif)",
    dailyTargetPlaceholder: "Laissez vide si vous n'avez pas d'objectif",
    startButton: "C’est parti !",
    trust: {
      security: "Vos données restent sur votre téléphone, 100% sécurisées",
      offline: "Utilisable même sans internet",
      privacy: "Vos informations sont privées et protégées",
    },
  },

  // Dashboard
  dashboard: {
    greeting: "Bonjour",
    subtitle: "Voici l'état de votre business  aujourd’hui",
    todayProfit: "Profit d'aujourd'hui",
    monthlyProfit: "Profit ce mois",
    healthScore: "Santé de votre business",
    trendLabel: "Évolution (7 jours)",
    trendUp: "En croissance",
    trendDown: "En baisse",
    trendStable: "Stable",
    lowStockAlert: "Stock à réapprovisionner",
    lowStockMessage: "produit sous le seuil",
    addEntryButton: "+ Ajouter une entrée",
    entriesButton: "📋 Entrées",
    stockButton: "📦 Stock",
    viewAll: "Voir plus",
    lowStock: "Stock faible",
    topPerformers: "Vos best-sellers",
    analyticsButton: "📊 Analyse",
  },

  // Entry
  entry: {
    addEntry: "Ajouter une entrée",
    date: "Date",
    sales: "Ventes",
    salesPlaceholder: "Montant des ventes",
    expenses: "Dépenses",
    expensesPlaceholder: "Montant des dépenses",
    profit: "Profit",
    save: "Enregistrer",
    today: "Aujourd'hui",
    yesterday: "Hier",
    entryAlreadyExists: "Une entrée existe déjà pour cette date",
    // New fields for Phase 2
    addSale: "Ajouter une vente",
    addExpense: "Ajouter une dépense",
    selectProduct: "Sélectionner un produit",
    quantity: "Quantité",
    sellingUnitPrice: "Prix unitaire",
    total: "Total",
    expenseCategory: "Catégorie de dépense",
    addLineItem: "+ Ajouter",
    removeLineItem: "Supprimer",
    selectCategory: "Sélectionner une catégorie",
  },

  // Stock
  stock: {
    inventory: "Mes produits en stock",
    subtitle: "Retrouvez ici tous les produits que vous vendez.",
    addProduct: "Ajouter un produit",
    productName: "Nom du produit",
    sellingPrice: "Prix de vente",
    quantity: "Quantité",
    threshold: "Seuil d'alerte",
    lowStockAlert: "Stock faible",
    noProducts: "Aucun produit pour le moment",
    edit: "Modifier",
    delete: "Supprimer",
    totalSold: "Total vendu",
    unitSellingPrice: "Prix unitaire de vente",
  },

  // Navigation
  nav: {
    dashboard: "Dashboard",
    entries: "Entrées",
    stock: "Stock",
    analytics: "Analyse",
    settings: "Données",
    loading: "Chargement...",
  },

  // Health Score Messages
  healthScore: {
    excellent: "Business florissant",
    good: "Tendance positive",
    warning: "À surveiller",
    critical: "Action requise",
  },

  // Settings
  settings: {
    title: "Paramètres",
    businessName: "Nom du business",
    dailyTarget: "Objectif quotidien",
    exportData: "Télécharger mes données",
    importData: "Importer mes données",
    clearAll: "Tout effacer",
    confirmClear: "Êtes-vous sûr ? Toutes vos données seront supprimées.",
    dataTitle: "Mes données en sécurité",
    dataSubtitle:
      "Sauvegarder vos données ou restaurer une ancienne sauvegarde",
    exportTitle: "Télécharger mes données",
    exportDescription:
      "Créez une sauvegarde de toutes vos données de business. Vous pourrez réimporter ce fichier ultérieurement.",
    importTitle: "Importer mes données",
    importDescription:
      "Restaurez vos données à partir d'une sauvegarde précédente. Vos données actuelles seront remplacées.",
    privacyTitle: "🔒 Votre vie privée",
    privacyPoint1: "✓ Aucune donnée n'est envoyée en ligne",
    privacyPoint2: "✓ Toutes les données restent sur votre appareil",
    privacyPoint3: "✓ Les fichiers de sauvegarde sont stockés localement",
    exportSuccess: "✓ Données téléchargées avec succès",
    exportError: "Erreur lors du téléchargement",
    importSuccess: "✓ Données importées avec succès",
    importConfirm:
      "Cette action va remplacer toutes vos données actuelles. Êtes-vous sûr ?",
    importError: "Impossible de sauvegarder les données",
    fileReadError: "Erreur lors de la lecture du fichier",
    invalidFormat: "Format de fichier invalide",
    clearDataTitle: "Supprimer toutes les données",
    clearDataDescription:
      "Ceci supprimera définitivement toutes vos données (entrées, stock, paramètres). Cette action ne peut pas être annulée.",
    clearDataButton: "Supprimer les données",
    clearDataConfirm:
      "Êtes-vous absolument sûr ? Cette action va supprimer TOUTES vos données de manière irréversible.",
    clearDataSuccess: "✓ Toutes les données ont été supprimées",
  },

  // Common
  common: {
    cancel: "Annuler",
    confirm: "Confirmer",
    delete: "Supprimer",
    edit: "Modifier",
    close: "Fermer",
    loading: "Chargement...",
    error: "Une erreur s'est produite",
    success: "Succès",
    install: "Installer",
    no: "Non",
    amount: "Montant",
  },

  // Install Banner
  installBanner: {
    title: "Installer MonBusiness",
    subtitle: "Accès rapide et hors ligne",
  },

  // Currency
  currency: {
    format: "CFA",
  },

  // Expense Categories (Phase 2)
  expenseCategories: {
    Stock: "Stock",
    Transport: "Transport",
    Loyer: "Loyer",
    Salaire: "Salaire",
    Internet: "Internet",
    Electricity: "Électricité",
    EpargneMensuelle: "Épargne Mensuelle",
    EpargneQuotidien: "Épargne Quotidienne",
    EpargneHebdomadaire: "Épargne Hebdomadaire",
    Autre: "Autre",
  },

  // Analytics (Phase 2)
  analytics: {
    title: "Mon tableau de bord",
    subtitle: "Découvrez ici l’état de santé de votre business.",
    expenseBreakdown: "Répartition des dépenses",
    topProducts: "Produits les plus vendus",
    categoryName: "Catégorie",
    amount: "Montant",
    percentage: "Pourcentage",
    productName: "Produit",
    unitsSold: "Unités vendues",
    totalRevenue: "Chiffre d'affaires",
    dateFilter: "Filtrer par période",
    today: "Aujourd'hui",
    thisMonth: "Ce mois",
    allTime: "Tout",
    noData: "Aucune donnée",
    noExpenses: "Aucune dépense pour cette période",
    noProducts: "Aucun produit vendu",
  },
};

// Type export for type safety when using translations
export type TranslationType = typeof fr;
