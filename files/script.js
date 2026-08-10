/* ==================================================================
   STRAND & CO. — STORE LOGIC
   Plain JavaScript, no build step, no framework.
   Edit the CONFIG section below to set up your store.
   ================================================================== */

/* ==================================================================
   1. PRODUCTS — EDIT THIS LIST TO ADD / REMOVE / CHANGE PRODUCTS
   ------------------------------------------------------------------
   - "id"    : must be unique, no spaces (used internally, never shown)
   - "name"  : shown on the site
   - "price" : a plain number, in EGP, no currency symbol
   - "image" : path to the file inside the Images/ folder
   Add a new product by copying one of the blocks below and editing it.
   ================================================================== */
const PRODUCTS = [
  {
    id: "Eye Blue String",
    name: "Eye Blue String",
    price: 300,
    image: "Images/IMG_5467.PNG"
  },
  {
    id: "Pink & Black Necklace",
    name: "Pink & Black Necklace",
    price: 400,
    image: "Images/IMG_5478.PNG"
  },
  {
    id: "3 Set String Purple Braclete",
    name: "3 Set String Purple Braclete ",
    price: 800,
    image: "Images/IMG_5470.PNG"
  },
  {
    id: "2 Baby Blue String Braclete",
    name: "2 Baby Blue String Braclet",
    price: 500, 
    image: "Images/IMG_5473.PNG"
  },
  {
    id: "White Neckless",
    name: "White Neckless",
    price: 350,
    image: "Images/IMG_5451.png"
  },
  {
    id: "Black Glossy Men Braclete",
    name: "Black Glossy Men Braclete",
    price: 300,
    image: "Images/IMG_5481.jpg"
  }
  {
    id: "Blue Eye Braclete & White Star Neckless",
    name: "Blue Eye Braclete & White Star Neckless",
    price: 850,
    image: "Images/Image1.png"
  }
  {
    id: "Brown Simple 3qeq Men Braclete",
    name: "Brown Simple 3qeq Men Braclete",
    price: 350,
    image: "Images/Image2.png"
  }
  {
    id: "Blue Eye Beaded Braclete",
    name: "Blue Eye Beaded Braclete",
    price: 250,
    image: "Images/Image3.png"
  }
  {
    id: "Black & White Men Braclete",
    name: "Black & White Men Braclete",
    price: 550,
    image: "Images/Image4.png"
  }
];

/* ==================================================================
   2. TELEGRAM CONFIG — EDIT THESE TWO VALUES
   ------------------------------------------------------------------
   TELEGRAM_BOT_TOKEN : from @BotFather, looks like 123456789:AAF...
   TELEGRAM_CHAT_ID   : the chat/user/channel ID that should receive
                        order notifications
   ================================================================== */
const TELEGRAM_BOT_TOKEN = "7585577998:AAGc_R2Clo26z0KHr0rlEXjueYdtYDhJ-sg";
const TELEGRAM_CHAT_ID   = "6524914278";
const TELEGRAM_API = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN;

/* ==================================================================
   3. PAYMENT CONFIG
   ================================================================== */
const INSTAPAY_USERNAME = "@mikozfarouk";
const INSTAPAY_PHONE    = "01005036602";
const INSTAPAY_LINK     = "https://ipn.eg/S/mikozfarouk2013/instapay/9C41ZJ";

// EDIT THESE ONCE YOU HAVE YOUR TELDA DETAILS:
const TELDA_USERNAME = "@malekfarouk";
const TELDA_PHONE    = "01005036602";

/* ==================================================================
   4. STORE CONFIG
   ================================================================== */
const INSTAGRAM_URL = "https://www.instagram.com/accsesorize2026?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
const DELIVERY_FEE  = 75; // flat delivery fee in EGP

// Provinces and their supported cities — dependent dropdown data
const LOCATIONS = {
  "Giza": ["6th of October", "Sheikh Zayed", "Giza", "Hadayeq Ahram", "Faisal", "Haram", "Dokki", "Mohandessin"],
  "Cairo": ["Helwan", "Maadi", "Old Cairo", "Zamalek", "Shorouq", "Nasr City", "New Cairo", "Heliopolis"]
};

/* ==================================================================
   STATE
   ================================================================== */
let cart = [];               // [{ id, name, price, image, qty }]
let selectedPaymentMethod = null; // "instapay" | "telda"

/* ==================================================================
   INIT
   ================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  document.getElementById("instagram-link").href = INSTAGRAM_URL;
  document.getElementById("instagram-link-footer").href = INSTAGRAM_URL;

  document.getElementById("ip-username").textContent = INSTAPAY_USERNAME;
  document.getElementById("ip-phone").textContent = INSTAPAY_PHONE;
  document.getElementById("ip-link").href = INSTAPAY_LINK;
  document.getElementById("td-username").textContent = TELDA_USERNAME;
  document.getElementById("td-phone").textContent = TELDA_PHONE;

  loadCartFromStorage();
  renderProducts();
  renderCart();
  populateProvinces();
  bindEvents();
});

/* ==================================================================
   PRODUCT RENDERING
   ================================================================== */
function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  PRODUCTS.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-media">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy"
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22><rect width=%22400%22 height=%22400%22 fill=%22%23EFE7D8%22/></svg>'">
      </div>
      <div class="product-body">
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-price">EGP ${formatNumber(product.price)}</div>
        <div class="product-footer">
          <div class="qty-stepper" data-id="${product.id}">
            <button type="button" class="qty-minus" aria-label="Decrease quantity">−</button>
            <span class="qty-value">1</span>
            <button type="button" class="qty-plus" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="add-btn" data-id="${product.id}">Add to cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Quantity steppers on product cards
  grid.querySelectorAll(".qty-stepper").forEach(stepper => {
    const valueEl = stepper.querySelector(".qty-value");
    stepper.querySelector(".qty-minus").addEventListener("click", () => {
      let v = parseInt(valueEl.textContent, 10);
      if (v > 1) valueEl.textContent = v - 1;
    });
    stepper.querySelector(".qty-plus").addEventListener("click", () => {
      let v = parseInt(valueEl.textContent, 10);
      valueEl.textContent = v + 1;
    });
  });

  // Add to cart buttons
  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const stepper = grid.querySelector(`.qty-stepper[data-id="${id}"]`);
      const qty = parseInt(stepper.querySelector(".qty-value").textContent, 10);
      addToCart(id, qty);
      stepper.querySelector(".qty-value").textContent = "1";
      btn.textContent = "Added ✓";
      btn.classList.add("added");
      setTimeout(() => {
        btn.textContent = "Add to cart";
        btn.classList.remove("added");
      }, 1200);
    });
  });
}

/* ==================================================================
   CART LOGIC
   ================================================================== */
function addToCart(productId, qty) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty });
  }
  saveCartToStorage();
  renderCart();
  openCart();
}

function updateCartQty(productId, newQty) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  if (newQty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  } else {
    item.qty = newQty;
  }
  saveCartToStorage();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCartToStorage();
  renderCart();
}

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartItemCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function saveCartToStorage() {
  try {
    localStorage.setItem("strandco_cart", JSON.stringify(cart));
  } catch (e) {
    console.warn("Could not save cart to localStorage:", e);
  }
}

function loadCartFromStorage() {
  try {
    const stored = localStorage.getItem("strandco_cart");
    if (stored) cart = JSON.parse(stored);
  } catch (e) {
    cart = [];
  }
}

function renderCart() {
  const itemsEl = document.getElementById("cart-items");
  const countEl = document.getElementById("cart-count");
  const count = cartItemCount();

  countEl.textContent = count;
  countEl.classList.toggle("hidden", count === 0);

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 4h2l2.4 12.4A2 2 0 0 0 9.36 18H18a2 2 0 0 0 1.96-1.6L21.5 8H6"/><circle cx="10" cy="21" r="1.2"/><circle cx="18" cy="21" r="1.2"/></svg>
        <p>Your cart is empty.<br>Add a bracelet or two.</p>
      </div>`;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-line" data-id="${item.id}">
        <img src="${item.image}" alt="${escapeHtml(item.name)}"
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22><rect width=%2264%22 height=%2264%22 fill=%22%23EFE7D8%22/></svg>'">
        <div class="cart-line-info">
          <div class="cart-line-top">
            <span class="cart-line-name">${escapeHtml(item.name)}</span>
            <button class="remove-btn" data-id="${item.id}">Remove</button>
          </div>
          <div class="cart-line-price">EGP ${formatNumber(item.price)}</div>
          <div class="cart-line-bottom">
            <div class="qty-stepper" data-cart-id="${item.id}">
              <button type="button" class="cart-qty-minus" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.qty}</span>
              <button type="button" class="cart-qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <span style="font-weight:700;font-size:14px;">EGP ${formatNumber(item.price * item.qty)}</span>
          </div>
        </div>
      </div>
    `).join("");

    itemsEl.querySelectorAll(".remove-btn").forEach(btn => {
      btn.addEventListener("click", () => removeFromCart(btn.getAttribute("data-id")));
    });
    itemsEl.querySelectorAll(".qty-stepper").forEach(stepper => {
      const id = stepper.getAttribute("data-cart-id");
      const valueEl = stepper.querySelector(".qty-value");
      stepper.querySelector(".cart-qty-minus").addEventListener("click", () => {
        updateCartQty(id, parseInt(valueEl.textContent, 10) - 1);
      });
      stepper.querySelector(".cart-qty-plus").addEventListener("click", () => {
        updateCartQty(id, parseInt(valueEl.textContent, 10) + 1);
      });
    });
  }

  const subtotal = cartSubtotal();
  const delivery = cart.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  document.getElementById("cart-subtotal").textContent = "EGP " + formatNumber(subtotal);
  document.getElementById("cart-delivery").textContent = "EGP " + formatNumber(delivery);
  document.getElementById("cart-total").textContent = "EGP " + formatNumber(total);
  document.getElementById("checkout-total").textContent = "EGP " + formatNumber(total);

  const checkoutBtn = document.getElementById("checkout-btn");
  checkoutBtn.disabled = cart.length === 0;
}

/* ==================================================================
   CART DRAWER OPEN / CLOSE
   ================================================================== */
function openCart() {
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
}
function closeCart() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
}

/* ==================================================================
   ADDRESS DROPDOWNS
   ================================================================== */
function populateProvinces() {
  const provinceSelect = document.getElementById("province");
  Object.keys(LOCATIONS).forEach(province => {
    const opt = document.createElement("option");
    opt.value = province;
    opt.textContent = province;
    provinceSelect.appendChild(opt);
  });
}

function populateCities(province) {
  const citySelect = document.getElementById("city");
  citySelect.innerHTML = "";
  if (!province || !LOCATIONS[province]) {
    citySelect.innerHTML = `<option value="">Select province first</option>`;
    citySelect.disabled = true;
    return;
  }
  citySelect.disabled = false;
  citySelect.innerHTML = `<option value="">Select city</option>` +
    LOCATIONS[province].map(city => `<option value="${city}">${city}</option>`).join("");
}

/* ==================================================================
   CHECKOUT MODAL
   ================================================================== */
function openCheckout() {
  if (cart.length === 0) return;
  closeCart();
  document.getElementById("checkout-overlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeCheckout() {
  document.getElementById("checkout-overlay").classList.add("hidden");
  document.body.style.overflow = "";
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;
  document.querySelectorAll(".pay-option").forEach(el => {
    el.classList.toggle("selected", el.getAttribute("data-method") === method);
  });
  document.getElementById("instapay-details").classList.toggle("hidden", method !== "instapay");
  document.getElementById("telda-details").classList.toggle("hidden", method !== "telda");
  document.getElementById("screenshot-field").classList.toggle("hidden", !method);
}

/* ==================================================================
   FORM VALIDATION
   ================================================================== */
function setFieldValid(fieldEl) {
  fieldEl.closest(".field").classList.remove("invalid");
}
function setFieldInvalid(fieldEl) {
  fieldEl.closest(".field").classList.add("invalid");
}

function validateCheckoutForm() {
  let valid = true;
  const form = document.getElementById("checkout-form");

  const requiredFields = ["cust-name", "cust-phone", "cust-email", "province", "city", "area", "street", "building"];
  requiredFields.forEach(id => {
    const el = document.getElementById(id);
    if (!el.value || !el.value.trim()) {
      setFieldInvalid(el);
      valid = false;
    } else {
      setFieldValid(el);
    }
  });

  // simple phone check: digits only, 10-15 chars
  const phoneEl = document.getElementById("cust-phone");
  const phoneDigits = phoneEl.value.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    setFieldInvalid(phoneEl);
    valid = false;
  }

  // simple email check
  const emailEl = document.getElementById("cust-email");
  if (emailEl.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
    setFieldInvalid(emailEl);
    valid = false;
  }

  if (!selectedPaymentMethod) {
    document.getElementById("submit-status").textContent = "Please choose a payment method.";
    valid = false;
  }

  const screenshotInput = document.getElementById("payment-screenshot");
  const screenshotField = document.getElementById("screenshot-field");
  if (selectedPaymentMethod && (!screenshotInput.files || screenshotInput.files.length === 0)) {
    screenshotField.classList.add("invalid");
    valid = false;
  } else {
    screenshotField.classList.remove("invalid");
  }

  return valid;
}

/* ==================================================================
   ORDER ID / DATE
   ================================================================== */
function generateOrderId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${y}${m}${d}-${rand}`;
}

function formatOrderDate() {
  const now = new Date();
  return now.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

/* ==================================================================
   TELEGRAM INTEGRATION
   ------------------------------------------------------------------
   Everything below talks directly to the Telegram Bot API from the
   browser (no backend). See the note at the bottom of this file about
   the Accept/Reject buttons limitation.
   ================================================================== */

function buildTelegramOrderText(order) {
  const productLines = order.items.map(item =>
    `${item.name} × ${item.qty}\nEGP ${formatNumber(item.price * item.qty)}`
  ).join("\n\n");

  const paymentLabel = order.paymentMethod === "instapay" ? "InstaPay" : "Telda";

  return (
`🛍️ <b>NEW ORDER</b>

Order ID: #${order.orderId}
Date: ${order.date}

<b>Customer</b>
Name: ${escapeHtml(order.customer.name)}
Phone: ${escapeHtml(order.customer.phone)}
Email: ${escapeHtml(order.customer.email)}

📍 <b>DELIVERY ADDRESS</b>
Province: ${escapeHtml(order.address.province)}
City: ${escapeHtml(order.address.city)}
Area: ${escapeHtml(order.address.area)}
Street: ${escapeHtml(order.address.street)}
Building: ${escapeHtml(order.address.building)}
Floor: ${escapeHtml(order.address.floor || "-")}
Door: ${escapeHtml(order.address.door || "-")}

🛒 <b>PRODUCTS</b>
${productLines}

Subtotal: EGP ${formatNumber(order.subtotal)}
Delivery: EGP ${formatNumber(order.delivery)}
💰 <b>TOTAL: EGP ${formatNumber(order.total)}</b>

💳 <b>PAYMENT</b>
Method: ${paymentLabel}
Payment proof: Attached below

📝 <b>NOTES</b>
${order.notes ? escapeHtml(order.notes) : "—"}`
  );
}

async function sendTelegramMessage(text, replyMarkup) {
  const body = {
    chat_id: TELEGRAM_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

// Sends the ordered products' images together as an album.
// Images are referenced by their public URL (this only works once the
// site is live on Netlify, since Telegram fetches the image itself).
async function sendTelegramProductImages(order) {
  const origin = window.location.origin + window.location.pathname.replace(/index\.html$/, "");
  const media = order.items.map((item, i) => {
    const absoluteUrl = new URL(item.image, origin).href;
    const entry = { type: "photo", media: absoluteUrl };
    if (i === 0) {
      entry.caption = `Products for order #${order.orderId}`;
    }
    return entry;
  });

  // sendMediaGroup requires at least 2 items; fall back to sendPhoto for a single product
  if (media.length === 1) {
    return fetch(`${TELEGRAM_API}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: media[0].media,
        caption: media[0].caption || `Product for order #${order.orderId}`
      })
    }).then(r => r.json());
  }

  const res = await fetch(`${TELEGRAM_API}/sendMediaGroup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, media })
  });
  return res.json();
}

// Sends the uploaded payment screenshot as an actual file upload
// (multipart/form-data), so it works even before the images are public.
async function sendTelegramPaymentScreenshot(file, order) {
  const formData = new FormData();
  formData.append("chat_id", TELEGRAM_CHAT_ID);
  formData.append("caption", `Payment proof for order #${order.orderId} (${order.paymentMethod})`);
  formData.append("photo", file, file.name);

  const res = await fetch(`${TELEGRAM_API}/sendPhoto`, {
    method: "POST",
    body: formData
  });
  return res.json();
}

async function submitOrderToTelegram(order, screenshotFile) {
  // 1. Order summary text, with Accept / Reject inline buttons.
  //    NOTE: see the limitation explained at the bottom of this file —
  //    pressing these buttons will not trigger any automated action.
  const replyMarkup = {
    inline_keyboard: [[
      { text: "✅ ACCEPT ORDER", callback_data: `accept_${order.orderId}` },
      { text: "❌ REJECT ORDER", callback_data: `reject_${order.orderId}` }
    ]]
  };
  await sendTelegramMessage(buildTelegramOrderText(order), replyMarkup);

  // 2. Product image(s)
  await sendTelegramProductImages(order);

  // 3. Payment screenshot
  await sendTelegramPaymentScreenshot(screenshotFile, order);
}

/* ==================================================================
   FORM SUBMIT HANDLER
   ================================================================== */
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const statusEl = document.getElementById("submit-status");
  statusEl.textContent = "";

  if (!validateCheckoutForm()) {
    statusEl.textContent = "Please check the highlighted fields.";
    return;
  }

  const order = {
    orderId: generateOrderId(),
    date: formatOrderDate(),
    items: cart,
    subtotal: cartSubtotal(),
    delivery: DELIVERY_FEE,
    total: cartSubtotal() + DELIVERY_FEE,
    customer: {
      name: document.getElementById("cust-name").value.trim(),
      phone: document.getElementById("cust-phone").value.trim(),
      email: document.getElementById("cust-email").value.trim()
    },
    address: {
      province: document.getElementById("province").value,
      city: document.getElementById("city").value,
      area: document.getElementById("area").value.trim(),
      street: document.getElementById("street").value.trim(),
      building: document.getElementById("building").value.trim(),
      floor: document.getElementById("floor").value.trim(),
      door: document.getElementById("door").value.trim()
    },
    paymentMethod: selectedPaymentMethod,
    notes: document.getElementById("order-notes").value.trim()
  };

  const screenshotInput = document.getElementById("payment-screenshot");
  const screenshotFile = screenshotInput.files[0];

  const submitBtn = document.getElementById("place-order-btn");
  submitBtn.disabled = true;
  statusEl.textContent = "Sending your order…";

  // If the bot token/chat ID haven't been set up yet, don't attempt the call —
  // just tell the developer (Malek) clearly instead of failing silently.
  if (TELEGRAM_BOT_TOKEN.includes("PUT_YOUR") || TELEGRAM_CHAT_ID.includes("PUT_YOUR")) {
    statusEl.textContent = "Telegram isn't configured yet — add your bot token and chat ID in script.js.";
    submitBtn.disabled = false;
    return;
  }

  try {
    await submitOrderToTelegram(order, screenshotFile);
    completeOrder(order);
  } catch (err) {
    console.error("Order failed to send:", err);
    statusEl.textContent = "Something went wrong sending your order. Please try again or contact us directly.";
    submitBtn.disabled = false;
  }
}

function completeOrder(order) {
  cart = [];
  saveCartToStorage();
  renderCart();
  closeCheckout();
  document.getElementById("checkout-form").reset();
  selectedPaymentMethod = null;
  document.querySelectorAll(".pay-option").forEach(el => el.classList.remove("selected"));
  document.getElementById("instapay-details").classList.add("hidden");
  document.getElementById("telda-details").classList.add("hidden");
  document.getElementById("screenshot-field").classList.add("hidden");
  document.getElementById("upload-preview").classList.add("hidden");
  document.getElementById("place-order-btn").disabled = false;
  document.getElementById("submit-status").textContent = "";

  document.getElementById("success-order-id").textContent = order.orderId;
  document.getElementById("success-overlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

/* ==================================================================
   EVENT BINDINGS
   ================================================================== */
function bindEvents() {
  // Mobile hamburger menu
  const hamburger = document.getElementById("hamburger-btn");
  const nav = document.getElementById("main-nav");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      nav.classList.remove("open");
    });
  });

  // Cart drawer
  document.getElementById("cart-btn").addEventListener("click", openCart);
  document.getElementById("cart-close-btn").addEventListener("click", closeCart);
  document.getElementById("cart-overlay").addEventListener("click", closeCart);
  document.getElementById("footer-cart-link").addEventListener("click", (e) => {
    e.preventDefault();
    openCart();
  });

  // Checkout modal
  document.getElementById("checkout-btn").addEventListener("click", openCheckout);
  document.getElementById("checkout-close-btn").addEventListener("click", closeCheckout);

  // Address dropdowns
  document.getElementById("province").addEventListener("change", (e) => {
    populateCities(e.target.value);
  });

  // Payment method selection
  document.querySelectorAll(".pay-option").forEach(el => {
    el.addEventListener("click", () => selectPaymentMethod(el.getAttribute("data-method")));
  });

  // Payment screenshot upload preview
  const screenshotInput = document.getElementById("payment-screenshot");
  screenshotInput.addEventListener("change", () => {
    const preview = document.getElementById("upload-preview");
    const label = document.getElementById("upload-label");
    if (screenshotInput.files && screenshotInput.files[0]) {
      const file = screenshotInput.files[0];
      preview.textContent = `✓ ${file.name}`;
      preview.classList.remove("hidden");
      label.textContent = "Change screenshot";
      document.getElementById("screenshot-field").classList.remove("invalid");
    } else {
      preview.classList.add("hidden");
      label.textContent = "Tap to upload a screenshot of your payment";
    }
  });

  // Checkout form submit
  document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);

  // Success modal
  document.getElementById("success-close-btn").addEventListener("click", () => {
    document.getElementById("success-overlay").classList.add("hidden");
    document.body.style.overflow = "";
  });
}

/* ==================================================================
   HELPERS
   ================================================================== */
function formatNumber(n) {
  return Number(n).toLocaleString("en-US");
}

function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* ==================================================================
   ⚠️ TELEGRAM ACCEPT / REJECT BUTTON LIMITATION — PLEASE READ
   ------------------------------------------------------------------
   This site sends the order message with "✅ ACCEPT ORDER" and
   "❌ REJECT ORDER" inline buttons attached, and Telegram will display
   them. However, when you tap one, NOTHING will happen automatically.

   Here's why: tapping an inline button sends a "callback_query" update
   from Telegram's servers to your bot. Something has to be running
   and listening for that update — either a webhook (a server endpoint
   Telegram calls) or a program doing long-polling (getUpdates in a
   loop). Both of those require a server process that stays running.

   A static site made of index.html + script.js only runs in the
   visitor's browser, only while that page is open, and has no way to
   receive events initiated by Telegram. There is no version of this
   that works from browser JavaScript alone — it's not a CORS issue,
   it's that "listen for an event and respond to it" requires
   something to be listening at all times, which a static file can't
   do.

   You still get real value from the buttons: you can see them, and if
   you want to track accept/reject decisions, the simplest options
   (without adding a Netlify Function / server) are:
     - Just reply in the Telegram chat/thread for that order manually.
     - Use a separate tool (e.g. a Telegram bot you run elsewhere, or
       a no-code automation platform like Zapier/Make with a Telegram
       trigger) to listen for callback_query and act on it — that's a
       backend, just one you don't have to build yourself.
   ================================================================== */
