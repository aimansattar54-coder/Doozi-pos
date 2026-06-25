/* ============================================================
   Doozi POS — Mock Data Store
   ============================================================ */

const DB = {

  settings: {
    businessName: 'Doozi POS',
    currency: 'MVR',
    currencySymbol: 'MVR ',
    taxRate: 8,
    taxName: 'GST',
    address: '123 Main Street, Malé, Maldives',
    phone: '+960 300 0000',
    email: 'store@example.com',
    invoicePrefix: 'INV-',
    receiptFooter: 'Thank you for your business!',
    accountNumber: '',
    accountName: '',
  },

  categories: ['All', 'Food & Drink', 'Electronics', 'Clothing', 'Home', 'Health', 'Other'],

  products: [
    { id: 'P001', name: 'Americano Coffee', category: 'Food & Drink', price: 4.50,  cost: 1.20, stock: 120, minStock: 20, sku: 'FD-001', barcode: '8901234500017', emoji: '☕' },
    { id: 'P002', name: 'Latte',            category: 'Food & Drink', price: 5.50,  cost: 1.50, stock: 80,  minStock: 20, sku: 'FD-002', emoji: '🥛' },
    { id: 'P003', name: 'Green Tea',        category: 'Food & Drink', price: 3.50,  cost: 0.80, stock: 60,  minStock: 15, sku: 'FD-003', emoji: '🍵' },
    { id: 'P004', name: 'Croissant',        category: 'Food & Drink', price: 3.00,  cost: 1.00, stock: 30,  minStock: 10, sku: 'FD-004', emoji: '🥐' },
    { id: 'P005', name: 'Chocolate Muffin', category: 'Food & Drink', price: 3.50,  cost: 1.20, stock: 25,  minStock: 10, sku: 'FD-005', emoji: '🧁' },
    { id: 'P006', name: 'Orange Juice',     category: 'Food & Drink', price: 4.00,  cost: 1.00, stock: 40,  minStock: 10, sku: 'FD-006', emoji: '🍊' },
    { id: 'P007', name: 'Wireless Earbuds', category: 'Electronics',  price: 49.99, cost: 18.00, stock: 15, minStock: 5,  sku: 'EL-001', barcode: '8901234500079', emoji: '🎧' },
    { id: 'P008', name: 'Phone Charger',    category: 'Electronics',  price: 19.99, cost: 6.00,  stock: 30, minStock: 10, sku: 'EL-002', emoji: '🔌' },
    { id: 'P009', name: 'USB-C Cable',      category: 'Electronics',  price: 12.99, cost: 3.50,  stock: 50, minStock: 15, sku: 'EL-003', emoji: '🔋' },
    { id: 'P010', name: 'Smart Watch Band', category: 'Electronics',  price: 24.99, cost: 8.00,  stock: 8,  minStock: 5,  sku: 'EL-004', emoji: '⌚' },
    { id: 'P011', name: 'T-Shirt (White)',  category: 'Clothing',     price: 22.00, cost: 7.00,  stock: 45, minStock: 10, sku: 'CL-001', emoji: '👕',
      variants: [
        { id: 'P011-V1', name: 'Small',  sku: 'CL-001-S',  price: 22.00, cost: 7.00, stock: 12 },
        { id: 'P011-V2', name: 'Medium', sku: 'CL-001-M',  price: 22.00, cost: 7.00, stock: 18 },
        { id: 'P011-V3', name: 'Large',  sku: 'CL-001-L',  price: 22.00, cost: 7.50, stock: 11 },
        { id: 'P011-V4', name: 'X-Large',sku: 'CL-001-XL', price: 24.00, cost: 8.00, stock: 4  },
      ] },
    { id: 'P012', name: 'Denim Jeans',      category: 'Clothing',     price: 59.99, cost: 20.00, stock: 22, minStock: 5,  sku: 'CL-002', emoji: '👖',
      variants: [
        { id: 'P012-V1', name: 'W30', sku: 'CL-002-30', price: 59.99, cost: 20.00, stock: 6 },
        { id: 'P012-V2', name: 'W32', sku: 'CL-002-32', price: 59.99, cost: 20.00, stock: 9 },
        { id: 'P012-V3', name: 'W34', sku: 'CL-002-34', price: 62.99, cost: 21.50, stock: 7 },
      ] },
    { id: 'P013', name: 'Cap / Hat',        category: 'Clothing',     price: 18.00, cost: 5.50,  stock: 35, minStock: 8,  sku: 'CL-003', emoji: '🧢' },
    { id: 'P014', name: 'Scented Candle',   category: 'Home',         price: 16.00, cost: 5.00,  stock: 20, minStock: 5,  sku: 'HM-001', emoji: '🕯️' },
    { id: 'P015', name: 'Hand Sanitizer',   category: 'Health',       price: 6.99,  cost: 1.80,  stock: 3,  minStock: 10, sku: 'HL-001', emoji: '🧴' },
  ],

  customers: [
    { id: 'C001', name: 'Alice Johnson',  email: 'alice@email.com',  phone: '+1 555 111 0001', totalSpent: 842.50, visits: 12 },
    { id: 'C002', name: 'Bob Smith',      email: 'bob@email.com',    phone: '+1 555 111 0002', totalSpent: 319.00, visits: 5  },
    { id: 'C003', name: 'Carol Williams', email: 'carol@email.com',  phone: '+1 555 111 0003', totalSpent: 1240.75, visits: 21 },
    { id: 'C004', name: 'David Lee',      email: 'david@email.com',  phone: '+1 555 111 0004', totalSpent: 78.00,  visits: 2  },
    { id: 'C005', name: 'Eva Martinez',   email: 'eva@email.com',    phone: '+1 555 111 0005', totalSpent: 560.20, visits: 9  },
    { id: 'C006', name: 'Frank Chen',     email: 'frank@email.com',  phone: '+1 555 111 0006', totalSpent: 215.40, visits: 4  },
    { id: 'C007', name: 'Grace Kim',      email: 'grace@email.com',  phone: '+1 555 111 0007', totalSpent: 3420.00, visits: 38 },
    { id: 'C008', name: 'Henry Brown',    email: 'henry@email.com',  phone: '+1 555 111 0008', totalSpent: 145.50, visits: 3  },
  ],

  transactions: [
    { id: 'TXN-1001', date: '2026-06-17', time: '09:14', customer: 'Alice Johnson', items: 3, subtotal: 13.50, tax: 1.35, total: 14.85, payment: 'Cash',   status: 'completed' },
    { id: 'TXN-1002', date: '2026-06-17', time: '10:02', customer: 'Walk-in',       items: 1, subtotal: 49.99, tax: 5.00, total: 54.99, payment: 'Card',   status: 'completed' },
    { id: 'TXN-1003', date: '2026-06-17', time: '11:30', customer: 'Bob Smith',     items: 5, subtotal: 28.00, tax: 2.80, total: 30.80, payment: 'Cash',   status: 'completed' },
    { id: 'TXN-1004', date: '2026-06-17', time: '12:45', customer: 'Carol Williams',items: 2, subtotal: 82.99, tax: 8.30, total: 91.29, payment: 'Card',   status: 'completed' },
    { id: 'TXN-1005', date: '2026-06-17', time: '14:10', customer: 'Walk-in',       items: 4, subtotal: 17.50, tax: 1.75, total: 19.25, payment: 'Cash',   status: 'refunded' },
    { id: 'TXN-1006', date: '2026-06-16', time: '09:55', customer: 'Eva Martinez',  items: 2, subtotal: 8.00,  tax: 0.80, total: 8.80,  payment: 'Cash',   status: 'completed' },
    { id: 'TXN-1007', date: '2026-06-16', time: '13:22', customer: 'Grace Kim',     items: 3, subtotal: 99.97, tax: 10.00,total: 109.97,payment: 'Card',   status: 'completed' },
    { id: 'TXN-1008', date: '2026-06-15', time: '16:40', customer: 'David Lee',     items: 1, subtotal: 22.00, tax: 2.20, total: 24.20, payment: 'Cash',   status: 'completed' },
    { id: 'TXN-1009', date: '2026-06-15', time: '18:05', customer: 'Walk-in',       items: 6, subtotal: 34.50, tax: 3.45, total: 37.95, payment: 'Split',  status: 'completed' },
    { id: 'TXN-1010', date: '2026-06-14', time: '11:00', customer: 'Frank Chen',    items: 2, subtotal: 71.50, tax: 7.15, total: 78.65, payment: 'Card',   status: 'completed' },
    // Today 2026-06-18
    { id: 'TXN-1011', date: '2026-06-18', time: '09:30', customer: 'Alice Johnson', customerName:'Alice Johnson',   items: 2, subtotal: 8.00,  tax: 0.64, total: 8.64,  method:'cash', payment:'Cash',          status:'completed', cartItems:[{id:'P001',name:'Americano Coffee',emoji:'☕',price:4.50,qty:1,cost:1.20},{id:'P003',name:'Green Tea',emoji:'🍵',price:3.50,qty:1,cost:0.80}] },
    { id: 'TXN-1012', date: '2026-06-18', time: '10:15', customer: 'Grace Kim',     customerName:'Grace Kim',       items: 1, subtotal: 49.99, tax: 4.00, total: 53.99, method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[{id:'P007',name:'Wireless Earbuds',emoji:'🎧',price:49.99,qty:1,cost:18.00}] },
    { id: 'TXN-1013', date: '2026-06-18', time: '11:00', customer: 'Bob Smith',     customerName:'Bob Smith',       items: 3, subtotal: 10.00, tax: 0.80, total: 10.80, method:'cash', payment:'Cash',          status:'completed', cartItems:[{id:'P004',name:'Croissant',emoji:'🥐',price:3.00,qty:2,cost:1.00},{id:'P006',name:'Orange Juice',emoji:'🍊',price:4.00,qty:1,cost:1.00}] },
    { id: 'TXN-1014', date: '2026-06-18', time: '13:20', customer: 'Walk-in',       customerName:'Walk-in Customer',items: 2, subtotal: 22.00, tax: 1.76, total: 23.76, method:'cash', payment:'Cash',          status:'completed', orderType:'delivery', deliveryLocation:'Hulhumalé, Lot 11084, Flat 3B', deliveryContact:'+960 777 1234', deliveryStatus:'pending', cartItems:[{id:'P011',name:'T-Shirt (White)',emoji:'👕',price:22.00,qty:1,cost:7.00}] },
    { id: 'TXN-1015', date: '2026-06-18', time: '15:45', customer: 'Carol Williams',customerName:'Carol Williams',  items: 1, subtotal: 59.99, tax: 4.80, total: 64.79, method:'bank', payment:'Bank Transfer',   status:'completed', orderType:'delivery', deliveryLocation:'Malé, Majeedhee Magu, House Velaanaage', deliveryContact:'+960 991 5566', deliveryStatus:'delivered', deliveredAt:'2026-06-18T16:40:00.000Z', cartItems:[{id:'P012',name:'Denim Jeans',emoji:'👖',price:59.99,qty:1,cost:20.00}] },
    // Jan 2026
    { id: 'TXN-2001', date: '2026-01-10', time: '10:00', customer: 'Walk-in',       customerName:'Walk-in Customer',items: 2, subtotal: 25.50, tax: 2.04, total: 27.54, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    { id: 'TXN-2002', date: '2026-01-15', time: '14:00', customer: 'Alice Johnson', customerName:'Alice Johnson',   items: 3, subtotal: 72.00, tax: 5.76, total: 77.76, method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    { id: 'TXN-2003', date: '2026-01-22', time: '11:30', customer: 'Bob Smith',     customerName:'Bob Smith',       items: 1, subtotal: 59.99, tax: 4.80, total: 64.79, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    // Feb 2026
    { id: 'TXN-2004', date: '2026-02-05', time: '09:00', customer: 'Carol Williams',customerName:'Carol Williams',  items: 4, subtotal: 44.00, tax: 3.52, total: 47.52, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    { id: 'TXN-2005', date: '2026-02-14', time: '15:00', customer: 'Grace Kim',     customerName:'Grace Kim',       items: 2, subtotal: 84.00, tax: 6.72, total: 90.72, method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    // Mar 2026
    { id: 'TXN-2006', date: '2026-03-01', time: '10:30', customer: 'Walk-in',       customerName:'Walk-in Customer',items: 5, subtotal: 32.00, tax: 2.56, total: 34.56, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    { id: 'TXN-2007', date: '2026-03-18', time: '13:00', customer: 'Frank Chen',    customerName:'Frank Chen',      items: 3, subtotal: 62.00, tax: 4.96, total: 66.96, method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    { id: 'TXN-2008', date: '2026-03-25', time: '16:00', customer: 'Eva Martinez',  customerName:'Eva Martinez',    items: 2, subtotal: 28.00, tax: 2.24, total: 30.24, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    // Apr 2026
    { id: 'TXN-2009', date: '2026-04-10', time: '11:00', customer: 'David Lee',     customerName:'David Lee',       items: 1, subtotal: 49.99, tax: 4.00, total: 53.99, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    { id: 'TXN-2010', date: '2026-04-20', time: '14:30', customer: 'Alice Johnson', customerName:'Alice Johnson',   items: 4, subtotal: 95.00, tax: 7.60, total: 102.60,method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    { id: 'TXN-2011', date: '2026-04-28', time: '17:00', customer: 'Walk-in',       customerName:'Walk-in Customer',items: 2, subtotal: 18.00, tax: 1.44, total: 19.44, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    // May 2026
    { id: 'TXN-2012', date: '2026-05-05', time: '09:30', customer: 'Grace Kim',     customerName:'Grace Kim',       items: 3, subtotal: 77.00, tax: 6.16, total: 83.16, method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    { id: 'TXN-2013', date: '2026-05-12', time: '12:00', customer: 'Bob Smith',     customerName:'Bob Smith',       items: 2, subtotal: 41.00, tax: 3.28, total: 44.28, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
    { id: 'TXN-2014', date: '2026-05-19', time: '15:00', customer: 'Carol Williams',customerName:'Carol Williams',  items: 5, subtotal: 115.00,tax: 9.20, total: 124.20,method:'bank', payment:'Bank Transfer',   status:'completed', cartItems:[] },
    { id: 'TXN-2015', date: '2026-05-28', time: '16:30', customer: 'Walk-in',       customerName:'Walk-in Customer',items: 1, subtotal: 12.99, tax: 1.04, total: 14.03, method:'cash', payment:'Cash',          status:'completed', cartItems:[] },
  ],

  invoices: [
    { id: 'INV-0001', number: 'INV-0001', date: '2026-06-10', dueDate: '2026-06-24', customer: 'Alice Johnson',  subtotal: 450.00, tax: 45.00,  total: 495.00,  status: 'paid',
      items: [ { name: 'Wireless Earbuds', qty: 9, price: 50.00, amount: 450.00 } ] },
    { id: 'INV-0002', number: 'INV-0002', date: '2026-06-12', dueDate: '2026-06-26', customer: 'Carol Williams', subtotal: 1100.00, tax: 110.00, total: 1210.00, status: 'paid',
      items: [ { name: 'Denim Jeans', qty: 10, price: 60.00, amount: 600.00 }, { name: 'Wireless Earbuds', qty: 10, price: 50.00, amount: 500.00 } ] },
    { id: 'INV-0003', number: 'INV-0003', date: '2026-06-14', dueDate: '2026-06-28', customer: 'Bob Smith',      subtotal: 250.00, tax: 25.00,  total: 275.00,  status: 'pending',
      items: [ { name: 'Phone Charger', qty: 25, price: 10.00, amount: 250.00 } ] },
    { id: 'INV-0004', number: 'INV-0004', date: '2026-06-15', dueDate: '2026-06-22', customer: 'Eva Martinez',   subtotal: 520.00, tax: 52.00,  total: 572.00,  status: 'overdue',
      items: [ { name: 'Smart Watch Band', qty: 20, price: 26.00, amount: 520.00 } ] },
    { id: 'INV-0005', number: 'INV-0005', date: '2026-06-16', dueDate: '2026-06-30', customer: 'Grace Kim',      subtotal: 890.00, tax: 89.00,  total: 979.00,  status: 'pending',
      items: [ { name: 'Wireless Earbuds', qty: 10, price: 50.00, amount: 500.00 }, { name: 'Smart Watch Band', qty: 15, price: 26.00, amount: 390.00 } ] },
    { id: 'INV-0006', number: 'INV-0006', date: '2026-06-17', dueDate: '2026-07-01', customer: 'David Lee',      subtotal: 78.00,  tax: 7.80,   total: 85.80,   status: 'draft',
      items: [ { name: 'USB-C Cable', qty: 6, price: 13.00, amount: 78.00 } ] },
  ],

  expenses: [
    { id: 'EXP-001', date: '2026-06-01', category: 'Rent',       description: 'Monthly store rent',       amount: 2500.00 },
    { id: 'EXP-002', date: '2026-06-01', category: 'Utilities',  description: 'Electricity & Water',      amount: 380.00  },
    { id: 'EXP-003', date: '2026-06-05', category: 'Supplies',   description: 'Packaging materials',      amount: 145.50  },
    { id: 'EXP-004', date: '2026-06-08', category: 'Salaries',   description: 'Staff payroll',            amount: 4200.00 },
    { id: 'EXP-005', date: '2026-06-10', category: 'Marketing',  description: 'Social media ads',         amount: 220.00  },
    { id: 'EXP-006', date: '2026-06-12', category: 'Supplies',   description: 'Cleaning products',        amount: 65.00   },
    { id: 'EXP-007', date: '2026-06-15', category: 'Maintenance',description: 'Equipment servicing',      amount: 180.00  },
  ],

  // Daily revenue for the week chart
  weeklyRevenue: [
    { day: 'Mon', actual: 1240, projected: 1400 },
    { day: 'Tue', actual: 980,  projected: 1200 },
    { day: 'Wed', actual: 1580, projected: 1500 },
    { day: 'Thu', actual: 1120, projected: 1300 },
    { day: 'Fri', actual: 1890, projected: 1700 },
    { day: 'Sat', actual: 2240, projected: 2000 },
    { day: 'Sun', actual: 760,  projected: 900  },
  ],

  monthlyRevenue: [
    { month: 'Jan', revenue: 18400 },
    { month: 'Feb', revenue: 15200 },
    { month: 'Mar', revenue: 22100 },
    { month: 'Apr', revenue: 19800 },
    { month: 'May', revenue: 25600 },
    { month: 'Jun', revenue: 9810  },
  ],

  supplierInvoices: [
    { id: 'SINV-001', date: '2026-06-01', supplier: 'Fresh Beans Co.', reference: 'PO-1001', status: 'received', total: 540.00,
      items: [
        { productId: 'P001', productName: 'Americano Coffee', qty: 100, unitCost: 1.20, total: 120.00 },
        { productId: 'P002', productName: 'Latte', qty: 80,  unitCost: 1.50, total: 120.00 },
        { productId: 'P003', productName: 'Green Tea', qty: 60, unitCost: 0.80, total: 48.00 },
      ]
    },
    { id: 'SINV-002', date: '2026-06-08', supplier: 'TechParts Ltd.', reference: 'PO-1002', status: 'pending', total: 690.00,
      items: [
        { productId: 'P007', productName: 'Wireless Earbuds', qty: 10, unitCost: 18.00, total: 180.00 },
        { productId: 'P008', productName: 'Phone Charger',    qty: 20, unitCost: 6.00,  total: 120.00 },
      ]
    },
  ],
  nextSInvId: 3,

  quotations: [],

  // ── Pre-orders: future orders saved separately from completed sales ──
  // status: 'pending' | 'confirmed' | 'fulfilled' | 'cancelled'
  preOrders: [],
  nextPreId: 1,

  // ── Marketing: promo codes & customer pricing tiers ──────────
  promoCodes: [
    { code: 'SAVE10',    type: 'percent', value: 10, minSpend: 0,  expiry: null,         usageLimit: null, used: 0, active: true },
    { code: 'FLAT5',     type: 'fixed',   value: 5,  minSpend: 0,  expiry: null,         usageLimit: null, used: 0, active: true },
    { code: 'WELCOME15', type: 'percent', value: 15, minSpend: 50, expiry: '2026-12-31', usageLimit: 100,  used: 0, active: true },
  ],
  pricingTiers: [
    { id: 'standard',  name: 'Standard',  discountPct: 0  },
    { id: 'silver',    name: 'Silver',    discountPct: 5  },
    { id: 'gold',      name: 'Gold',      discountPct: 10 },
    { id: 'wholesale', name: 'Wholesale', discountPct: 20 },
  ],

  // Owner-managed advertisements shown on the dashboard (persisted in IndexedDB)
  ads: [],
  nextAdId: 1,

  nextTxnId: 1011,
  nextInvId: 7,
  nextCustId: 9,
  nextExpId: 8,

  /* ── Helpers ───────────────────────────────────────────── */
  // Round money to 2 decimals (cents) to avoid binary float drift.
  money(v) { return Math.round((Number(v) + Number.EPSILON) * 100) / 100; },
  fmt(amount) {
    return `${DB.settings.currencySymbol}${DB.money(amount).toFixed(2)}`;
  },

  // ── Accounting semantics (single source of truth) ───────────
  // Revenue is recognized NET OF TAX. GST/sales tax is collected on behalf of
  // the government — a liability, not income — so it never counts toward
  // revenue, gross profit or net profit. See reports + dashboard.
  COGS_FALLBACK: 0.35,   // assumed cost ratio for legacy rows with no line-item cost
  // All sale figures are NET OF ANY (PARTIAL) REFUND — a partial refund reduces
  // the effective revenue/cost/tax/collected for that sale. Fully-refunded sales
  // (status 'refunded') are excluded from reports entirely.
  // Cost of goods sold for a single sale.
  saleCost(t) {
    const base = (t && t.cost != null && !isNaN(t.cost)) ? Number(t.cost) : (t && t.subtotal || 0) * DB.COGS_FALLBACK;
    return DB.money(base - (t && t.refundedCost || 0));
  },
  // Money actually collected (incl. tax) — what physically hits the drawer/bank.
  saleCollected(t) { return DB.money((t && t.total || 0) - (t && t.refundedAmount || 0)); },
  // Tax collected for this sale (a liability), net of any refunded tax.
  saleTax(t) { return DB.money((t && t.tax || 0) - (t && t.refundedTax || 0)); },
  // Net sales (ex-tax revenue) = collected − tax.
  saleNet(t)  { return DB.money(DB.saleCollected(t) - DB.saleTax(t)); },
  // Gross sales (pre-discount, ex-tax) for a single sale.
  saleGross(t){
    const base = (t && t.subtotal != null) ? Number(t.subtotal) : ((t && t.total || 0) - (t && t.tax || 0) + (t && t.discount || 0));
    return DB.money(base - (t && t.refundedSubtotal || 0));
  },
  getProduct(id)  { return DB.products.find(p => String(p.id) === String(id)); },
  getCustomer(id) { return id == null ? null : DB.customers.find(c => String(c.id) === String(id)); },

  // Resolve a scanned/typed barcode (or SKU) to a sellable. Matches a product's
  // barcode or SKU, and any variant's barcode or SKU. Returns { product, variant?,
  // sellableId } or null.
  findByBarcode(code) {
    const c = String(code || '').trim();
    if (!c) return null;
    for (const p of DB.products) {
      if ((p.barcode && String(p.barcode) === c) || (p.sku && String(p.sku) === c)) return { product: p, sellableId: p.id };
      if (Array.isArray(p.variants)) {
        const v = p.variants.find(v => (v.barcode && String(v.barcode) === c) || (v.sku && String(v.sku) === c));
        if (v) return { product: p, variant: v, sellableId: v.id };
      }
    }
    return null;
  },

  // ── Product variants (size/color/SKU) ───────────────────────
  // A product MAY carry a `variants: [{id,name,sku,price,cost,stock}]` array.
  // When it does, the parent's stock is the SUM of its variants and each
  // variant is the actual sellable unit (its own price, cost & stock).
  hasVariants(p) { return !!(p && Array.isArray(p.variants) && p.variants.length); },
  // Find a variant anywhere by its id → { product, variant } or null.
  getVariant(id) {
    if (id == null) return null;
    const sid = String(id);
    for (const p of DB.products) {
      if (!Array.isArray(p.variants)) continue;
      const v = p.variants.find(x => String(x.id) === sid);
      if (v) return { product: p, variant: v };
    }
    return null;
  },
  // Resolve any id (product OR variant) to a uniform "sellable" view used by
  // the cart and POS. `needsVariant` flags a parent that must be picked first.
  sellable(id) {
    const gv = DB.getVariant(id);
    if (gv) {
      const { product: p, variant: v } = gv;
      return { id: v.id, productId: p.id, isVariant: true, needsVariant: false,
        name: `${p.name} — ${v.name}`, emoji: p.emoji,
        price: v.price != null ? v.price : p.price,
        cost:  v.cost  != null ? v.cost  : p.cost,
        stock: v.stock || 0, sku: v.sku || p.sku, variantName: v.name };
    }
    const p = DB.getProduct(id);
    if (!p) return null;
    if (DB.hasVariants(p)) return { id: p.id, productId: p.id, isVariant: false, needsVariant: true,
      name: p.name, emoji: p.emoji, price: DB.variantMinPrice(p), stock: DB.productStock(p) };
    return { id: p.id, productId: p.id, isVariant: false, needsVariant: false,
      name: p.name, emoji: p.emoji, price: p.price, cost: p.cost, stock: p.stock, sku: p.sku };
  },
  productStock(p)    { return DB.hasVariants(p) ? p.variants.reduce((s,v)=>s+(v.stock||0),0) : (p.stock||0); },
  stockValue(p)      { return DB.hasVariants(p) ? p.variants.reduce((s,v)=>s+((v.cost !=null?v.cost :p.cost )||0)*(v.stock||0),0) : (p.cost ||0)*(p.stock||0); },
  retailValue(p)     { return DB.hasVariants(p) ? p.variants.reduce((s,v)=>s+((v.price!=null?v.price:p.price)||0)*(v.stock||0),0) : (p.price||0)*(p.stock||0); },
  variantMinPrice(p) { return DB.hasVariants(p) ? Math.min(...p.variants.map(v=>v.price!=null?v.price:p.price)) : p.price; },
  // Keep the parent's `stock` mirror in sync with its variants.
  syncParentStock(p) { if (DB.hasVariants(p)) p.stock = DB.productStock(p); return p ? p.stock : 0; },
  // Apply a stock change to a product OR variant id, log it, keep parent synced.
  applyStockDelta(id, delta, type, reason) {
    const gv = DB.getVariant(id);
    if (gv) { gv.variant.stock = Math.max(0, (gv.variant.stock||0) + delta); DB.syncParentStock(gv.product); DB.logStock(id, delta, type, reason); return true; }
    const p = DB.getProduct(id);
    if (p) { p.stock = Math.max(0, (p.stock||0) + delta); DB.logStock(id, delta, type, reason); return true; }
    return false;
  },
  // Normalize a raw payment-method label to a canonical key.
  methodKey(v) {
    const s = String(v || '').toLowerCase();
    if (s.includes('bank')) return 'bank';
    if (s.includes('card')) return 'card';
    if (s.includes('split')) return 'split';
    return 'cash';
  },
  // Pretty label for a method key (for display / receipts).
  methodLabel(key) {
    return { cash:'Cash', card:'Card', bank:'Bank Transfer', split:'Split' }[DB.methodKey(key)] || 'Cash';
  },
  // ── Promo codes ─────────────────────────────────────────────
  findPromo(code) {
    const c = String(code || '').trim().toUpperCase();
    return (DB.promoCodes || []).find(p => p.code.toUpperCase() === c) || null;
  },
  // Validate a code against the current subtotal. Returns {ok, reason, promo, discount}.
  validatePromo(code, subtotal) {
    const promo = DB.findPromo(code);
    if (!promo)          return { ok:false, reason:'Invalid coupon code' };
    if (!promo.active)   return { ok:false, reason:'This code is no longer active' };
    if (promo.expiry && promo.expiry < new Date().toISOString().split('T')[0])
                         return { ok:false, reason:'This code has expired' };
    if (promo.usageLimit != null && (promo.used||0) >= promo.usageLimit)
                         return { ok:false, reason:'This code has reached its usage limit' };
    if (promo.minSpend && subtotal < promo.minSpend)
                         return { ok:false, reason:`Spend ${DB.fmt(promo.minSpend)} to use this code` };
    const discount = promo.type === 'percent'
      ? DB.money(subtotal * (promo.value/100))
      : DB.money(Math.min(promo.value, subtotal));
    return { ok:true, promo, discount };
  },
  addPromo(p) {
    const code = String(p.code||'').trim().toUpperCase();
    DB.promoCodes.unshift({ code, type:p.type||'percent', value:Number(p.value)||0,
      minSpend:Number(p.minSpend)||0, expiry:p.expiry||null,
      usageLimit:p.usageLimit!=null && p.usageLimit!=='' ? Number(p.usageLimit) : null,
      used:0, active:p.active!==false });
    return code;
  },
  deletePromo(code) { DB.promoCodes = DB.promoCodes.filter(p => p.code.toUpperCase() !== String(code).toUpperCase()); },

  // ── Pricing tiers (customer level) ───────────────────────────
  getTier(id) { return (DB.pricingTiers || []).find(t => t.id === id) || null; },
  // The effective tier discount % for a customer (0 if none / standard).
  tierPct(customerId) {
    const c = DB.getCustomer(customerId);
    const t = c && c.tier ? DB.getTier(c.tier) : null;
    return t ? (t.discountPct || 0) : 0;
  },

  nextId(prefix, counter) {
    const n = String(DB[counter]).padStart(4, '0');
    DB[counter]++;
    return `${prefix}${n}`;
  },

  // ── Stock-movement audit log: records every inventory change ──
  stockMoves: [],
  logStock(productId, delta, type, reason) {
    if (!delta) return;
    // Resolve a variant or a plain product for the display name + balance.
    let name, balance;
    const gv = DB.getVariant(productId);
    if (gv) { name = `${gv.product.name} — ${gv.variant.name}`; balance = gv.variant.stock; }
    else { const p = DB.getProduct(productId); name = p ? p.name : String(productId); balance = p ? p.stock : null; }
    const now = new Date();
    DB.stockMoves.unshift({
      id: 'SM-' + Date.now().toString(36) + Math.random().toString(36).slice(2,5),
      ts: now.getTime(),
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0,5),
      productId, productName: name,
      type, delta, balance,
      reason: reason || '',
      user: (typeof App !== 'undefined' && App.user && App.user.name) ? App.user.name : 'System',
    });
    if (DB.stockMoves.length > 500) DB.stockMoves.length = 500;   // cap storage
  },

  addTransaction(txn) {
    const id  = `TXN-${DB.nextTxnId++}`;
    const now = new Date();
    const record = {
      id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0,5),
      // Who rang up the sale (cashier) — defaults to the signed-in user.
      soldBy: (txn && txn.soldBy) || (typeof App !== 'undefined' && App.user && App.user.name) || 'System',
      ...txn,
      status: 'completed',
    };
    // Accounting: round every monetary field to cents.
    ['subtotal','discount','tax','total','cost','cashGiven'].forEach(k => {
      if (record[k] != null) record[k] = DB.money(record[k]);
    });
    // Keep payment-method fields consistent for every downstream consumer.
    if (record.method || record.payment) {
      record.method  = DB.methodKey(record.method || record.payment);
      record.payment = DB.methodLabel(record.method);
    }
    // Pickup/Delivery fulfillment + scheduling. Delivery orders start "pending"
    // and are scheduled for their order date unless the caller specified one.
    if (record.orderType === 'delivery') {
      if (record.deliveryStatus !== 'delivered') record.deliveryStatus = 'pending';
      if (!record.scheduledDate) record.scheduledDate = record.date;
      if (record.deliveredAt === undefined) record.deliveredAt = null;
      if (!Array.isArray(record.postponeLog)) record.postponeLog = [];
    } else {
      record.deliveryStatus = null;
      record.deliveredAt = null;
    }
    // Inventory: single source of truth — decrement stock from the cart.
    // it.id may be a product id or a variant id; applyStockDelta handles both.
    (record.cartItems || []).forEach(it => { DB.applyStockDelta(it.id, -it.qty, 'sale', id); });
    // Marketing: count promo-code redemptions toward any usage limit.
    if (record.promoCode) {
      const promo = DB.findPromo(record.promoCode);
      if (promo) promo.used = (promo.used || 0) + 1;
    }
    // CRM: keep customer lifetime value & visit count in sync.
    if (record.customerId != null) {
      const c = DB.getCustomer(record.customerId);
      if (c) { c.totalSpent = DB.money((c.totalSpent || 0) + record.total); c.visits = (c.visits || 0) + 1; }
    }
    DB.transactions.unshift(record);
    return record;
  },

  // Reverse a sale's side effects (used by refunds). Returns true if applied.
  reverseTransaction(t) {
    if (!t || t.status === 'refunded') return false;
    (t.cartItems || []).forEach(it => { DB.applyStockDelta(it.id, +it.qty, 'refund', t.id); });
    if (t.customerId != null) {
      const c = DB.getCustomer(t.customerId);
      if (c) { c.totalSpent = DB.money(Math.max(0, (c.totalSpent || 0) - t.total)); c.visits = Math.max(0, (c.visits || 0) - 1); }
    }
    t.status = 'refunded';
    return true;
  },

  // ── Partial refunds ──────────────────────────────────────────
  // Refund specific line items/quantities. `lines` = [{ id, qty }]. Restores
  // stock for the refunded quantities only, deducts the refunded value (incl tax)
  // from the customer's lifetime spend, and tracks per-item refundedQty plus
  // cumulative refund totals on the txn (so reports net it out via the sale*
  // helpers). Fully refunding every line flips status to 'refunded'; otherwise
  // 'partial-refund'. Returns { ok, refundedAmount, fully } or { ok:false, reason }.
  refundItems(txnId, lines) {
    const t = DB._findTxn(txnId);
    if (!t || t.status === 'refunded') return { ok: false, reason: 'Already refunded' };
    if (!Array.isArray(t.cartItems) || !t.cartItems.length) return { ok: false, reason: 'No itemized lines' };
    const origNet  = (t.subtotal || 0) - (t.discount || 0);             // ex-tax base tax was charged on
    const effRate  = origNet > 0 ? (t.tax || 0) / origNet : 0;          // this sale's effective tax rate
    const discRate = (t.subtotal || 0) > 0 ? (t.discount || 0) / t.subtotal : 0;
    let refSub = 0, refNet = 0, refTax = 0, refCost = 0, refAmt = 0;
    const logItems = [];
    (lines || []).forEach(ln => {
      const it = t.cartItems.find(c => String(c.id) === String(ln.id));
      if (!it) return;
      const already = it.refundedQty || 0;
      const q = Math.max(0, Math.min(parseInt(ln.qty, 10) || 0, (it.qty || 0) - already));
      if (q <= 0) return;
      const lineSub  = it.price * q;                 // ex-tax, pre-discount
      const lineNet  = lineSub * (1 - discRate);     // ex-tax, after proportional discount
      const lineTax  = lineNet * effRate;            // proportional tax
      const lineCost = (it.cost || 0) * q;
      const lineAmt  = lineNet + lineTax;            // incl tax = money returned
      DB.applyStockDelta(it.id, +q, 'refund', txnId);
      it.refundedQty = already + q;
      refSub += lineSub; refNet += lineNet; refTax += lineTax; refCost += lineCost; refAmt += lineAmt;
      logItems.push({ id: it.id, name: it.name, qty: q, amount: DB.money(lineAmt) });
    });
    if (refAmt <= 0) return { ok: false, reason: 'Nothing to refund' };
    t.refundedSubtotal = DB.money((t.refundedSubtotal || 0) + refSub);
    t.refundedNet      = DB.money((t.refundedNet    || 0) + refNet);
    t.refundedTax      = DB.money((t.refundedTax    || 0) + refTax);
    t.refundedCost     = DB.money((t.refundedCost   || 0) + refCost);
    t.refundedAmount   = DB.money((t.refundedAmount || 0) + refAmt);
    if (!Array.isArray(t.refunds)) t.refunds = [];
    t.refunds.push({ at: new Date().toISOString(),
      by: (typeof App !== 'undefined' && App.user && App.user.name) || 'System',
      amount: DB.money(refAmt), items: logItems });
    if (t.customerId != null) {
      const c = DB.getCustomer(t.customerId);
      if (c) c.totalSpent = DB.money(Math.max(0, (c.totalSpent || 0) - refAmt));
    }
    const fully = t.cartItems.every(it => (it.refundedQty || 0) >= (it.qty || 0));
    t.status = fully ? 'refunded' : 'partial-refund';
    return { ok: true, refundedAmount: DB.money(refAmt), fully };
  },
  // Remaining refundable quantity for a line item.
  refundableQty(it) { return Math.max(0, (it.qty || 0) - (it.refundedQty || 0)); },

  // ── Delivery fulfillment (Orders hub) ────────────────────────
  // These client-side methods stand in for the REST endpoints in the brief:
  //   markDelivered     → PATCH /orders/:id/deliver
  //   postponeDelivery  → PATCH /orders/:id/postpone
  //   queryOrders       → GET   /orders?date=&type=&status=
  // (This app is an offline localStorage front-end; there is no live DB server.)
  _findTxn(id) { return DB.transactions.find(x => String(x.id) === String(id)); },
  markDelivered(id) {
    const t = DB._findTxn(id);
    if (!t || t.orderType !== 'delivery') return null;
    t.deliveryStatus = 'delivered';
    t.deliveredAt = new Date().toISOString();
    return t;
  },
  unmarkDelivered(id) {
    const t = DB._findTxn(id);
    if (!t || t.orderType !== 'delivery') return null;
    t.deliveryStatus = 'pending';
    t.deliveredAt = null;
    return t;
  },
  // Move a pending delivery to the next day; log the carry-over (original → new).
  postponeDelivery(id) {
    const t = DB._findTxn(id);
    if (!t || t.orderType !== 'delivery' || t.deliveryStatus === 'delivered') return null;
    const from = t.scheduledDate || t.date;
    // Add a day via noon-UTC to avoid timezone date rollover.
    const d = new Date(from + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + 1);
    const to = d.toISOString().split('T')[0];
    t.scheduledDate = to;
    t.postponedFrom = from;
    if (!Array.isArray(t.postponeLog)) t.postponeLog = [];
    t.postponeLog.push({ from, to, at: new Date().toISOString() });
    return t;
  },
  // Effective date for the Orders hub & reminders: deliveries use their
  // scheduled date (so postponed orders move forward), pickups use order date.
  orderDate(t) { return (t.orderType === 'delivery' && t.scheduledDate) ? t.scheduledDate : t.date; },
  // Filtered order query (stands in for GET /orders?date&type&status).
  // date: 'today' | 'week' | 'all' · type: 'all'|'delivery'|'pickup' · status: 'all'|'pending'|'delivered'
  queryOrders({ date = 'all', type = 'all', status = 'all' } = {}) {
    const today = new Date().toISOString().split('T')[0];
    // Monday→Sunday window for the current week.
    const now = new Date();
    const dow = (now.getUTCDay() + 6) % 7; // 0 = Monday
    const mon = new Date(now); mon.setUTCDate(now.getUTCDate() - dow);
    const sun = new Date(mon); sun.setUTCDate(mon.getUTCDate() + 6);
    const monStr = mon.toISOString().split('T')[0];
    const sunStr = sun.toISOString().split('T')[0];
    return DB.transactions.filter(t => {
      if (t.status === 'refunded') return false;
      if (type === 'delivery' && t.orderType !== 'delivery') return false;
      if (type === 'pickup'   && t.orderType !== 'pickup')   return false;
      if (status === 'pending'   && !(t.orderType === 'delivery' && t.deliveryStatus === 'pending'))   return false;
      if (status === 'delivered' && !(t.orderType === 'delivery' && t.deliveryStatus === 'delivered')) return false;
      const od = DB.orderDate(t);
      if (date === 'today' && od !== today) return false;
      if (date === 'week'  && (od < monStr || od > sunStr)) return false;
      return true;
    });
  },
  // Pending delivery orders scheduled for a given day (for the daily reminder).
  pendingDeliveriesOn(dateStr) {
    return DB.transactions.filter(t => t.status !== 'refunded' && t.orderType === 'delivery'
      && t.deliveryStatus === 'pending' && DB.orderDate(t) === dateStr);
  },

  // One-time data migration: backfill a consistent schema on seed/legacy rows
  // so reports, costing and the POS all read the same fields safely.
  normalize() {
    DB.transactions.forEach(t => {
      // Payment method (canonical key + display label)
      t.method  = DB.methodKey(t.method || t.payment);
      t.payment = DB.methodLabel(t.method);
      // Customer display name
      if (!t.customerName) t.customerName = t.customer || 'Walk-in Customer';
      // Cashier who rang up the sale. Real sales record this in addTransaction;
      // seed/legacy rows get a deterministic demo cashier so the Staff report has data.
      if (!t.soldBy) {
        const n = parseInt(String(t.id).replace(/\D/g, '')) || 0;
        t.soldBy = ['Admin User', 'Store Manager', 'John Cashier'][n % 3];
      }
      // Status
      if (t.status === 'completed' || t.status === 'refunded') { /* keep */ }
      else t.status = 'completed';
      // Cost of goods sold captured on the transaction
      if (t.cost == null || isNaN(t.cost)) {
        if (Array.isArray(t.cartItems) && t.cartItems.length) {
          t.cost = DB.money(t.cartItems.reduce((s,i) => s + (i.cost || 0) * i.qty, 0));
        } else {
          // No line-item costs on legacy rows — estimate COGS at a typical
          // 35% cost ratio so margins stay realistic instead of NaN.
          t.cost = DB.money(t.subtotal * 0.35);
        }
      } else {
        t.cost = DB.money(t.cost);
      }
      // Round stored money to cents
      ['subtotal','discount','tax','total'].forEach(k => { if (t[k] != null) t[k] = DB.money(t[k]); });
      // Pickup/Delivery: default legacy sales to pickup.
      if (!t.orderType) t.orderType = 'pickup';
      // Delivery fulfillment + scheduling fields.
      if (t.orderType === 'delivery') {
        if (t.deliveryStatus !== 'delivered' && t.deliveryStatus !== 'pending') t.deliveryStatus = 'pending';
        if (!t.scheduledDate) t.scheduledDate = t.date;
        if (t.deliveredAt === undefined) t.deliveredAt = null;
        if (!Array.isArray(t.postponeLog)) t.postponeLog = [];
      } else {
        t.deliveryStatus = null;
        t.deliveredAt = null;
      }
    });

    // Products show a clean letter badge instead of an emoji.
    DB.products.forEach(p => {
      p.emoji = (p.name || '?').trim().charAt(0).toUpperCase();
      if (p.barcode == null) p.barcode = '';   // optional scannable code
    });

    // Variants: backfill a complete schema and derive parent stock from them.
    DB.products.forEach(p => {
      if (!Array.isArray(p.variants) || !p.variants.length) { if (p.variants && !p.variants.length) delete p.variants; return; }
      p.variants.forEach((v, i) => {
        if (!v.id)            v.id    = `${p.id}-V${i+1}`;
        if (!v.name)          v.name  = `Option ${i+1}`;
        if (v.price == null)  v.price = p.price;
        if (v.cost  == null)  v.cost  = p.cost;
        if (v.stock == null)  v.stock = 0;
        if (!v.sku)           v.sku   = `${p.sku || p.id}-${i+1}`;
        v.price = DB.money(v.price); v.cost = DB.money(v.cost); v.stock = Math.max(0, parseInt(v.stock,10) || 0);
      });
      p.stock = DB.productStock(p);   // parent stock is the sum of its variants
    });
    DB.transactions.forEach(t => { (t.cartItems || []).forEach(it => { it.emoji = (it.name || '?').trim().charAt(0).toUpperCase(); }); });

    // Invoices: guarantee number, money fields and at least one line item.
    DB.invoices.forEach(inv => {
      if (!inv.number) inv.number = (typeof inv.id === 'string' && inv.id.startsWith('INV')) ? inv.id : `INV-${String(inv.id).padStart(4,'0')}`;
      if (typeof inv.id !== 'string') inv.id = inv.number;   // standardize id to the invoice number
      const subtotal = inv.subtotal != null ? inv.subtotal : (inv.amount || 0);
      inv.subtotal = DB.money(subtotal);
      inv.tax      = DB.money(inv.tax != null ? inv.tax : subtotal * (DB.settings.taxRate/100));
      inv.total    = DB.money(inv.total != null ? inv.total : inv.subtotal + inv.tax);
      if (!Array.isArray(inv.items) || !inv.items.length) {
        inv.items = [{ name: 'Goods & Services', qty: 1, price: inv.subtotal, amount: inv.subtotal }];
      }
    });

    // Resync ID counters from existing data so generated IDs never collide.
    const maxNum = (arr, re) => arr.reduce((m,x) => {
      const s = String(x.id || x.number || '');
      const mt = re.exec(s);
      return mt ? Math.max(m, parseInt(mt[1], 10)) : m;
    }, 0);
    DB.nextTxnId  = Math.max(DB.nextTxnId  || 0, maxNum(DB.transactions,     /TXN-(\d+)/) + 1);
    DB.nextInvId  = Math.max(DB.nextInvId  || 0, maxNum(DB.invoices,         /INV-0*(\d+)/) + 1);
    DB.nextCustId = Math.max(DB.nextCustId || 0, maxNum(DB.customers,        /C0*(\d+)/) + 1);
    DB.nextExpId  = Math.max(DB.nextExpId  || 0, maxNum(DB.expenses,         /EXP-0*(\d+)/) + 1);
    DB.nextSInvId = Math.max(DB.nextSInvId || 0, maxNum(DB.supplierInvoices, /SINV-0*(\d+)/) + 1);

    // Marketing arrays may be missing on DBs persisted before this feature.
    if (!Array.isArray(DB.promoCodes))   DB.promoCodes = [];
    if (!Array.isArray(DB.pricingTiers)) DB.pricingTiers = [];

    // Pre-orders: ensure array + resync id counter so generated ids never collide.
    if (!Array.isArray(DB.preOrders)) DB.preOrders = [];
    DB.nextPreId = Math.max(DB.nextPreId || 1, DB.preOrders.reduce((m,p) => {
      const mt = /PRE-0*(\d+)/.exec(String(p.id||'')); return mt ? Math.max(m, parseInt(mt[1],10)+1) : m;
    }, 1));

    // Customers: backfill the schema added with the Customers management feature.
    DB.customers.forEach(c => {
      if (c.is_active === undefined) c.is_active = true;
      if (c.address == null) c.address = '';
      if (c.notes   == null) c.notes   = '';
      if (!c.createdAt) c.createdAt = null;
    });

    DB._normalized = true;
  },

  addExpense(exp) {
    const id = `EXP-${String(DB.nextExpId++).padStart(3,'0')}`;
    DB.expenses.unshift({ id, ...exp });
    return id;
  },

  addInvoice(inv) {
    const number = `INV-${String(DB.nextInvId++).padStart(4,'0')}`;
    const now    = new Date().toISOString().split('T')[0];
    const subtotal = DB.money(inv.subtotal != null ? inv.subtotal : (inv.amount || 0));
    const tax      = DB.money(inv.tax != null ? inv.tax : subtotal * (DB.settings.taxRate/100));
    const total    = DB.money(inv.total != null ? inv.total : subtotal + tax);
    const record = { id: number, number, date: now, ...inv, subtotal, tax, total };
    DB.invoices.unshift(record);
    return number;
  },

  // ── Pre-orders ───────────────────────────────────────────────
  addPreOrder(po) {
    const id  = `PRE-${String(DB.nextPreId++).padStart(4,'0')}`;
    const now = new Date();
    const record = {
      id,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0,5),
      status: 'pending',
      ...po,
    };
    ['subtotal','discount','tax','total','cost'].forEach(k => { if (record[k] != null) record[k] = DB.money(record[k]); });
    if (record.method || record.payment) {
      record.method  = DB.methodKey(record.method || record.payment);
      record.payment = DB.methodLabel(record.method);
    }
    DB.preOrders.unshift(record);
    return record;
  },
  getPreOrder(id) { return (DB.preOrders || []).find(p => String(p.id) === String(id)); },
  setPreOrderStatus(id, status) {
    const po = DB.getPreOrder(id);
    if (po) po.status = status;
    return po;
  },
  // Turn a pre-order into a real completed sale (decrements stock via addTransaction).
  fulfillPreOrder(id) {
    const po = DB.getPreOrder(id);
    if (!po || po.status === 'fulfilled' || po.status === 'cancelled') return null;
    const txn = DB.addTransaction({
      items: (po.cartItems || []).reduce((s,i) => s + i.qty, 0),
      subtotal: po.subtotal, discount: po.discount || 0, tax: po.tax, total: po.total,
      cost: (po.cartItems || []).reduce((s,i) => s + (i.cost||0)*i.qty, 0),
      method: po.method || 'cash',
      customerId: po.customerId || null,
      customerName: po.customerName || 'Walk-in Customer',
      orderType: po.orderType || 'pickup',
      deliveryLocation: po.deliveryLocation || '',
      deliveryContact: po.deliveryContact || '',
      fromPreOrder: po.id,
      cartItems: (po.cartItems || []).map(i => ({ ...i })),
    });
    po.status = 'fulfilled';
    po.fulfilledTxnId = txn.id;
    return txn;
  },

  // POST /customers — create a customer (id, name, phone, email, address, notes,
  // is_active, createdAt). New optional fields default to empty/active.
  addCustomer(cust) {
    const id = `C${String(DB.nextCustId++).padStart(3, '0')}`;
    DB.customers.push({ id, totalSpent: 0, visits: 0, address: '', notes: '', is_active: true,
      createdAt: new Date().toISOString(), ...cust });
    return id;
  },
  // True if any sale or pre-order is linked to this customer (blocks hard delete).
  customerHasOrders(id) {
    const c = DB.getCustomer(id);
    const nameMatch = t => c && (t.customerName === c.name || t.customer === c.name);
    return DB.transactions.some(t => String(t.customerId) === String(id) || nameMatch(t))
      || (DB.preOrders || []).some(p => String(p.customerId) === String(id) || (c && p.customerName === c.name));
  },
  // DELETE /customers/:id — soft delete (archive) when orders exist, else hard delete.
  // Returns { ok, archived }.
  deleteCustomer(id) {
    const c = DB.getCustomer(id);
    if (!c) return { ok: false };
    if (DB.customerHasOrders(id)) { c.is_active = false; return { ok: true, archived: true }; }
    DB.customers = DB.customers.filter(x => String(x.id) !== String(id));
    return { ok: true, archived: false };
  },
  // GET /customers?q= — active customers, optional fuzzy search on name/phone/email.
  searchCustomers(q) {
    const s = String(q || '').toLowerCase().trim();
    return DB.customers.filter(c => c.is_active !== false && (!s ||
      (c.name || '').toLowerCase().includes(s) ||
      (c.phone || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)));
  },

  nextQuoteId() {
    return 'QT-' + String(DB.quotations.length + 1).padStart(4, '0');
  },

  // Ads are persisted in IndexedDB (see adsInit/adsPut in app.js) so any file
  // size can be stored permanently. These just manage the in-memory array.
  addAd(ad) {
    const rec = { id: 'AD-' + (DB.nextAdId++), ...ad };
    DB.ads.push(rec);
    return rec;
  },
  deleteAd(id) {
    DB.ads = DB.ads.filter(a => a.id !== id);
  },

  // ── Persistence: keep all business data across reloads + optional cloud sync ──
  _persistKeys: ['settings','categories','products','customers','transactions','invoices','expenses','supplierInvoices','quotations','stockMoves','promoCodes','pricingTiers','preOrders'],
  // Sync metadata: updatedAt is a last-write-wins clock used to reconcile with the cloud.
  _meta: { updatedAt: 0 },
  // Build a full, serializable snapshot of all business data.
  snapshot() {
    const data = { counters: { nextTxnId:DB.nextTxnId, nextInvId:DB.nextInvId, nextCustId:DB.nextCustId, nextExpId:DB.nextExpId, nextSInvId:DB.nextSInvId, nextPreId:DB.nextPreId }, _meta: DB._meta };
    DB._persistKeys.forEach(k => { data[k] = DB[k]; });
    return data;
  },
  // Load all business data from a snapshot object (used by load() and cloud pull).
  applySnapshot(d) {
    if (!d) return false;
    if (d.settings) Object.assign(DB.settings, d.settings);
    DB._persistKeys.forEach(k => { if (k !== 'settings' && d[k] !== undefined) DB[k] = d[k]; });
    if (d.counters) Object.assign(DB, d.counters);
    if (d._meta) DB._meta = d._meta;
    return true;
  },
  save(opts) {
    try {
      // Bump the clock unless we're persisting data we just pulled from the cloud.
      if (!opts || !opts.fromCloud) DB._meta = { ...DB._meta, updatedAt: Date.now() };
      localStorage.setItem('doozi_db', JSON.stringify(DB.snapshot()));
      // Mirror to the cloud backup server (no-op if Cloud isn't loaded / disabled).
      if (!(opts && opts.fromCloud) && typeof Cloud !== 'undefined' && Cloud.schedulePush) Cloud.schedulePush();
      return true;
    } catch (e) { return false; }
  },
  load() {
    try {
      const raw = localStorage.getItem('doozi_db');
      if (!raw) return false;
      return DB.applySnapshot(JSON.parse(raw));
    } catch (e) { return false; }
  },
};

// Restore any saved data first, then normalize so every screen reads a consistent schema.
DB.load();
DB.normalize();
// Remember the clock as it was on disk at load time. The cloud uses THIS (not a
// value mutated by saves that happen during startup) to decide push vs. pull.
DB._loadedUpdatedAt = (DB._meta && DB._meta.updatedAt) || 0;
