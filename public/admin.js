const API = '/api';

async function load() {
  const products = await fetch(`${API}/products`).then(r => r.json());
  window._products = products;
  const container = document.getElementById('adminProducts');
  container.innerHTML = products.map(p => `
    <div class="card">
      <b>${p.name}</b> - ₹${p.price} (Stock: ${p.stock})<br/>
      <button data-edit="${p.id}">Edit</button>
      <button data-del="${p.id}">Delete</button>
    </div>
  `).join('');

  container.querySelectorAll('button[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => edit(Number(btn.dataset.edit)));
  });
  container.querySelectorAll('button[data-del]').forEach(btn => {
    btn.addEventListener('click', () => del(Number(btn.dataset.del)));
  });
}

function edit(id) {
  const p = window._products.find(x => x.id === id);
  if (!p) return;
  ['id', 'name', 'category', 'price', 'stock', 'imageUrl', 'description'].forEach(k => {
    document.getElementById(k).value = p[k] ?? '';
  });
}

function resetForm() {
  ['id', 'name', 'category', 'price', 'stock', 'imageUrl', 'description'].forEach(k => {
    document.getElementById(k).value = '';
  });
}

async function saveProduct() {
  const data = {
    name: document.getElementById('name').value,
    category: document.getElementById('category').value,
    price: Number(document.getElementById('price').value),
    stock: Number(document.getElementById('stock').value),
    imageUrl: document.getElementById('imageUrl').value,
    description: document.getElementById('description').value
  };

  const id = document.getElementById('id').value;
  const url = id ? `${API}/products/${id}` : `${API}/products`;
  const method = id ? 'PUT' : 'POST';

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  resetForm();
  load();
}

async function del(id) {
  await fetch(`${API}/products/${id}`, { method: 'DELETE' });
  load();
}

window.saveProduct = saveProduct;
window.resetForm = resetForm;
load();
