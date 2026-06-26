const express = require('express');
const { getDB } = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { search, league, type, minPrice, maxPrice, featured, sort } = req.query;

    let query = 'SELECT * FROM products WHERE stock > 0';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR team LIKE ? OR league LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (league && league !== 'all') {
      query += ' AND league = ?';
      params.push(league);
    }
    if (type && type !== 'all') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }
    if (featured === 'true') {
      query += ' AND featured = 1';
    }

    if (sort === 'price_asc') query += ' ORDER BY price ASC';
    else if (sort === 'price_desc') query += ' ORDER BY price DESC';
    else if (sort === 'name') query += ' ORDER BY name ASC';
    else query += ' ORDER BY featured DESC, created_at DESC';

    const products = db.prepare(query).all(...params);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/leagues
router.get('/leagues', (req, res) => {
  const db = getDB();
  const rows = db.prepare('SELECT DISTINCT league FROM products ORDER BY league').all();
  res.json({ leagues: rows.map(r => r.league) });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const db = getDB();
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// POST /api/products (admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, team, league, type, price, description, image_url, sizes, stock, featured } = req.body;
    if (!name || !team || !league || !price) {
      return res.status(400).json({ error: 'Name, team, league and price are required' });
    }
    const db = getDB();
    const result = db.prepare(`
      INSERT INTO products (name, team, league, type, price, description, image_url, sizes, stock, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, team, league, type || 'club', price,
      description || '', image_url || '',
      sizes ? JSON.stringify(sizes) : JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
      stock || 100, featured ? 1 : 0
    );
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (admin)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const db = getDB();
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, team, league, type, price, description, image_url, sizes, stock, featured } = req.body;
    db.prepare(`
      UPDATE products SET name=?, team=?, league=?, type=?, price=?, description=?, image_url=?, sizes=?, stock=?, featured=?
      WHERE id=?
    `).run(
      name || existing.name, team || existing.team, league || existing.league,
      type || existing.type, price || existing.price,
      description !== undefined ? description : existing.description,
      image_url !== undefined ? image_url : existing.image_url,
      sizes ? JSON.stringify(sizes) : existing.sizes,
      stock !== undefined ? stock : existing.stock,
      featured !== undefined ? (featured ? 1 : 0) : existing.featured,
      req.params.id
    );
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const db = getDB();
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted successfully' });
});

module.exports = router;
