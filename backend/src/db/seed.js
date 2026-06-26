const { getDB } = require('./database');
const bcrypt = require('bcryptjs');

const products = [
  // Casual
  {
    name: 'Casual Linen Summer Shirt',
    team: 'Zara',
    league: 'Casual',
    type: 'Regular Fit',
    price: 49.99,
    description: 'Lightweight and airy linen shirt perfect for warm summer days. Features a relaxed collar and chest pocket.',
    image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 120,
    featured: 1,
  },
  {
    name: 'Minimalist Mandarin Collar Shirt',
    team: 'COS',
    league: 'Casual',
    type: 'Relaxed Fit',
    price: 64.99,
    description: 'Modern grandad/mandarin collar shirt in a crisp cotton-poplin blend. Clean lines and modern look.',
    image_url: 'https://images.unsplash.com/photo-1620012253295-c05518e99309?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 80,
    featured: 0,
  },
  {
    name: 'Striped Casual Cotton Shirt',
    team: 'Tommy Hilfiger',
    league: 'Casual',
    type: 'Regular Fit',
    price: 59.99,
    description: 'Classic vertical striped shirt in premium soft cotton. Versatile style that transitions from work to weekend.',
    image_url: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 150,
    featured: 1,
  },
  {
    name: 'Chambray Casual Button-Down',
    team: 'J.Crew',
    league: 'Casual',
    type: 'Slim Fit',
    price: 49.99,
    description: 'Indigo-dyed chambray shirt with double chest pockets and contrast stitching. A rugged-smart classic.',
    image_url: 'https://images.unsplash.com/photo-1621072156002-e2fcc103e86e?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 110,
    featured: 0,
  },

  // Formal
  {
    name: 'Oxford Cotton Dress Shirt',
    team: 'Ralph Lauren',
    league: 'Formal',
    type: 'Slim Fit',
    price: 69.99,
    description: 'A classic Oxford button-down dress shirt crafted from premium breathable cotton. Ideal for office wear or formal occasions.',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 100,
    featured: 1,
  },
  {
    name: 'Luxury Silk Blend Dress Shirt',
    team: 'Hugo Boss',
    league: 'Formal',
    type: 'Slim Fit',
    price: 99.99,
    description: 'Sophisticated silk blend button-down shirt with a subtle sheen. Elevates your evening wear and black-tie events.',
    image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 60,
    featured: 1,
  },

  // Polo
  {
    name: 'Premium Classic Polo Shirt',
    team: 'Lacoste',
    league: 'Polo',
    type: 'Slim Fit',
    price: 59.99,
    description: 'The timeless polo shirt in double-piqué cotton. Features the iconic collar, rib-knit cuffs, and two-button placket.',
    image_url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 200,
    featured: 1,
  },
  {
    name: 'Textured Knitted Polo',
    team: 'Fred Perry',
    league: 'Polo',
    type: 'Regular Fit',
    price: 79.99,
    description: 'Vintage-inspired textured knit polo shirt with contrast tipping on the collar and cuffs. Smart casual at its finest.',
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 90,
    featured: 0,
  },

  // Flannel
  {
    name: 'Heavyweight Flannel Plaid Shirt',
    team: "Levi's",
    league: 'Flannel',
    type: 'Relaxed Fit',
    price: 54.99,
    description: 'Cozy and durable brushed flannel shirt with a classic plaid pattern. Perfect for layering in autumn or winter.',
    image_url: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600&q=80',
    sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
    stock: 95,
    featured: 1,
  },
  {
    name: 'Vintage Corduroy Button-Down',
    team: 'Lee',
    league: 'Casual',
    type: 'Relaxed Fit',
    price: 59.99,
    description: 'Retro-style fine-whip corduroy shirt. Soft to the touch and perfect for cool weather styling as a lightweight overshirt.',
    image_url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80',
    sizes: JSON.stringify(['M', 'L', 'XL', 'XXL']),
    stock: 75,
    featured: 0,
  },

  // T-Shirt
  {
    name: 'Essential Soft Cotton Crewneck',
    team: 'Calvin Klein',
    league: 'T-Shirt',
    type: 'Regular Fit',
    price: 29.99,
    description: 'Super-soft organic cotton crewneck t-shirt. A wardrobe staple designed for everyday comfort and clean lines.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 300,
    featured: 1,
  },
  {
    name: 'Premium Slub Cotton T-Shirt',
    team: 'COS',
    league: 'T-Shirt',
    type: 'Regular Fit',
    price: 34.99,
    description: 'Crafted from premium slub textured cotton, giving it a subtle heathered look and breathable summer feel.',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL']),
    stock: 140,
    featured: 0,
  },

  // Streetwear
  {
    name: 'Spider-Man Logo Sweatshirt',
    team: 'Marvel',
    league: 'Streetwear',
    type: 'Oversized Fit',
    price: 59.99,
    description: 'Bold spider-man iconic logo sweatshirt. Perfect for casual streetwear styling with a comfortable oversized silhouette.',
    image_url: '/spiderman-sweatshirt.jpg',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 85,
    featured: 1,
  },
  {
    name: 'Nike Minimalist Sweatshirt',
    team: 'Nike',
    league: 'Streetwear',
    type: 'Regular Fit',
    price: 64.99,
    description: 'Classic Nike Swoosh embroidered sweatshirt. Versatile black crewneck perfect for everyday wear and layering.',
    image_url: '/nike-sweatshirt.jpg',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 95,
    featured: 1,
  },
  {
    name: 'Great Affection New York Hoodie',
    team: 'Urban Apparel',
    league: 'Streetwear',
    type: 'Regular Fit',
    price: 69.99,
    description: 'New York City inspired graphic hoodie with vibrant typography. Features "Great Affection" theme with skyline design and kangaroo pocket.',
    image_url: '/ny-hoodie.jpg',
    sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL']),
    stock: 78,
    featured: 1,
  }
];

async function seed() {
  const db = getDB();

  // Clear existing tables
  console.log('Clearing database tables for fresh seed...');
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM cart_items').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM users').run();

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password, role)
    VALUES (?, ?, ?, ?)
  `).run('Admin', 'admin@shirtstudio.com', hashedPassword, 'admin');

  // Seed products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, team, league, type, price, description, image_url, sizes, stock, featured)
    VALUES (@name, @team, @league, @type, @price, @description, @image_url, @sizes, @stock, @featured)
  `);

  const insertMany = db.transaction((items) => {
    for (const item of items) insertProduct.run(item);
  });

  insertMany(products);
  console.log(`✅ Seeded ${products.length} products and 1 admin user.`);
  console.log('Admin: admin@shirtstudio.com / admin123');
}

seed().catch(console.error);
