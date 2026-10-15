export const INITIAL_CATEGORIES = [
  "Data Cables",
  "Chargers & Adapters",
  "Earbuds & TWS",
  "Handsfree & Earphones",
  "Headphones",
  "Power Banks",
  "Mobile Covers & Cases",
  "Screen & Glass Protectors",
  "Phone Holders & Stands",
  "OTG & Connectors",
  "Memory Cards & USB Drives",
  "Speakers",
  "Other Mobile Accessories"
];

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Samsung 25W Type-C Fast Charger",
    sku: "CHG-SAM-25W",
    category: "Chargers & Adapters",
    brand: "Samsung",
    model: "Type-C Devices",
    purchasePrice: 1200,
    sellingPrice: 1800,
    stockQuantity: 18,
    minStockLevel: 5,
    supplier: "Lahore Wholesale Market"
  },
  {
    id: 2,
    name: "Ronin R-9 TWS Earbuds",
    sku: "EAR-RON-R9",
    category: "Earbuds & TWS",
    brand: "Ronin",
    model: "Universal Bluetooth",
    purchasePrice: 2800,
    sellingPrice: 3950,
    stockQuantity: 8,
    minStockLevel: 3,
    supplier: "Local Mobile Plaza Shop #12"
  },
  {
    id: 3,
    name: "Infinix Hot 30 9D Glass Protector",
    sku: "GLS-INF-H30",
    category: "Screen & Glass Protectors",
    brand: "Generic 9D",
    model: "Infinix Hot 30",
    purchasePrice: 60,
    sellingPrice: 250,
    stockQuantity: 35,
    minStockLevel: 10,
    supplier: "Direct Local Import"
  },
  {
    id: 4,
    name: "Faster 10000mAh Power Bank (PB-60)",
    sku: "PWR-FAS-10K",
    category: "Power Banks",
    brand: "Faster",
    model: "Universal Fast Charge",
    purchasePrice: 2100,
    sellingPrice: 3200,
    stockQuantity: 2,
    minStockLevel: 4,
    supplier: "Local Partner Shop"
  },
  {
    id: 5,
    name: "Redmi Note 12 Silicone Matte Case (Black)",
    sku: "COV-RDM-N12",
    category: "Mobile Covers & Cases",
    brand: "Silicone Premium",
    model: "Redmi Note 12",
    purchasePrice: 120,
    sellingPrice: 400,
    stockQuantity: 12,
    minStockLevel: 5,
    supplier: "Karachi Accessories Hub"
  }
];

export const INITIAL_EXPENSES = [
  { id: 101, title: "Shop Monthly Rent", category: "Rent", amount: 25000, date: "2026-03-01", description: "March 2026 Shop Rent" },
  { id: 102, title: "Electricity Bill", category: "Utilities", amount: 6400, date: "2026-03-05", description: "WAPDA Bill Payment" },
  { id: 103, title: "Shop Tea & Refreshment", category: "Tea & Refreshment", amount: 1200, date: "2026-03-10", description: "Weekly tea bill for staff/guests" },
  { id: 104, title: "Transport / Freight", category: "Transport", amount: 1500, date: "2026-03-12", description: "Cargo charges for stock from Lahore" }
];

export const INITIAL_SALES = [
  {
    id: "INV-2026-101",
    date: "2026-03-14 11:30 AM",
    customerName: "Walk-in Customer",
    items: [
      { id: 1, name: "Samsung 25W Type-C Fast Charger", price: 1800, qty: 1, cost: 1200 }
    ],
    subtotal: 1800,
    discount: 50,
    total: 1750,
    profit: 500,
    paymentMethod: "Cash"
  },
  {
    id: "INV-2026-102",
    date: "2026-03-14 03:15 PM",
    customerName: "Ali Raza",
    items: [
      { id: 3, name: "Infinix Hot 30 9D Glass Protector", price: 250, qty: 2, cost: 60 },
      { id: 5, name: "Redmi Note 12 Silicone Matte Case (Black)", price: 400, qty: 1, cost: 120 }
    ],
    subtotal: 900,
    discount: 0,
    total: 900,
    profit: 660,
    paymentMethod: "Easypaisa"
  }
];
