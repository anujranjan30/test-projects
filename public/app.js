const API = '/api';
const cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(id) {
  const p = window._products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id: p.id, name: p.name, price: p.price, qty: 1 });
  saveCart();
  alert('Added to cart');
}

fetch(`${API}/products`)
  .then(r => r.json())
  .then(products => {
    window._products = products;
    const box = document.getElementById('products');
    box.innerHTML = products.map(p => `
      <div class="card">
        <img src="${p.imageUrl || ''}" alt="${p.name}"/>
        <h3>${p.name}</h3>
        <p>${p.category || ''}</p>
        <p>₹${p.price}</p>
        <button data-id="${p.id}">Add to Cart</button>
      </div>
    `).join('');

    box.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => addToCart(Number(btn.dataset.id)));
    });
  });
