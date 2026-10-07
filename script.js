const products={
  mango:{id:'mango',name:'Gujarati Mango Masala',price:95,img:'assets/gujarati-mango.jpg'},
  bhel:{id:'bhel',name:'Bombay Bhel Zing',price:95,img:'assets/bombay-bhel.jpg'},
  goan:{id:'goan',name:'Goan Herb & Lime',price:95,img:'assets/goan-herb-lime.jpg'},
  punjabi:{id:'punjabi',name:'Punjabi Cheese Tikka',price:95,img:'assets/punjabi-cheese-tikka.jpg'}
};
let cart=JSON.parse(localStorage.getItem('craveCart')||'{}');
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const nav=$('#nav'), progress=$('#progress'), cursor=$('#cursorGlow');
addEventListener('scroll',()=>{nav.classList.toggle('scrolled',scrollY>24); const max=document.documentElement.scrollHeight-innerHeight; progress.style.width=(max?scrollY/max*100:0)+'%';},{passive:true});
addEventListener('pointermove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}},{passive:true});

const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach(e=>io.observe(e));

$('#menuBtn').addEventListener('click',()=>$('#mobileMenu').classList.toggle('open'));
$$('.mobile-menu a').forEach(a=>a.addEventListener('click',()=>$('#mobileMenu').classList.remove('open')));

function save(){localStorage.setItem('craveCart',JSON.stringify(cart));renderCart();}
function add(id,qty=1){cart[id]=(cart[id]||0)+qty; if(cart[id]<=0)delete cart[id]; save(); toast(`${products[id].name} added to your CRAVE.`);}
function count(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function total(){return Object.entries(cart).reduce((sum,[id,q])=>sum+products[id].price*q,0)}
function renderCart(){
  $('#cartCount').textContent=count();
  const box=$('#cartItems'); box.innerHTML='';
  const entries=Object.entries(cart);
  if(!entries.length){box.innerHTML='<div class="empty-cart"><p>Your basket is waiting for a flavour.</p><a class="text-link" href="#flavours" onclick="closeCart()">Explore flavours →</a></div>';}
  entries.forEach(([id,q])=>{
    const p=products[id]; const el=document.createElement('div'); el.className='cart-item';
    el.innerHTML=`<img src="${p.img}" alt="${p.name}"><div><h4>${p.name}</h4><small>₹${p.price} each</small><div class="qty"><button data-act="minus" data-id="${id}">−</button><b>${q}</b><button data-act="plus" data-id="${id}">+</button></div></div><strong>₹${p.price*q}</strong>`;
    box.appendChild(el);
  });
  $('#cartTotal').textContent='₹'+total();
  $('#packNote').textContent=Object.values(cart).length===4 && Object.values(cart).every(q=>q>=1)?'Full four-flavour pack: ₹380 total.':'Add all four flavours for the full ₹380 range.';
}
$('#cartItems').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;add(b.dataset.id,b.dataset.act==='plus'?1:-1)});
$$('.add-btn').forEach(b=>b.addEventListener('click',()=>add(b.dataset.id)));
$('#packFour').addEventListener('click',()=>{Object.keys(products).forEach(id=>cart[id]=Math.max(cart[id]||0,1));save();toast('All four flavours added — ₹380 total.');openCart();});
function openCart(){renderCart();$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false')}
function closeCart(){ $('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true') }
$('#openCart').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);$('#closeCartBackdrop').addEventListener('click',closeCart);
window.closeCart=closeCart;

$('#checkoutBtn').addEventListener('click',()=>{if(!count()){toast('Add a flavour before continuing.');return}$('#checkoutModal').classList.add('open');$('#checkoutModal').setAttribute('aria-hidden','false')});
$('#closeCheckout').addEventListener('click',()=>$('#checkoutModal').classList.remove('open'));
$('#checkoutForm').addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.target);const order=Object.entries(cart).map(([id,q])=>`${products[id].name} × ${q}`).join(', ');const ref='CRV-'+Math.random().toString(36).slice(2,7).toUpperCase();localStorage.setItem('lastCraveOrder',JSON.stringify({ref,name:fd.get('name'),phone:fd.get('phone'),route:fd.get('route'),items:order,total:total()}));$('#checkoutModal').classList.remove('open');closeCart();toast(`Order request ${ref} received — ₹${total()}.`);cart={};save();e.target.reset();});

$('#recipeBtn').addEventListener('click',()=>toast('CRAVE Lab recipe wall: four seed ideas + reviewed customer creations.'));

function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove('show'),2600)}
renderCart();
