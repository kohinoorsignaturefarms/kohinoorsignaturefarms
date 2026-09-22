import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Data and Public directories with serverless resilience
let DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  const cwdData = path.join(process.cwd(), 'server', 'data');
  if (fs.existsSync(cwdData)) {
    DATA_DIR = cwdData;
  }
}

const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// Ensure directories exist safely (without crashing on read-only serverless filesystems)
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (e) {
  // Ignored in read-only serverless environment
}

// Copy official logo from root if not already present
const rootLogoPath = path.join(__dirname, '..', 'WhatsApp Image 2026-08-13 at 18.16.46.jpeg');
const publicLogoPath = path.join(PUBLIC_DIR, 'logo.jpeg');
if (fs.existsSync(rootLogoPath) && !fs.existsSync(publicLogoPath)) {
  try {
    fs.copyFileSync(rootLogoPath, publicLogoPath);
  } catch (e) {
    // ignore
  }
}

// Multer storage setup for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'ksf-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use('/public', express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Helper functions for reading & writing JSON
const readData = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return null;
  }
};

const writeData = (filename, data) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn(`Note: File persistence skipped on read-only serverless environment for ${filename}:`, err.message);
    return true;
  }
};

import { createClient } from '@supabase/supabase-js';

// Supabase Cloud Configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://ifhjqtysuyhgpqjwxudf.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_publishable_pkSzcrZ1o0f3tYPqEhkUnA_3jIIKvUc';

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('⚡ Connected to Supabase Cloud Database');
  } catch (e) {
    console.warn('⚠️ Could not initialize Supabase client:', e.message);
  }
}

// In-memory cache for ultra-fast response times (<1ms)
const memoryCache = new Map();

// Helper functions for reading & writing JSON with Supabase Cloud Sync
const getStoreData = async (key) => {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // 1. Query Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('ksf_store')
        .select('data')
        .eq('key', key)
        .single();

      if (!error && data && data.data) {
        memoryCache.set(key, data.data);
        return data.data;
      }
    } catch (err) {
      // Graceful fallback to local JSON
    }
  }

  // 2. Fallback to local JSON file
  const localData = readData(`${key}.json`);
  if (localData !== null) {
    memoryCache.set(key, localData);
    if (supabase) {
      supabase
        .from('ksf_store')
        .upsert({ key, data: localData, updated_at: new Date().toISOString() })
        .then(
          () => {},
          (err) => {}
        );
    }
  }
  return localData;
};

const setStoreData = async (key, data) => {
  memoryCache.set(key, data);
  writeData(`${key}.json`, data);

  if (supabase) {
    try {
      const res = await supabase
        .from('ksf_store')
        .upsert({ key, data, updated_at: new Date().toISOString() });
      if (res?.error) {
        console.warn(`Supabase upsert note for ${key}:`, res.error.message);
      }
    } catch (err) {
      console.warn(`Supabase sync note for ${key}:`, err.message);
    }
  }
  return true;
};

// ------------------------------------
// API ROUTES
// ------------------------------------

// 1. SETTINGS API
app.get('/api/settings', async (req, res) => {
  const settings = (await getStoreData('settings')) || {};
  const locations = await getStoreData('delivery_locations');
  if (Array.isArray(locations) && locations.length > 0) {
    settings.deliveryLocations = locations;
  }
  // Don't expose plain admin PIN directly in public response, send hasPin boolean or pin in admin mode
  const { adminPin, ...safeSettings } = settings;
  res.json({ ...safeSettings, hasCustomPin: Boolean(adminPin) });
});

app.put('/api/settings', async (req, res) => {
  const currentSettings = (await getStoreData('settings')) || {};
  const updatedSettings = {
    ...currentSettings,
    ...req.body
  };
  await setStoreData('settings', updatedSettings);
  if (Array.isArray(req.body.deliveryLocations)) {
    await setStoreData('delivery_locations', req.body.deliveryLocations);
    writeData('locations.json', req.body.deliveryLocations);
  }
  res.json({ success: true, message: 'Settings updated successfully', settings: updatedSettings });
});

// Verify Admin PIN
app.post('/api/auth/verify-pin', async (req, res) => {
  const { pin } = req.body;
  const settings = (await getStoreData('settings')) || {};
  const expectedPin = settings.adminPin || 'goateggs';
  if (pin === expectedPin) {
    res.json({ success: true, token: 'ksf-admin-auth-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Password. Please try again.' });
  }
});

// 2. CATEGORIES API
app.get('/api/categories', async (req, res) => {
  const categories = (await getStoreData('categories')) || [];
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const categories = (await getStoreData('categories')) || [];
  const newCat = {
    id: req.body.id || 'cat-' + Date.now(),
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: req.body.name,
    tagline: req.body.tagline || '',
    icon: req.body.icon || '🥩',
    badge: req.body.badge || '',
    accentColor: req.body.accentColor || '#0B3B24',
    image: req.body.image || '',
    description: req.body.description || ''
  };

  const existingIdx = categories.findIndex((c) => c.id === newCat.id || c.slug === newCat.slug);
  if (existingIdx >= 0) {
    categories[existingIdx] = { ...categories[existingIdx], ...newCat };
  } else {
    categories.push(newCat);
  }

  await setStoreData('categories', categories);
  res.json({ success: true, category: newCat });
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  let categories = (await getStoreData('categories')) || [];
  categories = categories.filter((c) => c.id !== id && c.slug !== id);
  await setStoreData('categories', categories);
  res.json({ success: true, message: 'Category deleted' });
});

// ------------------------------------
// 2.5 DELIVERY LOCATIONS (GATED COMMUNITIES) API
// ------------------------------------
const getDeliveryLocationsData = async () => {
  let locations = await getStoreData('delivery_locations');
  if (!Array.isArray(locations) || locations.length === 0) {
    const settings = (await getStoreData('settings')) || {};
    if (Array.isArray(settings.deliveryLocations) && settings.deliveryLocations.length > 0) {
      locations = settings.deliveryLocations;
      await setStoreData('delivery_locations', locations);
    } else {
      locations = readData('locations.json') || [];
    }
  }
  return Array.isArray(locations) ? locations : [];
};

const saveDeliveryLocationsData = async (locations) => {
  await setStoreData('delivery_locations', locations);
  const currentSettings = (await getStoreData('settings')) || {};
  currentSettings.deliveryLocations = locations;
  await setStoreData('settings', currentSettings);
  writeData('locations.json', locations);
  return locations;
};

app.get('/api/locations', async (req, res) => {
  const locations = await getDeliveryLocationsData();
  res.json(locations);
});

app.get('/api/delivery-locations', async (req, res) => {
  const locations = await getDeliveryLocationsData();
  res.json(locations);
});

app.post('/api/locations', async (req, res) => {
  const locations = await getDeliveryLocationsData();
  const newLoc = {
    id: req.body.id || 'loc-' + Date.now(),
    name: (req.body.name || '').trim(),
    area: (req.body.area || '').trim(),
    city: (req.body.city || 'Hyderabad').trim(),
    pincode: (req.body.pincode || '').toString().trim(),
    deliverySlot: (req.body.deliverySlot || 'Morning 7:00 AM - 9:30 AM').trim(),
    active: req.body.active !== false
  };

  const existingIdx = locations.findIndex((l) => l.id === newLoc.id);
  if (existingIdx >= 0) {
    locations[existingIdx] = { ...locations[existingIdx], ...newLoc };
  } else {
    locations.push(newLoc);
  }

  await saveDeliveryLocationsData(locations);
  res.json({ success: true, location: newLoc, locations });
});

app.post('/api/delivery-locations', async (req, res) => {
  const locations = await getDeliveryLocationsData();
  const newLoc = {
    id: req.body.id || 'loc-' + Date.now(),
    name: (req.body.name || '').trim(),
    area: (req.body.area || '').trim(),
    city: (req.body.city || 'Hyderabad').trim(),
    pincode: (req.body.pincode || '').toString().trim(),
    deliverySlot: (req.body.deliverySlot || 'Morning 7:00 AM - 9:30 AM').trim(),
    active: req.body.active !== false
  };

  const existingIdx = locations.findIndex((l) => l.id === newLoc.id);
  if (existingIdx >= 0) {
    locations[existingIdx] = { ...locations[existingIdx], ...newLoc };
  } else {
    locations.push(newLoc);
  }

  await saveDeliveryLocationsData(locations);
  res.json({ success: true, location: newLoc, locations });
});

app.put('/api/locations/:id', async (req, res) => {
  const { id } = req.params;
  let locations = await getDeliveryLocationsData();
  const idx = locations.findIndex((l) => l.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Delivery location not found' });
  }

  locations[idx] = {
    ...locations[idx],
    ...req.body,
    id,
    name: (req.body.name || locations[idx].name || '').trim(),
    area: (req.body.area || locations[idx].area || '').trim(),
    city: (req.body.city || locations[idx].city || 'Hyderabad').trim(),
    pincode: (req.body.pincode !== undefined ? req.body.pincode : locations[idx].pincode).toString().trim(),
    deliverySlot: (req.body.deliverySlot || locations[idx].deliverySlot || 'Morning 7:00 AM - 9:30 AM').trim(),
    active: req.body.active !== undefined ? req.body.active : locations[idx].active
  };

  await saveDeliveryLocationsData(locations);
  res.json({ success: true, location: locations[idx], locations });
});

app.delete('/api/locations/:id', async (req, res) => {
  const { id } = req.params;
  let locations = await getDeliveryLocationsData();
  locations = locations.filter((l) => l.id !== id);
  await saveDeliveryLocationsData(locations);
  res.json({ success: true, message: 'Location deleted successfully', locations });
});

app.delete('/api/delivery-locations/:id', async (req, res) => {
  const { id } = req.params;
  let locations = await getDeliveryLocationsData();
  locations = locations.filter((l) => l.id !== id);
  await saveDeliveryLocationsData(locations);
  res.json({ success: true, message: 'Location deleted successfully', locations });
});

app.patch('/api/locations/:id/toggle', async (req, res) => {
  const { id } = req.params;
  let locations = await getDeliveryLocationsData();
  const idx = locations.findIndex((l) => l.id === id);
  if (idx !== -1) {
    locations[idx].active = !locations[idx].active;
    await saveDeliveryLocationsData(locations);
  }
  res.json({ success: true, locations });
});

// 3. PRODUCTS API
app.get('/api/products', async (req, res) => {
  let products = (await getStoreData('products')) || [];
  const { category, search, inStock, badge } = req.query;

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.culinaryUses && p.culinaryUses.toLowerCase().includes(q))
    );
  }

  if (inStock === 'true') {
    products = products.filter((p) => p.inStock !== false);
  }

  if (badge) {
    products = products.filter((p) => p.badges && p.badges.includes(badge));
  }

  res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const products = (await getStoreData('products')) || [];
  const product = products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.post('/api/products', async (req, res) => {
  const products = (await getStoreData('products')) || [];
  const settings = (await getStoreData('settings')) || {};

  const name = req.body.name || 'New Fresh Cut';
  const slug = req.body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const id = req.body.id || 'ksf-' + Date.now();

  const newProduct = {
    id,
    name,
    slug,
    category: req.body.category || 'goat',
    tagline: req.body.tagline || '',
    description: req.body.description || '',
    fssaiNumber: req.body.fssaiNumber || settings.masterFssai || '13624014000889',
    shelfLife: req.body.shelfLife || 'Best consumed within 48 hours at 0°C to 4°C.',
    storageInstructions: req.body.storageInstructions || 'Store chilled at 0°C to 4°C. Rinse with cold water before cooking.',
    feedType: req.body.feedType || '100% Natural Organic Feed & Grass Grazing',
    halalCertified: req.body.halalCertified !== false,
    antibioticFree: req.body.antibioticFree !== false,
    culinaryUses: req.body.culinaryUses || '',
    piecesEstimate: req.body.piecesEstimate || '',
    images: Array.isArray(req.body.images) ? req.body.images : [],
    badges: req.body.badges || ['Farm Fresh', '100% Halal'],
    inStock: req.body.inStock !== false,
    isBestSeller: Boolean(req.body.isBestSeller),
    variants: Array.isArray(req.body.variants) && req.body.variants.length > 0 
      ? req.body.variants 
      : [
          {
            id: 'v-' + Date.now(),
            label: '1 kg',
            weight: '1000g',
            netWeight: '980g - 1000g',
            mrp: 999,
            sellingPrice: 849,
            inStock: true,
            isDefault: true
          }
        ]
  };

  products.unshift(newProduct);
  await setStoreData('products', products);

  res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const products = (await getStoreData('products')) || [];
  const index = products.findIndex((p) => p.id === id || p.slug === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = {
    ...products[index],
    ...req.body,
    id: products[index].id // preserve ID
  };

  products[index] = updatedProduct;
  await setStoreData('products', products);

  res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  let products = (await getStoreData('products')) || [];
  const originalLength = products.length;

  products = products.filter((p) => p.id !== id && p.slug !== id);

  if (products.length === originalLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  await setStoreData('products', products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// 4. IMAGE UPLOAD API — Supabase Storage (public bucket required)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const bucketName = 'product-images';

  // Build list of Supabase clients to try: service role first, then anon key
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SECRET ||
    process.env.SUPABASE_SECRET_KEY ||
    (process.env.SUPABASE_KEY && process.env.SUPABASE_KEY.startsWith('eyJ') ? process.env.SUPABASE_KEY : null);

  const clientsToTry = [];
  if (serviceRoleKey) clientsToTry.push({ key: serviceRoleKey, label: 'service_role' });
  if (supabase) clientsToTry.push({ key: null, client: supabase, label: 'anon' });

  // Read file buffer once
  let fileBuffer;
  try {
    fileBuffer = req.file.buffer || fs.readFileSync(req.file.path);
  } catch (readErr) {
    return res.status(500).json({ error: 'Failed to read uploaded file: ' + readErr.message });
  }

  const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['jpg','jpeg','png','webp','gif','avif'].includes(ext) ? ext : 'jpg';
  const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const contentType = req.file.mimetype || 'image/jpeg';

  let lastError = null;

  for (const attempt of clientsToTry) {
    try {
      const client = attempt.client || createClient(supabaseUrl, attempt.key);

      // Try upload
      let { data: uploadData, error: uploadError } = await client.storage
        .from(bucketName)
        .upload(filename, fileBuffer, { contentType, upsert: true });

      // If bucket not found AND we have service role, auto-create it
      if (uploadError && (
        uploadError.message?.toLowerCase().includes('not found') ||
        uploadError.statusCode === '404' ||
        uploadError.message?.toLowerCase().includes('bucket')
      ) && attempt.label === 'service_role') {
        console.log('Bucket not found — auto-creating product-images bucket...');
        try {
          await client.storage.createBucket(bucketName, { public: true });
          const retry = await client.storage
            .from(bucketName)
            .upload(filename, fileBuffer, { contentType, upsert: true });
          uploadData = retry.data;
          uploadError = retry.error;
        } catch (createErr) {
          console.warn('Auto-create bucket failed:', createErr.message);
        }
      }

      if (!uploadError && uploadData) {
        // Upload succeeded — get the permanent CDN URL
        const { data: urlData } = client.storage.from(bucketName).getPublicUrl(filename);
        const publicUrl = urlData?.publicUrl;
        // Clean up temp file
        try { if (req.file.path) fs.unlinkSync(req.file.path); } catch(e) {}
        console.log(`✅ Image uploaded to Supabase Storage (${attempt.label}):`, publicUrl);
        return res.json({ success: true, url: publicUrl, filename, storage: 'supabase', key_used: attempt.label });
      }

      lastError = uploadError?.message || 'Unknown upload error';
      console.warn(`Upload attempt with ${attempt.label} key failed:`, lastError);
    } catch (err) {
      lastError = err.message;
      console.warn(`Upload attempt with ${attempt.label} threw:`, err.message);
    }
  }

  // All Supabase attempts failed — try local disk as last resort (only works in dev)
  const isVercelEnv = Boolean(process.env.VERCEL || process.env.NOW_REGION);
  if (!isVercelEnv && req.file.path && req.file.filename) {
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('⚠️ Falling back to local /uploads storage:', fileUrl);
    return res.json({ success: true, url: fileUrl, filename: req.file.filename, storage: 'local',
      warning: 'Image saved locally — will NOT be visible on Vercel. Create a public Supabase bucket named "product-images" to fix this.' });
  }

  // Nothing worked — return clear actionable error
  try { if (req.file.path) fs.unlinkSync(req.file.path); } catch(e) {}
  return res.status(500).json({
    error: 'Image upload failed. Please create a public Supabase Storage bucket named "product-images".',
    detail: lastError,
    fix: 'Go to Supabase Dashboard → Storage → New Bucket → Name: product-images → Enable Public → Save'
  });
});


// 5. ADMIN STATS & OVERVIEW API

app.get('/api/stats', async (req, res) => {
  const products = (await getStoreData('products')) || [];
  const categories = (await getStoreData('categories')) || [];
  const settings = (await getStoreData('settings')) || {};

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = totalProducts - inStockCount;

  const categoryBreakdown = {};
  categories.forEach((cat) => {
    categoryBreakdown[cat.id] = products.filter((p) => p.category === cat.id).length;
  });

  let totalDiscounts = 0;
  let variantCount = 0;
  products.forEach((p) => {
    (p.variants || []).forEach((v) => {
      if (v.mrp && v.sellingPrice && v.mrp > v.sellingPrice) {
        const discount = ((v.mrp - v.sellingPrice) / v.mrp) * 100;
        totalDiscounts += discount;
        variantCount++;
      }
    });
  });
  const avgDiscount = variantCount > 0 ? Math.round(totalDiscounts / variantCount) : 0;

  res.json({
    totalProducts,
    inStockCount,
    outOfStockCount,
    categoryCount: categories.length,
    categoryBreakdown,
    avgDiscount,
    storeName: settings.storeName,
    whatsappNumber: settings.whatsappNumber
  });
});

// 6. STORE RESET / RESTORE DEFAULTS API
app.post('/api/store/reset-defaults', async (req, res) => {
  memoryCache.clear();
  const defaultProducts = readData('products.json');
  const defaultSettings = readData('settings.json');
  const defaultCategories = readData('categories.json');

  if (supabase) {
    if (defaultProducts) await supabase.from('ksf_store').upsert({ key: 'products', data: defaultProducts, updated_at: new Date().toISOString() });
    if (defaultSettings) await supabase.from('ksf_store').upsert({ key: 'settings', data: defaultSettings, updated_at: new Date().toISOString() });
    if (defaultCategories) await supabase.from('ksf_store').upsert({ key: 'categories', data: defaultCategories, updated_at: new Date().toISOString() });
  }

  res.json({ success: true, message: 'Store reset to default catalog successfully' });
});

// 7. CLICK TRACKING API (anonymous, fire-and-forget)
app.post('/api/track/click', async (req, res) => {
  const { visitor_id, product_id, product_name, category, variant_label, selling_price, event_type, device } = req.body;
  if (!visitor_id || !product_id) return res.status(400).json({ error: 'Missing required fields' });

  if (supabase) {
    try {
      await supabase.from('ksf_clicks').insert({
        visitor_id,
        product_id,
        product_name: product_name || '',
        category: category || '',
        variant_label: variant_label || '',
        selling_price: selling_price || 0,
        event_type: event_type || 'buy_click',
        device: device || 'unknown',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      // Silent — never block customer action for analytics failure
    }
  }
  res.status(204).end();
});

// 8. ORDER TRACKING API
app.post('/api/track/order', async (req, res) => {
  const { visitor_id, items, total_amount, total_items } = req.body;
  if (!visitor_id || !items) return res.status(400).json({ error: 'Missing required fields' });

  // Generate human-readable order reference
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const order_ref = `KSF-${dateStr}-${rand}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.from('ksf_orders').insert({
        order_ref,
        visitor_id,
        items,
        total_amount: total_amount || 0,
        total_items: total_items || 0,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }).select('id, order_ref').single();

      if (error) throw error;
      return res.json({ success: true, order_ref, id: data?.id });
    } catch (err) {
      // Still return ok so WhatsApp always opens
    }
  }
  res.json({ success: true, order_ref });
});

// 9. ANALYTICS API
app.get('/api/analytics', async (req, res) => {
  const { period = 'week' } = req.query;
  if (!supabase) return res.json({ clicks: [], topProducts: [], totalClicks: 0, uniqueVisitors: 0, totalOrderValue: 0, repeatBuyers: 0 });

  // Calculate date range
  const now = new Date();
  const periodMap = { day: 1, week: 7, month: 30, '6months': 183, year: 365 };
  const days = periodMap[period] || 7;
  const since = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  try {
    // Fetch clicks and orders in parallel
    const [clicksRes, ordersRes] = await Promise.all([
      supabase.from('ksf_clicks').select('*').gte('created_at', since).order('created_at', { ascending: false }),
      supabase.from('ksf_orders').select('*').gte('created_at', since).order('created_at', { ascending: false })
    ]);

    const clicks = clicksRes.data || [];
    const orders = ordersRes.data || [];

    // Aggregate top products
    const productMap = {};
    clicks.forEach(c => {
      const key = c.product_id;
      if (!productMap[key]) productMap[key] = { product_id: key, product_name: c.product_name, category: c.category, clicks: 0 };
      productMap[key].clicks++;
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.clicks - a.clicks).slice(0, 8);

    // Unique visitors
    const uniqueVisitorSet = new Set(clicks.map(c => c.visitor_id));
    const uniqueVisitors = uniqueVisitorSet.size;

    // Event type breakdown
    const eventBreakdown = {};
    clicks.forEach(c => {
      eventBreakdown[c.event_type || 'buy_click'] = (eventBreakdown[c.event_type || 'buy_click'] || 0) + 1;
    });

    // Orders aggregation
    const totalOrderValue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const visitorOrderCounts = {};
    orders.forEach(o => { visitorOrderCounts[o.visitor_id] = (visitorOrderCounts[o.visitor_id] || 0) + 1; });
    const repeatBuyers = Object.values(visitorOrderCounts).filter(c => c > 1).length;
    const repeatBuyersPercent = uniqueVisitors > 0 ? Math.round((repeatBuyers / uniqueVisitors) * 100) : 0;

    res.json({
      period,
      totalClicks: clicks.length,
      uniqueVisitors,
      totalOrders: orders.length,
      totalOrderValue,
      repeatBuyers,
      repeatBuyersPercent,
      topProducts,
      eventBreakdown,
      recentOrders: orders.slice(0, 5)
    });
  } catch (err) {
    console.warn('Analytics query note:', err.message);
    res.json({ period: req.query.period || 'week', totalClicks: 0, uniqueVisitors: 0, totalOrders: 0, totalOrderValue: 0, repeatBuyers: 0, repeatBuyersPercent: 0, topProducts: [], eventBreakdown: {}, recentOrders: [] });
  }
});

// 10. ORDERS LIST (admin only)
app.get('/api/orders', async (req, res) => {
  if (!supabase) return res.json([]);
  const { status } = req.query;
  try {
    let query = supabase.from('ksf_orders').select('*').order('created_at', { ascending: false }).limit(200);
    if (status && status !== 'all') query = query.eq('status', status);
    const { data, error } = await query;
    if (error) {
      console.warn('Orders query note:', error.message);
      return res.json([]);
    }
    res.json(data || []);
  } catch (err) {
    res.json([]);
  }
});

// 11. ORDER STATUS UPDATE (admin only)
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  if (!supabase) return res.status(503).json({ error: 'Database not connected' });

  const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (note !== undefined) updates.note = note;

    const { data, error } = await supabase.from('ksf_orders').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, order: data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// 12. DELETE ORDER (admin only)
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  if (!supabase) return res.status(503).json({ error: 'Database not connected' });

  try {
    const { error } = await supabase
      .from('ksf_orders')
      .delete()
      .or(`id.eq.${id},order_ref.eq.${id}`);

    if (error) throw error;
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Root / health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), brand: 'Kohinoor Signature Farms' });
});

// Serve built client frontend with Dynamic Open Graph / SEO Rich Previews
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));

  // Dynamic SEO & Open Graph handler for product share links
  app.get(['/product/:id', '/p/:id'], async (req, res) => {
    const { id } = req.params;
    const products = (await getStoreData('products')) || [];
    const settings = (await getStoreData('settings')) || {};
    const product = products.find((p) => p.id === id || p.slug === id);

    const indexPath = path.join(CLIENT_DIST, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send('Index file not found');
    }

    let html = fs.readFileSync(indexPath, 'utf-8');

    if (product) {
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const origin = `${protocol}://${host}`;

      const primaryVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
      const priceText = primaryVariant ? `₹${primaryVariant.sellingPrice}` : '';
      const mrpText = primaryVariant && primaryVariant.mrp > primaryVariant.sellingPrice ? ` (MRP ₹${primaryVariant.mrp})` : '';

      let imageUrl = product.images && product.images.length > 0 ? product.images[0] : `${origin}/logo.jpeg`;
      if (imageUrl.startsWith('/')) {
        imageUrl = `${origin}${imageUrl}`;
      }

      const pageTitle = `${product.name} ${priceText ? '• ' + priceText : ''} | Kohinoor Signature Farms`;
      const pageDescription = `${product.tagline || product.description || '100% Pasture-Raised, Antibiotic-Free Meat'} • Certified Halal • Sourced & prepared fresh today in Telangana.${priceText ? ' Order online for ' + priceText + mrpText : ''}`;
      const canonicalUrl = `${origin}/product/${product.slug || product.id}`;

      // Schema.org JSON-LD structured data for Google Rich Cards
      const schemaJson = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": [imageUrl],
        "description": pageDescription,
        "brand": {
          "@type": "Brand",
          "name": "Kohinoor Signature Farms"
        },
        "sku": product.id,
        "offers": {
          "@type": "Offer",
          "url": canonicalUrl,
          "priceCurrency": "INR",
          "price": primaryVariant ? primaryVariant.sellingPrice : 0,
          "availability": product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Kohinoor Signature Farms"
          }
        }
      };

      // Replace HTML Title
      html = html.replace(/<title>.*?<\/title>/gi, `<title>${pageTitle}</title>`);

      // Replace Meta Title and Description
      html = html.replace(/<meta name="title" content=".*?"\s*\/?>/gi, `<meta name="title" content="${pageTitle}">`);
      html = html.replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${pageDescription}">`);

      // Replace Open Graph Tags
      html = html.replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${pageTitle}">`);
      html = html.replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${pageDescription}">`);
      html = html.replace(/<meta property="og:image" content=".*?"\s*\/?>/gi, `<meta property="og:image" content="${imageUrl}">`);
      html = html.replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${canonicalUrl}">`);
      html = html.replace(/<meta property="og:type" content=".*?"\s*\/?>/gi, `<meta property="og:type" content="product">`);

      // Replace Twitter Card Tags
      html = html.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/gi, `<meta property="twitter:title" content="${pageTitle}">`);
      html = html.replace(/<meta property="twitter:description" content=".*?"\s*\/?>/gi, `<meta property="twitter:description" content="${pageDescription}">`);
      html = html.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/gi, `<meta property="twitter:image" content="${imageUrl}">`);
      html = html.replace(/<meta property="twitter:url" content=".*?"\s*\/?>/gi, `<meta property="twitter:url" content="${canonicalUrl}">`);

      // Inject Schema.org LD-JSON into Head
      const richTags = `
    <!-- Dynamic Product SEO Injection -->
    <meta property="og:site_name" content="Kohinoor Signature Farms">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="product:price:amount" content="${primaryVariant ? primaryVariant.sellingPrice : 0}">
    <meta property="product:price:currency" content="INR">
    <meta property="product:availability" content="${product.inStock !== false ? 'in stock' : 'out of stock'}">
    <script type="application/ld+json">${JSON.stringify(schemaJson)}</script>
`;
      html = html.replace('</head>', `${richTags}\n</head>`);
    }

    res.send(html);
  });

  // Catch-all SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/public')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// Start server only when running standalone server process (not when imported as a serverless function)
const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const isDirectExecution = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename);

if (!isVercel && process.env.NODE_ENV !== 'test' && isDirectExecution) {
  app.listen(PORT, () => {
    console.log(`Kohinoor Signature Farms API Server running on port ${PORT}`);
  });
}

export default app;
