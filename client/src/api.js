// Centralized API client for Kohinoor Signature Farms
const API_BASE = '/api';

// Anonymous visitor fingerprint (localStorage, no login required)
export const getOrCreateVisitorId = () => {
  try {
    let vid = localStorage.getItem('ksf_vid');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
      localStorage.setItem('ksf_vid', vid);
    }
    return vid;
  } catch (e) {
    return 'v_anon_' + Math.random().toString(36).slice(2, 8);
  }
};

export const api = {
  // Bootstrap: unified single fetch for catalog, categories, settings, locations
  async getBootstrap(options = {}) {
    const url = options.bypassCache ? `${API_BASE}/bootstrap?t=${Date.now()}` : `${API_BASE}/bootstrap`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch bootstrap data');
    return res.json();
  },

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

  // Delivery Locations (Gated Communities) API
  async getLocations() {
    try {
      const res = await fetch(`${API_BASE}/locations`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch (e) {}
    try {
      const settings = await this.getSettings();
      if (Array.isArray(settings?.deliveryLocations)) return settings.deliveryLocations;
    } catch (e) {}
    return [];
  },

  async saveLocation(locationData) {
    const isEdit = Boolean(locationData.id);
    const url = isEdit ? `${API_BASE}/locations/${locationData.id}` : `${API_BASE}/locations`;
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData)
      });
      if (res.ok) return res.json();
    } catch (e) {}
    // Fallback: update via settings if standalone endpoint not reachable
    const settings = await this.getSettings().catch(() => ({}));
    const currentList = Array.isArray(settings.deliveryLocations) ? settings.deliveryLocations : [];
    let updatedList;
    if (isEdit) {
      updatedList = currentList.map((l) => (l.id === locationData.id ? { ...l, ...locationData } : l));
    } else {
      const newLoc = { ...locationData, id: locationData.id || 'loc-' + Date.now() };
      updatedList = [...currentList, newLoc];
    }
    await this.updateSettings({ ...settings, deliveryLocations: updatedList });
    return { success: true, location: locationData, locations: updatedList };
  },

  async deleteLocation(locationId) {
    try {
      const res = await fetch(`${API_BASE}/locations/${locationId}`, {
        method: 'DELETE'
      });
      if (res.ok) return res.json();
    } catch (e) {}
    // Fallback: delete via settings
    const settings = await this.getSettings().catch(() => ({}));
    const currentList = Array.isArray(settings.deliveryLocations) ? settings.deliveryLocations : [];
    const updatedList = currentList.filter((l) => l.id !== locationId);
    await this.updateSettings({ ...settings, deliveryLocations: updatedList });
    return { success: true, locations: updatedList };
  },

  async toggleLocation(locationId) {
    try {
      const res = await fetch(`${API_BASE}/locations/${locationId}/toggle`, {
        method: 'PATCH'
      });
      if (res.ok) return res.json();
    } catch (e) {}
    // Fallback: toggle via settings
    const settings = await this.getSettings().catch(() => ({}));
    const currentList = Array.isArray(settings.deliveryLocations) ? settings.deliveryLocations : [];
    const updatedList = currentList.map((l) => (l.id === locationId ? { ...l, active: !l.active } : l));
    await this.updateSettings({ ...settings, deliveryLocations: updatedList });
    return { success: true, locations: updatedList };
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

  // Image Upload (direct to Supabase Storage CDN)
  async uploadImage(file, folder = 'products') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const res = await fetch(`${API_BASE}/upload?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Image upload failed');
    return res.json();
  },

  // ─── Analytics & Order Tracking ───────────────────────────────────────────

  // Track buy/cart click (fire-and-forget, never throws)
  trackClick(product, variant, eventType = 'buy_click') {
    try {
      const visitorId = getOrCreateVisitorId();
      const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
      const payload = JSON.stringify({
        visitor_id: visitorId,
        product_id: product.id,
        product_name: product.name,
        category: product.category || '',
        variant_label: variant?.label || variant?.weight || '',
        selling_price: variant?.sellingPrice || 0,
        event_type: eventType,
        device
      });
      // Use sendBeacon for non-blocking fire-and-forget
      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE}/track/click`, blob);
      } else {
        fetch(`${API_BASE}/track/click`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true }).catch(() => {});
      }
    } catch (e) {
      // Never block customer action
    }
  },

  // Track WhatsApp order (returns order_ref)
  async trackOrder(cartItems, totalAmount) {
    try {
      const visitorId = getOrCreateVisitorId();
      const items = cartItems.map(item => ({
        product_id: item.productId,
        name: item.name,
        variant_label: item.variantLabel || item.weight || '',
        qty: item.quantity || 1,
        selling_price: item.sellingPrice || 0,
        subtotal: (item.sellingPrice || 0) * (item.quantity || 1)
      }));
      const res = await fetch(`${API_BASE}/track/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          items,
          total_amount: totalAmount,
          total_items: cartItems.reduce((s, i) => s + (i.quantity || 1), 0)
        })
      });
      if (res.ok) return res.json();
    } catch (e) {
      // Silent — never block WhatsApp
    }
    return null;
  },

  // Get analytics for admin panel
  async getAnalytics(period = 'week') {
    try {
      const res = await fetch(`${API_BASE}/analytics?period=${period}`);
      if (!res.ok) return { totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, topProducts: [], eventBreakdown: {} };
      const data = await res.json();
      return data || { totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, topProducts: [], eventBreakdown: {} };
    } catch (e) {
      return { totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, topProducts: [], eventBreakdown: {} };
    }
  },

  // Get all orders for admin panel
  async getOrders(status = 'all') {
    try {
      const url = status && status !== 'all' ? `${API_BASE}/orders?status=${status}` : `${API_BASE}/orders`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  // Update order status from admin panel
  async updateOrderStatus(id, status, note) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    });
    if (!res.ok) throw new Error('Failed to update order');
    return res.json();
  },

  // Delete order from admin panel
  async deleteOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete order');
    return res.json();
  }
};

// Helper to format currency
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '₹0';
  return `₹${num.toLocaleString('en-IN')}`;
};

// Default Fallback Gated Communities (Empty by default, managed via Admin Panel)
export const DEFAULT_DELIVERY_LOCATIONS = [];

// Default Official Social Media Handles
export const DEFAULT_SOCIAL_LINKS = {
  instagram: 'https://instagram.com/kohinoorsignaturefarms',
  x: 'https://x.com/kohinoorfarms',
  facebook: 'https://facebook.com/kohinoorsignaturefarms',
  youtube: 'https://youtube.com/@kohinoorsignaturefarms'
};

// Helper to build WhatsApp direct link with formatted message and selected delivery community
export const buildWhatsAppUrl = (whatsappNumber, product, variant, storeSettings, selectedLocation = null) => {
  const cleanNumber = (whatsappNumber || storeSettings?.whatsappNumber || '919876543210')
    .replace(/[^0-9]/g, '');

  const mrp = variant?.mrp || 0;
  const selling = variant?.sellingPrice || 0;
  const discountAmount = Math.max(0, mrp - selling);
  const discountPercent = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;
  
  const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/#product-${product.id}` : '';
  const fssaiNo = product.fssaiNumber || storeSettings?.masterFssai || '13624014000889';

  const locationLine = selectedLocation?.name 
    ? `* 📍 Delivery Location: *${selectedLocation.name}*${selectedLocation.area ? ` (${selectedLocation.area})` : ''}\n` 
    : '';

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
    if (locationLine) {
      message = locationLine + message;
    }
  } else {
    message = `*ORDER ENQUIRY - KOHINOOR SIGNATURE FARMS*\n` +
      `----------------------------------------\n` +
      `* Item: ${product.name}\n` +
      `* Weight / Size: ${variant?.label || variant?.weight || '1 kg'}\n` +
      `* Price: Rs. ${selling} (MRP: Rs. ${mrp} | ${discountPercent}% OFF)\n` +
      (locationLine ? locationLine : '') +
      `* Product Link: ${currentUrl}\n` +
      `----------------------------------------\n` +
      `Hello Kohinoor Farms team! I would like to place an order for ${selectedLocation?.name ? `delivery to *${selectedLocation.name}*` : 'this fresh cut'}. Please confirm availability and morning slot.`;
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

// Helper to build multi-item WhatsApp direct link from Cart with delivery community
export const buildCartWhatsAppUrl = (whatsappNumber, cartItems, storeSettings, selectedLocation = null) => {
  const cleanNumber = (whatsappNumber || storeSettings?.whatsappNumber || '919876543210')
    .replace(/[^0-9]/g, '');

  if (!cartItems || cartItems.length === 0) {
    return `https://wa.me/${cleanNumber}`;
  }

  const totalItemsCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalSelling = cartItems.reduce((sum, item) => sum + (item.sellingPrice * (item.quantity || 1)), 0);
  const totalMrp = cartItems.reduce((sum, item) => sum + ((item.mrp || item.sellingPrice) * (item.quantity || 1)), 0);
  const totalSavings = Math.max(0, totalMrp - totalSelling);

  let itemsListText = '';
  cartItems.forEach((item, index) => {
    const itemSubtotal = item.sellingPrice * item.quantity;
    const itemMrpSubtotal = (item.mrp || item.sellingPrice) * item.quantity;
    const itemSavings = Math.max(0, itemMrpSubtotal - itemSubtotal);
    const weightLabel = item.variantLabel || item.weight || 'Standard Cut';
    const netWeightInfo = item.netWeight ? ` (Net: ${item.netWeight})` : '';

    itemsListText += `${index + 1}. *${item.name}*\n` +
      `   - Size: ${weightLabel}${netWeightInfo}\n` +
      `   - Qty: ${item.quantity} x Rs. ${item.sellingPrice} = *Rs. ${itemSubtotal.toLocaleString('en-IN')}*` +
      (itemSavings > 0 ? ` (Saved Rs. ${itemSavings.toLocaleString('en-IN')})` : '') +
      `\n\n`;
  });

  const locationSection = selectedLocation?.name 
    ? `* 📍 Delivering To: *${selectedLocation.name}*${selectedLocation.area ? ` (${selectedLocation.area})` : ''}\n` +
      (selectedLocation.deliverySlot ? `* ⏰ Delivery Schedule: ${selectedLocation.deliverySlot}\n` : '') +
      `----------------------------------------\n`
    : '';

  const message = `*NEW FARM BASKET ORDER - KOHINOOR SIGNATURE FARMS*\n` +
    `----------------------------------------\n` +
    (locationSection ? locationSection : '') +
    `*ORDER SUMMARY (${totalItemsCount} ${totalItemsCount === 1 ? 'Item' : 'Items'}):*\n\n` +
    itemsListText +
    `----------------------------------------\n` +
    `* Total Bill: *Rs. ${totalSelling.toLocaleString('en-IN')}*\n` +
    (totalSavings > 0 ? `* Total Savings: *Rs. ${totalSavings.toLocaleString('en-IN')}*\n` : '') +
    `----------------------------------------\n` +
    `Hello Kohinoor Farms team! Please confirm availability for my basket and dispatch to ${selectedLocation?.name ? `*${selectedLocation.name}*` : 'my gated community'}.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
};

