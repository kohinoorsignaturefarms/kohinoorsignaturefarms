// Centralized API client for Kohinoor Signature Farms
const API_BASE = '/api';

export const api = {
  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.inStock) query.append('inStock', params.inStock);
    if (params.badge) query.append('badge', params.badge);
    
    const url = `${API_BASE}/products${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(productData) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id, productData) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async saveCategory(catData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(catData)
    });
    if (!res.ok) throw new Error('Failed to save category');
    return res.json();
  },

  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return res.json();
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settingsData) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settingsData)
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Admin Auth
  async verifyAdminPin(pin) {
    const res = await fetch(`${API_BASE}/auth/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Invalid PIN');
    }
    return res.json();
  },

  // Admin Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  // Image Upload
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  }
};

// Helper to format currency
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

// Helper to build WhatsApp direct link with formatted message
export const buildWhatsAppUrl = (whatsappNumber, product, variant, storeSettings) => {
  const cleanNumber = (whatsappNumber || storeSettings?.whatsappNumber || '919876543210')
    .replace(/[^0-9]/g, '');

  const mrp = variant?.mrp || 0;
  const selling = variant?.sellingPrice || 0;
  const discountAmount = Math.max(0, mrp - selling);
  const discountPercent = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  
  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/#product-${product.id}` : '';
  const fssaiNo = product.fssaiNumber || storeSettings?.masterFssai || '13624014000889';

  let template = storeSettings?.whatsappTemplate;

  let message = '';
  if (template) {
    message = template
      .replace(/{product_name}/g, product.name || '')
      .replace(/{variant_name}/g, variant?.label || variant?.weight || 'Standard Cut')
      .replace(/{selling_price}/g, selling)
      .replace(/{mrp}/g, mrp)
      .replace(/{discount_percent}/g, discountPercent)
      .replace(/{discount_amount}/g, discountAmount)
      .replace(/{fssai_no}/g, fssaiNo)
      .replace(/{product_url}/g, currentUrl);
  } else {
    message = `🌱 *Order Enquiry - Kohinoor Signature Farms*\n` +
      `────────────────────────\n` +
      `🥩 *Item:* ${product.name}\n` +
      `⚖️ *Weight / Size:* ${variant?.label || variant?.weight || '1 kg'}\n` +
      `💰 *Price:* ₹${selling} (MRP: ~₹${mrp}~ | *${discountPercent}% OFF*)\n` +
      `🏷️ *FSSAI Lic:* ${fssaiNo}\n` +
      `🔗 *Link:* ${currentUrl}\n` +
      `────────────────────────\n` +
      `Hello Kohinoor Farms! I would like to order this fresh farm cut. Please confirm availability and delivery slot.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};
