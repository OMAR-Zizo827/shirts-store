const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders — place an order
router.post('/', (req, res) => {
  try {
    const { items, shipping, total } = req.body;
    const { name, email, address, city, phone, notes } = shipping || {};

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }
    if (!name || !email || !address || !city) {
      return res.status(400).json({ error: 'Shipping name, email, address and city are required' });
    }

    const db = getDB();
    const userId = req.user ? req.user.id : null;

    // Calculate total server-side
    let calculatedTotal = 0;
    const productIds = items.map(i => i.product_id);
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) return res.status(400).json({ error: `Product ${item.product_id} not found` });
      calculatedTotal += product.price * item.quantity;
    }

    const orderResult = db.prepare(`
      INSERT INTO orders (user_id, total, shipping_name, shipping_email, shipping_address, shipping_city, shipping_phone, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, calculatedTotal, name, email, address, city, phone || '', notes || '');

    const orderId = orderResult.lastInsertRowid;

    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, product_team, size, quantity, price)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItems = db.transaction((orderItems) => {
      for (const item of orderItems) {
        const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
        insertItem.run(orderId, item.product_id, product.name, product.team, item.size, item.quantity, product.price);
      }
    });

    insertItems(items);

    // Clear user cart if logged in
    if (userId) {
      db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
    }

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    res.status(201).json({ order: { ...order, items: orderItems } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders — user's orders
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  }));
  res.json({ orders: ordersWithItems });
});

// GET /api/orders/:id — single order detail
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

// GET /api/admin/orders (admin)
router.get('/admin/all', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  const orders = db.prepare('SELECT o.*, u.name as user_name, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC').all();
  const ordersWithItems = orders.map(order => ({
    ...order,
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  }));
  res.json({ orders: ordersWithItems });
});

// PUT /api/orders/:id/status (admin)
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const db = getDB();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: 'Status updated' });
});

module.exports = router;
