const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'amira-editorial-keepsake-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Disable caching for API routes to ensure fresh data
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});


// Serves Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

// Configure Multer for Admin Image Uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'public', 'images');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'uploaded-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Authentication Middlewares
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Helper to initialize sizes for a product
async function initializeProductSizes(productId, category, defaultStock = 10) {
  if (category === 'Shoes & Jewellery') {
    // Determine if it is a shoe or jewellery based on name/description (or default to One Size / Shoes sizes)
    const product = await db.get('SELECT name FROM products WHERE id = ?', [productId]);
    if (product && product.name.toLowerCase().includes('juttis') || product.name.toLowerCase().includes('shoes')) {
      const shoeSizes = ['US 6', 'US 7', 'US 8', 'US 9'];
      for (const size of shoeSizes) {
        await db.run('INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)', [productId, size, defaultStock]);
      }
    } else {
      await db.run('INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)', [productId, 'One Size', defaultStock]);
    }
  } else {
    // Apparel sizes S, M, L, XL
    const sizes = ['S', 'M', 'L', 'XL'];
    for (const size of sizes) {
      await db.run('INSERT OR IGNORE INTO product_sizes (product_id, size, stock) VALUES (?, ?, ?)', [productId, size, defaultStock]);
    }
  }
}

// ----------------------------------------------------
// USER AUTHENTICATION API
// ----------------------------------------------------

// User Registration
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "customer")',
      [name, email, hash]
    );

    req.session.user = {
      id: result.id,
      name,
      email,
      role: 'customer'
    };

    res.status(201).json({ message: 'User registered successfully', user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Session Check
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// ----------------------------------------------------
// PRODUCT CATALOG API
// ----------------------------------------------------

// Get Products (with Search, Category, and Price Range filtering)
app.get('/api/products', async (req, res) => {
  const { search, category, priceMax } = req.query;
  // Get products and sum of stocks across all sizes
  let query = `
    SELECT p.*, c.name as category, SUM(ps.stock) as stock 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_sizes ps ON p.id = ps.product_id 
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term);
  }

  if (category) {
    query += ' AND c.name = ?';
    params.push(category);
  }

  if (priceMax) {
    query += ' AND p.price <= ?';
    params.push(parseFloat(priceMax));
  }

  query += ' GROUP BY p.id ORDER BY p.created_at DESC';

  try {
    const products = await db.all(query, params);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Single Product details (with size stocks array)
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.get('SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Retrieve sizes and specific stock quantities
    const sizes = await db.all('SELECT size, stock FROM product_sizes WHERE product_id = ?', [req.params.id]);
    product.sizes = sizes;
    
    // Calculate total stock fallback
    product.stock = sizes.reduce((sum, item) => sum + item.stock, 0);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// SHOPPING CART API (Authenticated Customers Only)
// ----------------------------------------------------

// Retrieve Cart Items
app.get('/api/cart', requireLogin, async (req, res) => {
  try {
    const cartItems = await db.all(
      `SELECT cart.id as cart_id, cart.quantity, cart.size, products.id as product_id, 
              products.name, products.price, products.image_url, ps.stock
       FROM cart 
       JOIN products ON cart.product_id = products.id
       JOIN product_sizes ps ON cart.product_id = ps.product_id AND cart.size = ps.size
       WHERE cart.user_id = ?`,
      [req.session.user.id]
    );
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Item to Cart (tracks product AND size)
app.post('/api/cart', requireLogin, async (req, res) => {
  const { productId, quantity, size } = req.body;
  const qty = parseInt(quantity) || 1;
  const itemSize = size || 'M';

  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }

  try {
    // Verify size stock exists
    const sizeStock = await db.get(
      'SELECT stock FROM product_sizes WHERE product_id = ? AND size = ?',
      [productId, itemSize]
    );
    
    if (!sizeStock) {
      return res.status(404).json({ error: 'Product size configuration not found.' });
    }

    const existing = await db.get(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.session.user.id, productId, itemSize]
    );

    if (existing) {
      const newQty = existing.quantity + qty;
      if (newQty > sizeStock.stock) {
        return res.status(400).json({ error: `Cannot add more. Only ${sizeStock.stock} left in size ${itemSize}.` });
      }
      await db.run(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQty, existing.id]
      );
    } else {
      if (qty > sizeStock.stock) {
        return res.status(400).json({ error: `Cannot add. Only ${sizeStock.stock} left in size ${itemSize}.` });
      }
      await db.run(
        'INSERT INTO cart (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
        [req.session.user.id, productId, itemSize, qty]
      );
    }

    res.json({ message: 'Cart updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Item Quantity in Cart
app.put('/api/cart/:productId', requireLogin, async (req, res) => {
  const { quantity, size } = req.body;
  const qty = parseInt(quantity);
  const itemSize = size || 'M';

  if (qty <= 0) {
    try {
      await db.run(
        'DELETE FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
        [req.session.user.id, req.params.productId, itemSize]
      );
      return res.json({ message: 'Item removed from cart' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  try {
    const sizeStock = await db.get(
      'SELECT stock FROM product_sizes WHERE product_id = ? AND size = ?',
      [req.params.productId, itemSize]
    );

    if (qty > sizeStock.stock) {
      return res.status(400).json({ error: `Only ${sizeStock.stock} units left in size ${itemSize}.` });
    }

    await db.run(
      'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ? AND size = ?',
      [qty, req.session.user.id, req.params.productId, itemSize]
    );
    res.json({ message: 'Cart quantity updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove Item from Cart
app.delete('/api/cart/:productId', requireLogin, async (req, res) => {
  const itemSize = req.query.size || 'M';
  try {
    await db.run(
      'DELETE FROM cart WHERE user_id = ? AND product_id = ? AND size = ?',
      [req.session.user.id, req.params.productId, itemSize]
    );
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// CHECKOUT & ORDERS API (Authenticated Customers Only)
// ----------------------------------------------------

// Execute Checkout (deducts stock from product_sizes per size)
app.post('/api/checkout', requireLogin, async (req, res) => {
  const { shippingAddress } = req.body;
  if (!shippingAddress) {
    return res.status(400).json({ error: 'Shipping address is required.' });
  }

  const userId = req.session.user.id;

  try {
    // Retrieve user's cart items with size-level stock
    const cartItems = await db.all(
      `SELECT cart.quantity, cart.size, products.id as product_id, products.price, ps.stock 
       FROM cart 
       JOIN products ON cart.product_id = products.id
       JOIN product_sizes ps ON cart.product_id = ps.product_id AND cart.size = ps.size
       WHERE cart.user_id = ?`,
      [userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    // Verify stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock. Only ${item.stock} left of product ID ${item.product_id} in size ${item.size}.` 
        });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create the order
    const orderResult = await db.run(
      'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES (?, ?, "Pending", ?)',
      [userId, totalAmount, shippingAddress]
    );
    const orderId = orderResult.id;

    // Create order items & deduct stock per size
    for (const item of cartItems) {
      await db.run(
        'INSERT INTO order_items (order_id, product_id, size, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.size, item.quantity, item.price]
      );
      await db.run(
        'UPDATE product_sizes SET stock = stock - ? WHERE product_id = ? AND size = ?',
        [item.quantity, item.product_id, item.size]
      );
    }

    // Clear user's cart
    await db.run('DELETE FROM cart WHERE user_id = ?', [userId]);

    res.status(201).json({ message: 'Order placed successfully.', orderId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Retrieve User Profile Order History
app.get('/api/orders', requireLogin, async (req, res) => {
  try {
    const orders = await db.all(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.user.id]
    );

    for (const order of orders) {
      order.items = await db.all(
        `SELECT order_items.quantity, order_items.price, order_items.size, products.name, products.image_url
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = ?`,
        [order.id]
      );
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Profile Details
app.put('/api/profile', requireLogin, async (req, res) => {
  const { name, email, currentPassword, newPassword } = req.body;
  const userId = req.session.user.id;

  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

    const matches = await bcrypt.compare(currentPassword, user.password_hash);
    if (!matches) {
      return res.status(401).json({ error: 'Incorrect current password.' });
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await db.run(
      'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      [name, email, passwordHash, userId]
    );

    req.session.user.name = name;
    req.session.user.email = email;

    res.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN DASHBOARD & MANAGEMENT API (Admins Only)
// ----------------------------------------------------

// Admin Dashboard Metrics
app.get('/api/admin/dashboard', requireAdmin, async (req, res) => {
  try {
    const totalSalesRow = await db.get('SELECT SUM(total_amount) as sum FROM orders WHERE status != "Cancelled"');
    const totalSales = totalSalesRow.sum || 0;

    const totalOrdersRow = await db.get('SELECT COUNT(*) as count FROM orders');
    const totalOrders = totalOrdersRow.count || 0;

    const totalProductsRow = await db.get('SELECT COUNT(*) as count FROM products');
    const totalProducts = totalProductsRow.count || 0;

    const totalUsersRow = await db.get('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
    const totalUsers = totalUsersRow.count || 0;

    const salesTrend = await db.all(`
      SELECT DATE(created_at) as date, SUM(total_amount) as sales, COUNT(*) as count 
      FROM orders 
      WHERE status != 'Cancelled' 
      GROUP BY DATE(created_at) 
      ORDER BY date ASC 
      LIMIT 10
    `);

    res.json({
      metrics: {
        totalSales,
        totalOrders,
        totalProducts,
        totalUsers
      },
      salesTrend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Admin Product Inventory List (including details of all sizes)
app.get('/api/admin/products', requireAdmin, async (req, res) => {
  try {
    const products = await db.all('SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC');
    
    // Attach sizes and specific stocks to each product
    for (const p of products) {
      const sizes = await db.all('SELECT size, stock FROM product_sizes WHERE product_id = ?', [p.id]);
      p.sizes = sizes;
      p.stock = sizes.reduce((sum, item) => sum + item.stock, 0);
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create New Product (seeds sizing array)
app.post('/api/admin/products', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required.' });
  }

  const imageUrl = req.file ? `/images/${req.file.filename}` : '/images/product-1.jpg';
  const defaultStockVal = parseInt(stock) || 10;

  try {
    const catRow = await db.get('SELECT id FROM categories WHERE name = ?', [category]);
    const categoryId = catRow ? catRow.id : null;
    const result = await db.run(
      'INSERT INTO products (name, description, price, category_id, image_url) VALUES (?, ?, ?, ?, ?)',
      [name, description, parseFloat(price), categoryId, imageUrl]
    );
    const newProductId = result.id;
    
    // Initialize size stocks in product_sizes
    await initializeProductSizes(newProductId, category, defaultStockVal);

    res.status(201).json({ message: 'Product created successfully', productId: newProductId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Existing Product (updates stock across sizes)
app.put('/api/admin/products/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const { name, description, price, stock, category } = req.body;
  const productId = req.params.id;

  try {
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let imageUrl = existing.image_url;
    if (req.file) {
      imageUrl = `/images/${req.file.filename}`;
      if (existing.image_url.includes('uploaded-')) {
        const oldPath = path.join(__dirname, 'public', existing.image_url);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
    }

    const catRow = await db.get('SELECT id FROM categories WHERE name = ?', [category]);
    const categoryId = catRow ? catRow.id : null;
    await db.run(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category_id = ?, image_url = ? 
       WHERE id = ?`,
      [name, description, parseFloat(price), categoryId, imageUrl, productId]
    );

    // If stock input was updated, distribute it or apply it to sizes
    if (stock !== undefined) {
      const stockVal = parseInt(stock);
      const sizes = await db.all('SELECT id, size FROM product_sizes WHERE product_id = ?', [productId]);
      
      if (sizes.length > 0) {
        // If there are sizes, distribute evenly or update size M/One Size
        const mSize = sizes.find(s => s.size === 'M' || s.size === 'One Size' || s.size === 'US 8');
        if (mSize) {
          // Put the bulk/new stock in standard size
          await db.run('UPDATE product_sizes SET stock = ? WHERE id = ?', [stockVal, mSize.id]);
        } else {
          // Else set first size
          await db.run('UPDATE product_sizes SET stock = ? WHERE id = ?', [stockVal, sizes[0].id]);
        }
      } else {
        // Fallback: create default sizes
        await initializeProductSizes(productId, category, stockVal);
      }
    }

    res.json({ message: 'Product updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Product
app.delete('/api/admin/products/:id', requireAdmin, async (req, res) => {
  const productId = req.params.id;
  try {
    const existing = await db.get('SELECT image_url FROM products WHERE id = ?', [productId]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    if (existing.image_url.includes('uploaded-')) {
      const imgPath = path.join(__dirname, 'public', existing.image_url);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    await db.run('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Get All Orders
app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await db.all(
      `SELECT orders.*, users.name as customer_name, users.email as customer_email 
       FROM orders
       JOIN users ON orders.user_id = users.id
       ORDER BY orders.created_at DESC`
    );

    for (const order of orders) {
      order.items = await db.all(
        `SELECT order_items.quantity, order_items.price, order_items.size, products.name
         FROM order_items
         JOIN products ON order_items.product_id = products.id
         WHERE order_items.order_id = ?`,
        [order.id]
      );
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Update Order Status
app.put('/api/admin/orders/:id', requireAdmin, async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Order status updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Get All Registered Users
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const users = await db.all('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin Delete User Account
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an administrator account.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User account removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password - Demo simulated flow
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  try {
    const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }
    // Generate a simple demo reset token
    const token = 'reset-' + Math.random().toString(36).substring(2, 11);
    await db.run('UPDATE users SET reset_token = ? WHERE email = ?', [token, email]);
    
    // Return simulated reset link for demo screen projection
    res.json({ 
      success: true, 
      resetLink: `/reset-password.html?token=${token}` 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password - Save new password
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required.' });
  }
  try {
    const user = await db.get('SELECT id FROM users WHERE reset_token = ?', [token]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired password reset token.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('UPDATE users SET password_hash = ?, reset_token = NULL WHERE id = ?', [hashedPassword, user.id]);
    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Wildcard routing
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, 'public', `${page}.html`);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    next();
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
