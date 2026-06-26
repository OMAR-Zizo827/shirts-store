const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart
router.get('/', authenticateToken, (req, res) => {
  const db = getDB();
  const items = db.prepare(`
    SELECT ci.id, ci.size, ci.quantity, ci.product_id,
           p.name, p.team, p.price, p.image_url, p.stock, p.sizes
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = ?
    ORDER BY ci.created_at DESC
  `).all(req.user.id);
  res.json({ items });
});

// POST /api/cart
router.post('/', authenticateToken, (req, res) => {
  try {
    const { product_id, size, quantity = 1 } = req.body;
    if (!product_id || !size) {
      return res.status(400).json({ error: 'product_id and size are required' });
    }
    const db = getDB();
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const existing = db.prepare(
      'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?'
    ).get(req.user.id, product_id, size);

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    } else {
      db.prepare(
        'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)'
      ).run(req.user.id, product_id, size, quantity);
    }

    const items = db.prepare(`
      SELECT ci.id, ci.size, ci.quantity, ci.product_id,
             p.name, p.team, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `).all(req.user.id);

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/:id
router.put('/:id', authenticateToken, (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({ error: 'Quantity must be at least 1' });
  }
  const db = getDB();
  const item = db.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!item) return res.status(404).json({ error: 'Cart item not found' });

  db.prepare('UPDATE cart_items SET quantity = ? WHERE id = ?').run(quantity, req.params.id);
  res.json({ message: 'Updated' });
});

// DELETE /api/cart/:id
router.delete('/:id', authenticateToken, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ message: 'Item removed' });
});

// DELETE /api/cart (clear all)
router.delete('/', authenticateToken, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM cart_items WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
