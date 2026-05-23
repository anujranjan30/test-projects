const API='/api';
let cart = JSON.parse(localStorage.getItem('cart')||'[]');
const box = document.getElementById('cartItems');
const totalEl = document.getElementById('total');

function render(){
  if(!cart.length){ box.innerHTML='<p>Cart is empty</p>'; totalEl.textContent=''; return; }
  box.innerHTML = cart.map((i,idx)=>`<div class="card"><b>${i.name}</b> - ₹${i.price} x ${i.qty} <button onclick="removeItem(${idx})">Remove</button></div>`).join('');
  totalEl.textContent = 'Total: ₹' + cart.reduce((s,i)=>s+i.price*i.qty,0);
}
function removeItem(i){ cart.splice(i,1); localStorage.setItem('cart',JSON.stringify(cart)); render(); }

async function payAndOrder(){
  const customerName=document.getElementById('name').value.trim();
  const phone=document.getElementById('phone').value.trim();
  const address=document.getElementById('address').value.trim();
  if(!customerName||!phone||!address||!cart.length) return alert('Fill all fields and add products');
  const pay = await fetch(`${API}/payment/simulate`,{method:'POST'}).then(r=>r.json());
  if(pay.paymentStatus==='FAILED'){ document.getElementById('msg').textContent='Payment failed. Try again.'; return; }
  const totalAmount = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const order = await fetch(`${API}/orders`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName,phone,address,cartItems:cart,totalAmount,paymentStatus:pay.paymentStatus})}).then(r=>r.json());
  localStorage.removeItem('cart'); cart=[]; render();
  document.getElementById('msg').textContent=`Order placed successfully! Order ID: ${order.orderId}, Txn: ${pay.transactionId}`;
}
window.payAndOrder=payAndOrder; window.removeItem=removeItem; render();
