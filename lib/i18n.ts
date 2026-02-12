/**
 * French localization - Main language for the app
 * Easy to add more languages by duplicating this structure
 */

export const fr = {
  // Onboarding
  onboarding: {
    title: 'Bienvenue dans MonBusiness',
    subtitle: 'Suivez votre business en toute simplicité',
    description:
      "Sachez vraiment si votre business gagne de l'argent. Pas de calculs compliqués, pas de paperasse. Juste la vérité sur vos profits.",
    businessNameLabel: 'Nom de votre business',
    businessNamePlaceholder: 'Ex: Salon de coiffure, Boutique, Restaurant...',
    dailyTargetLabel: 'Objectif de profit quotidien (optionnel)',
    dailyTargetPlaceholder: "Laissez vide si vous n'avez pas d'objectif",
    startButton: 'Commencer',
  },

  // Dashboard
  dashboard: {
    greeting: 'Bonjour',
    subtitle: "Voici l'état de votre business",
    todayProfit: "Profit d'aujourd'hui",
    monthlyProfit: 'Profit ce mois',
    healthScore: 'Santé de votre business',
    trendLabel: 'Tendance (7 jours)',
    trendUp: 'En croissance',
    trendDown: 'En baisse',
    trendStable: 'Stable',
    lowStockAlert: 'Stock faible',
    lowStockMessage: 'produit sous le seuil',
    addEntryButton: '+ Ajouter une entrée',
    entriesButton: '📋 Entrées',
    stockButton: '📦 Stock',
    viewAll: 'Voir plus',
    lowStock: 'Stock faible',
  },

  // Entry
  entry: {
    addEntry: 'Ajouter une entrée',
    date: 'Date',
    sales: 'Ventes',
    salesPlaceholder: 'Montant des ventes',
    expenses: 'Dépenses',
    expensesPlaceholder: 'Montant des dépenses',
    profit: 'Profit',
    save: 'Enregistrer',
    today: "Aujourd'hui",
    yesterday: 'Hier',
    entryAlreadyExists: 'Une entrée existe déjà pour cette date',
  },

  // Stock
  stock: {
    inventory: 'Inventaire',
    addProduct: 'Ajouter un produit',
    productName: 'Nom du produit',
    quantity: 'Quantité',
    threshold: "Seuil d'alerte",
    lowStockAlert: 'Stock faible',
    noProducts: 'Aucun produit pour le moment',
    edit: 'Modifier',
    delete: 'Supprimer',
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    entries: 'Entrées',
    stock: 'Stock',
    settings: 'Données',
    loading: 'Chargement...',
  },

  // Health Score Messages
  healthScore: {
    excellent: 'Business florissant',
    good: 'Tendance positive',
    warning: 'À surveiller',
    critical: 'Action requise',
  },

  // Settings
  settings: {
    title: 'Paramètres',
    businessName: 'Nom du business',
    dailyTarget: 'Objectif quotidien',
    exportData: 'Télécharger mes données',
    importData: 'Importer mes données',
    clearAll: 'Tout effacer',
    confirmClear: 'Êtes-vous sûr ? Toutes vos données seront supprimées.',
    dataTitle: 'Données',
    dataSubtitle: 'Sauvegardez et restaurez vos données',
    exportTitle: '💾 Télécharger mes données',
    exportDescription:
      'Créez une sauvegarde de toutes vos données de business. Vous pourrez réimporter ce fichier ultérieurement.',
    importTitle: '📂 Importer mes données',
    importDescription:
      "Restaurez vos données à partir d'une sauvegarde précédente. Vos données actuelles seront remplacées.",
    privacyTitle: '🔒 Votre vie privée',
    privacyPoint1: "✓ Aucune donnée n'est envoyée en ligne",
    privacyPoint2: '✓ Toutes les données restent sur votre appareil',
    privacyPoint3: '✓ Les fichiers de sauvegarde sont stockés localement',
    exportSuccess: '✓ Données téléchargées avec succès',
    exportError: 'Erreur lors du téléchargement',
    importSuccess: '✓ Données importées avec succès',
    importConfirm:
      'Cette action va remplacer toutes vos données actuelles. Êtes-vous sûr ?',
    importError: 'Impossible de sauvegarder les données',
    fileReadError: 'Erreur lors de la lecture du fichier',
    invalidFormat: 'Format de fichier invalide',
  },

  // Common
  common: {
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    loading: 'Chargement...',
    error: "Une erreur s'est produite",
    success: 'Succès',
    install: 'Installer',
    no: 'Non',
  },

  // Install Banner
  installBanner: {
    title: 'Installer MonBusiness',
    subtitle: 'Accès rapide et hors ligne',
  },

  // Currency
  currency: {
    format: 'CFA',
  },
};

// Type export for type safety when using translations
export type TranslationType = typeof fr;
