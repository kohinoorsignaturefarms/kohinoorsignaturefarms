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

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Copy official logo from root if not already present
const rootLogoPath = path.join(__dirname, '..', 'WhatsApp Image 2026-08-13 at 18.16.46.jpeg');
const publicLogoPath = path.join(PUBLIC_DIR, 'logo.jpeg');
if (fs.existsSync(rootLogoPath) && !fs.existsSync(publicLogoPath)) {
  try {
    fs.copyFileSync(rootLogoPath, publicLogoPath);
  } catch (e) {
    console.error('Error copying logo:', e);
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
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) return null;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filename}:`, err);
    return null;
  }
};

const writeData = (filename, data) => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err);
    return false;
  }
};

// ------------------------------------
// API ROUTES
// ------------------------------------

// 1. SETTINGS API
app.get('/api/settings', (req, res) => {
  const settings = readData('settings.json') || {};
  // Don't expose plain admin PIN directly in public response, send hasPin boolean or pin in admin mode
  const { adminPin, ...safeSettings } = settings;
  res.json({ ...safeSettings, hasCustomPin: Boolean(adminPin) });
});

app.put('/api/settings', (req, res) => {
  const currentSettings = readData('settings.json') || {};
  const updatedSettings = {
    ...currentSettings,
    ...req.body
  };
  writeData('settings.json', updatedSettings);
  res.json({ success: true, message: 'Settings updated successfully', settings: updatedSettings });
});

// Verify Admin PIN
app.post('/api/auth/verify-pin', (req, res) => {
  const { pin } = req.body;
  const settings = readData('settings.json') || {};
  const expectedPin = settings.adminPin || 'goateggs';
  if (pin === expectedPin) {
    res.json({ success: true, token: 'ksf-admin-auth-token-' + Date.now() });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Admin Password. Please try again.' });
  }
});

// 2. CATEGORIES API
app.get('/api/categories', (req, res) => {
  const categories = readData('categories.json') || [];
  res.json(categories);
});

app.post('/api/categories', (req, res) => {
  const categories = readData('categories.json') || [];
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

  writeData('categories.json', categories);
  res.json({ success: true, category: newCat });
});

app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  let categories = readData('categories.json') || [];
  categories = categories.filter((c) => c.id !== id && c.slug !== id);
  writeData('categories.json', categories);
  res.json({ success: true, message: 'Category deleted' });
});

// 3. PRODUCTS API
app.get('/api/products', (req, res) => {
  let products = readData('products.json') || [];
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

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const products = readData('products.json') || [];
  const product = products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.post('/api/products', (req, res) => {
  const products = readData('products.json') || [];
  const settings = readData('settings.json') || {};

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
    images: Array.isArray(req.body.images) && req.body.images.length > 0 
      ? req.body.images 
      : ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'],
    badges: req.body.badges || ['Farm Fresh', '100% Halal'],
    inStock: req.body.inStock !== false,
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
  writeData('products.json', products);

  res.status(201).json({ success: true, message: 'Product created successfully', product: newProduct });
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const products = readData('products.json') || [];
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
  writeData('products.json', products);

  res.json({ success: true, message: 'Product updated successfully', product: updatedProduct });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  let products = readData('products.json') || [];
  const originalLength = products.length;

  products = products.filter((p) => p.id !== id && p.slug !== id);

  if (products.length === originalLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeData('products.json', products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// 4. IMAGE UPLOAD API
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// 5. ADMIN STATS & OVERVIEW API
app.get('/api/stats', (req, res) => {
  const products = readData('products.json') || [];
  const categories = readData('categories.json') || [];
  const settings = readData('settings.json') || {};

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.inStock !== false).length;
  const outOfStockCount = totalProducts - inStockCount;

  const categoryBreakdown = {};
  categories.forEach((cat) => {
    categoryBreakdown[cat.id] = products.filter((p) => p.category === cat.id).length;
  });

  // Calculate average discount percentage
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

// Root / health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), brand: 'Kohinoor Signature Farms' });
});

// Serve built client frontend with Dynamic Open Graph / SEO Rich Previews
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));

  // Dynamic SEO & Open Graph handler for product share links
  app.get(['/product/:id', '/p/:id'], (req, res) => {
    const { id } = req.params;
    const products = readData('products.json') || [];
    const settings = readData('settings.json') || {};
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

// Start server
app.listen(PORT, () => {
  console.log(`Kohinoor Signature Farms API Server running on port ${PORT}`);
});
