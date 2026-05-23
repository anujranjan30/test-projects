const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'data', 'flower_market.db');
const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      imageUrl TEXT,
      description TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customerName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      paymentStatus TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId INTEGER NOT NULL,
      productId INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      FOREIGN KEY(orderId) REFERENCES orders(id),
      FOREIGN KEY(productId) REFERENCES products(id)
    )`);

    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      if (err) return;
      if (row.count === 0) {
        const stmt = db.prepare('INSERT INTO products (name, category, price, stock, imageUrl, description) VALUES (?, ?, ?, ?, ?, ?)');
        [
          ['Red Roses Bouquet', 'Roses', 499, 20, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600', 'Fresh red roses bouquet.'],
          ['White Lily Bunch', 'Lilies', 399, 15, 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600', 'Elegant white lilies.'],
          ['Sunflower Basket', 'Sunflower', 549, 10, 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=600', 'Bright sunflower arrangement.'],
          ['Orchid Pot', 'Orchids', 799, 8, 'https://images.unsplash.com/photo-1565452344518-47fafa2ae7e9?w=600', 'Premium orchid pot.']
        ].forEach(p => stmt.run(p));
        stmt.finalize();
      }
    });
  });
}
initDb();

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json(rows);
  });
});

app.post('/api/products', (req, res) => {
  const { name, category, price, stock, imageUrl, description } = req.body;
  db.run(
    'INSERT INTO products (name, category, price, stock, imageUrl, description) VALUES (?, ?, ?, ?, ?, ?)',
    [name, category, price, stock, imageUrl, description],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create product' });
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const { name, category, price, stock, imageUrl, description } = req.body;
  db.run(
    'UPDATE products SET name=?, category=?, price=?, stock=?, imageUrl=?, description=? WHERE id=?',
    [name, category, price, stock, imageUrl, description, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to update product' });
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  db.run('DELETE FROM products WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to delete product' });
    res.json({ deleted: this.changes });
  });
});

app.post('/api/payment/simulate', (req, res) => {
  const success = Math.random() > 0.2;
  res.json({ paymentStatus: success ? 'SUCCESS' : 'FAILED', transactionId: 'TXN' + Date.now() });
});

app.post('/api/orders', (req, res) => {
  const { customerName, phone, address, cartItems, totalAmount, paymentStatus } = req.body;
  if (!customerName || !phone || !address || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  db.run(
    'INSERT INTO orders (customerName, phone, address, totalAmount, paymentStatus) VALUES (?, ?, ?, ?, ?)',
    [customerName, phone, address, totalAmount, paymentStatus],
    function (err) {
      if (err) return res.status(500).json({ error: 'Failed to create order' });
      const orderId = this.lastID;
      const stmt = db.prepare('INSERT INTO order_items (orderId, productId, qty, unitPrice) VALUES (?, ?, ?, ?)');
      cartItems.forEach(i => stmt.run(orderId, i.id, i.qty, i.price));
      stmt.finalize();
      res.json({ orderId });
    }
  );
});

app.get('/api/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders' });
    res.json(rows);
  });
});

const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log('FlowerMarket running on http://localhost:' + PORT);
  console.log('Network access enabled on port ' + PORT);
});

<<<<<<< HEAD
=======
app.delete('/api/products/:id', (req,res)=>{
  db.run('DELETE FROM products WHERE id=?',[req.params.id], function(e){
    if(e) return res.status(500).json({error:'failed'});
    res.json({deleted:this.changes});
  });
});

app.post('/api/payment/simulate', (req,res)=>{
  const ok = Math.random()>0.2;
  res.json({paymentStatus: ok?'SUCCESS':'FAILED', transactionId:'TXN'+Date.now()});
});

app.post('/api/orders', (req,res)=>{
  const {customerName,phone,address,cartItems,totalAmount,paymentStatus}=req.body;
  db.run('INSERT INTO orders (customerName, phone, address, totalAmount, paymentStatus) VALUES (?, ?, ?, ?, ?)',
    [customerName,phone,address,totalAmount,paymentStatus], function(e){
      if(e) return res.status(500).json({error:'failed'});
      const orderId=this.lastID;
      const s=db.prepare('INSERT INTO order_items (orderId, productId, qty, unitPrice) VALUES (?, ?, ?, ?)');
      (cartItems||[]).forEach(i=>s.run(orderId,i.id,i.qty,i.price)); s.finalize();
      res.json({orderId});
  });
});

app.get('/api/orders',(req,res)=>{
  db.all('SELECT * FROM orders ORDER BY id DESC',[],(e,rows)=> e?res.status(500).json({error:'failed'}):res.json(rows));
});

app.listen(PORT, HOST, () => {
  console.log('FlowerMarket running on http://localhost:' + PORT);
});

>>>>>>> 6caef8e (Fix server.js startup log syntax)

