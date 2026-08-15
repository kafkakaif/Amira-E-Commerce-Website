// Amira E-commerce Shop, Cart, and Checkout Client Logic (Rev 1)

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsGrid')) {
    initShopPage();
  }
  if (document.getElementById('productDetailContainer')) {
    initProductDetailPage();
  }
  if (document.getElementById('cartItemsContainer')) {
    initCartPage();
  }
  if (document.getElementById('checkoutForm')) {
    initCheckoutPage();
  }
  setupFastAddToCart();
  
  // Listen to currency changes to redraw prices
  window.addEventListener('currencychange', () => {
    window.updateDomPrices();
    
    // Refresh page sections that calculate summaries dynamically
    if (document.getElementById('cartItemsContainer')) {
      initCartPage();
    }
    if (document.getElementById('checkoutForm')) {
      initCheckoutPage();
    }
  });
});

// Helper: Show alert banners
function showAlert(elementId, message, type = 'success') {
  const alertBox = document.getElementById(elementId);
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
  alertBox.classList.remove('d-none');
  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 4500);
}

// Get default size based on product category
function getDefaultSizeForCategory(category, name = '') {
  if (category === 'Shoes & Jewellery') {
    if (name.toLowerCase().includes('juttis') || name.toLowerCase().includes('shoes')) {
      return 'US 8';
    }
    return 'One Size';
  }
  return 'M';
}

// ----------------------------------------------------
// 1. SHOP PORTAL CODE
// ----------------------------------------------------
let searchTimeout;

function initShopPage() {
  const searchInput = document.getElementById('searchInput');
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceRangeValue');
  const clearBtn = document.getElementById('clearFiltersBtn');
  const categories = document.querySelectorAll('.filter-category');

  if (priceRange && priceValue) {
    priceValue.textContent = window.formatPrice(priceRange.value);
  }

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(fetchFilteredProducts, 300);
  });

  priceRange.addEventListener('input', (e) => {
    priceValue.textContent = window.formatPrice(e.target.value);
    fetchFilteredProducts();
  });

  categories.forEach(checkbox => {
    checkbox.addEventListener('change', fetchFilteredProducts);
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    priceRange.value = 600;
    if (priceValue) priceValue.textContent = window.formatPrice(600);
    categories.forEach(cb => cb.checked = false);
    fetchFilteredProducts();
  });

  fetchFilteredProducts();
}

async function fetchFilteredProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const search = document.getElementById('searchInput').value;
  const priceMax = document.getElementById('priceRange').value;
  
  const selectedCategories = [];
  document.querySelectorAll('.filter-category:checked').forEach(cb => {
    selectedCategories.push(cb.value);
  });

  let url = `/api/products?priceMax=${priceMax}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (selectedCategories.length === 1) {
    url += `&category=${encodeURIComponent(selectedCategories[0])}`;
  }

  try {
    const res = await fetch(url);
    const products = await res.json();

    if (!res.ok) throw new Error(products.error);

    let filtered = products;
    if (selectedCategories.length > 1) {
      filtered = products.filter(p => selectedCategories.includes(p.category));
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="text-center py-5 text-muted col-12">
          <i class="bi bi-search fs-2"></i>
          <div class="mt-3">No creations match your active filters.</div>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(product => {
      const defaultSize = getDefaultSizeForCategory(product.category, product.name);
      html += `
        <div class="col-12 col-sm-6 col-lg-4">
          <div class="card editorial-card">
            <div class="card-img-container">
              <img src="${product.image_url}" alt="${product.name}">
              <div class="card-btn-group">
                <a href="/product.html?id=${product.id}" class="btn btn-light btn-card-action">Details</a>
                <button class="btn btn-dark btn-card-action btn-add-cart" data-id="${product.id}" data-size="${defaultSize}">Add to Bag</button>
              </div>
            </div>
            <div class="card-body-editorial">
              <div class="product-cat">${product.category}</div>
              <h3 class="product-title-serif">${product.name}</h3>
              <p class="product-desc-short">${product.description || ''}</p>
              <div class="product-price-bronze" data-price="${product.price}">${window.formatPrice(product.price)}</div>
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
    
    // Trigger currency conversions
    window.updateDomPrices();
  } catch (error) {
    grid.innerHTML = `<div class="text-danger text-center col-12">Failed to load catalog: ${error.message}</div>`;
  }
}

// ----------------------------------------------------
// 2. PRODUCT DETAIL PAGE CODE
// ----------------------------------------------------
async function initProductDetailPage() {
  const container = document.getElementById('productDetailContainer');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    container.innerHTML = '<div class="alert alert-danger col-12">Invalid Product Reference ID.</div>';
    return;
  }

  try {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();

    if (!res.ok) {
      container.innerHTML = `<div class="alert alert-danger col-12">${product.error || 'Product not found.'}</div>`;
      return;
    }

    document.title = `${product.name} | Amira`;

    // Populate Size Selector options
    let sizeOptionsHtml = '';
    let hasAvailableStock = false;
    
    if (product.sizes && product.sizes.length > 0) {
      product.sizes.forEach(sz => {
        const outOfStock = sz.stock <= 0 ? ' (Out of Stock)' : ` (${sz.stock} left)`;
        const disabled = sz.stock <= 0 ? 'disabled' : '';
        if (sz.stock > 0) hasAvailableStock = true;
        sizeOptionsHtml += `<option value="${sz.size}" ${disabled}>Size: ${sz.size}${outOfStock}</option>`;
      });
    } else {
      sizeOptionsHtml = `<option value="M">Size: M (10 left)</option>`;
      hasAvailableStock = true;
    }

    container.innerHTML = `
      <div class="col-lg-6">
        <div class="detail-img-container">
          <img src="${product.image_url}" alt="${product.name}" class="img-fluid">
        </div>
      </div>
      <div class="col-lg-6">
        <div>
          <span class="detail-meta-cat">${product.category}</span>
          <h1 class="detail-title-serif">${product.name}</h1>
          <div class="detail-price-editorial" data-price="${product.price}">${window.formatPrice(product.price)}</div>
          
          <p class="text-muted mb-4">${product.description || 'No detailed description logs logged.'}</p>
          
          <!-- Size Selector & Size Guide -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <label for="sizeSelect" class="form-label-editorial mb-0">Select Size</label>
              <a class="size-guide-link" data-bs-toggle="modal" data-bs-target="#sizeGuideModal"><i class="bi bi-rulers me-1"></i>Sizing Guide</a>
            </div>
            <select class="form-select form-select-editorial" id="sizeSelect">
              ${sizeOptionsHtml}
            </select>
          </div>

          <!-- Quantity Selection -->
          <div class="d-flex align-items-center gap-3 mb-5">
            <span class="form-label-editorial m-0">Quantity</span>
            <div class="d-flex align-items-center border rounded border-light">
              <button class="qty-btn" id="detailQtyMinus" type="button"><i class="bi bi-minus"></i></button>
              <input type="text" class="qty-input" id="detailQtyInput" value="1" readonly>
              <button class="qty-btn" id="detailQtyPlus" type="button"><i class="bi bi-plus"></i></button>
            </div>
            <span class="text-muted fs-7">(Total stock: <span id="detailProductStock">${product.stock}</span>)</span>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2">
            <button class="btn btn-editorial-dark py-3 flex-grow-1" id="detailAddCartBtn" ${!hasAvailableStock ? 'disabled' : ''}>
              ${hasAvailableStock ? 'Add to Shopping Bag' : 'Out of Stock'}
            </button>
            <button class="btn btn-editorial-outline py-3 px-4" id="detailBuyNowBtn" ${!hasAvailableStock ? 'disabled' : ''}>Buy Now</button>
          </div>
        </div>
      </div>
    `;

    // Trigger currency conversions immediately
    window.updateDomPrices();

    const qtyInput = document.getElementById('detailQtyInput');
    const sizeSelect = document.getElementById('sizeSelect');

    // Return stock for chosen size
    const getStockForSelectedSize = () => {
      const selectedSize = sizeSelect.value;
      const szObj = product.sizes.find(s => s.size === selectedSize);
      return szObj ? szObj.stock : 10;
    };

    document.getElementById('detailQtyMinus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });

    document.getElementById('detailQtyPlus').addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      const stockLimit = getStockForSelectedSize();
      if (val < stockLimit) qtyInput.value = val + 1;
    });

    sizeSelect.addEventListener('change', () => {
      // Reset quantity to 1 when changing sizes
      qtyInput.value = 1;
    });

    // Add to Cart
    document.getElementById('detailAddCartBtn').addEventListener('click', () => {
      addToCart(product.id, parseInt(qtyInput.value), sizeSelect.value);
    });

    // Buy Now
    document.getElementById('detailBuyNowBtn').addEventListener('click', async () => {
      const added = await addToCart(product.id, parseInt(qtyInput.value), sizeSelect.value, false);
      if (added) {
        window.location.href = '/cart.html';
      }
    });

    loadRelatedProducts(product.category, product.id);

  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger col-12">Connection error. Message: ${error.message}</div>`;
  }
}

async function loadRelatedProducts(category, currentId) {
  const container = document.getElementById('relatedProductsContainer');
  if (!container) return;

  try {
    const res = await fetch(`/api/products?category=${category}`);
    const products = await res.json();

    if (res.ok) {
      const related = products.filter(p => p.id !== currentId).slice(0, 4);

      if (related.length === 0) {
        container.innerHTML = '<div class="text-center text-muted w-100 col-12">No other creations listed under this category.</div>';
        return;
      }

      let html = '';
      related.forEach(product => {
        const defaultSize = getDefaultSizeForCategory(product.category, product.name);
        html += `
          <div class="col-md-6 col-lg-3">
            <div class="card editorial-card">
              <div class="card-img-container">
                <img src="${product.image_url}" alt="${product.name}">
                <div class="card-btn-group">
                  <a href="/product.html?id=${product.id}" class="btn btn-light btn-card-action">Details</a>
                  <button class="btn btn-dark btn-card-action btn-add-cart" data-id="${product.id}" data-size="${defaultSize}">Add</button>
                </div>
              </div>
              <div class="card-body-editorial">
                <h4 class="product-title-serif" style="font-size: 1.15rem;">${product.name}</h4>
                <div class="product-price-bronze" data-price="${product.price}">${window.formatPrice(product.price)}</div>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
      window.updateDomPrices();
    }
  } catch (error) {
    console.error('Failed to load related products:', error);
  }
}

// ----------------------------------------------------
// 3. CART SYSTEM LOGIC
// ----------------------------------------------------
async function initCartPage() {
  const container = document.getElementById('cartItemsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/cart');
    
    if (res.status === 401) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted col-12">
          <i class="bi bi-lock fs-2"></i>
          <div class="mt-2">Authentication required. Please log in to view items.</div>
          <a href="/login.html" class="btn btn-dark btn-sm rounded-pill mt-3 px-4 py-2">Go to Login</a>
        </div>
      `;
      document.getElementById('checkoutBtn').classList.add('disabled');
      return;
    }

    const items = await res.json();
    if (!res.ok) throw new Error(items.error);

    if (items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-5 text-muted col-12">
          <i class="bi bi-bag-x fs-2"></i>
          <div class="mt-2">Your shopping bag is empty.</div>
          <a href="/shop.html" class="btn btn-editorial-outline btn-sm mt-3">Commission Keepsakes</a>
        </div>
      `;
      document.getElementById('checkoutBtn').classList.add('disabled');
      updateCartSummary(0);
      return;
    }

    document.getElementById('checkoutBtn').classList.remove('disabled');

    let html = '';
    let subtotal = 0;

    items.forEach(item => {
      const itemSubtotal = item.price * item.quantity;
      subtotal += itemSubtotal;

      html += `
        <div class="cart-item-row" data-id="${item.product_id}" data-size="${item.size}">
          <!-- Desktop Layout (d-none d-md-flex) -->
          <div class="d-none d-md-flex row align-items-center g-3">
            <div class="col-auto">
              <img src="${item.image_url}" alt="${item.name}" class="cart-item-img">
            </div>
            <div class="col">
              <h4 class="cart-item-name mb-1">${item.name}</h4>
              <div class="text-muted fs-7">Size: <span class="fw-semibold text-dark">${item.size}</span></div>
            </div>
            <div class="col-md-3 d-flex align-items-center justify-content-center gap-3">
              <div class="d-flex align-items-center border rounded border-light">
                <button class="qty-btn btn-cart-qty-minus" data-id="${item.product_id}" data-size="${item.size}"><i class="bi bi-minus"></i></button>
                <input type="text" class="qty-input" value="${item.quantity}" readonly>
                <button class="qty-btn btn-cart-qty-plus" data-id="${item.product_id}" data-size="${item.size}" data-stock="${item.stock}"><i class="bi bi-plus"></i></button>
              </div>
            </div>
            <div class="col-md-2 text-end">
              <div class="fw-semibold text-dark" data-price="${itemSubtotal}">${window.formatPrice(itemSubtotal)}</div>
              <div class="text-muted fs-8" data-price="${item.price}">${window.formatPrice(item.price)} each</div>
            </div>
            <div class="col-md-1 text-end">
              <button class="btn text-danger btn-cart-remove p-1" data-id="${item.product_id}" data-size="${item.size}" aria-label="Remove item"><i class="bi bi-trash"></i></button>
            </div>
          </div>

          <!-- Mobile Card Layout (d-flex d-md-none) -->
          <div class="d-flex d-md-none cart-mobile-card">
            <img src="${item.image_url}" alt="${item.name}">
            <div class="cart-mobile-card-details">
              <div>
                <div class="d-flex justify-content-between align-items-start">
                  <h4 class="cart-mobile-card-title">${item.name}</h4>
                  <button class="btn text-danger btn-cart-remove p-0" data-id="${item.product_id}" data-size="${item.size}" aria-label="Remove item"><i class="bi bi-trash fs-5"></i></button>
                </div>
                <div class="cart-mobile-card-meta">Size: <span class="fw-semibold text-dark">${item.size}</span></div>
                <div class="cart-mobile-card-meta" data-price="${item.price}">${window.formatPrice(item.price)} each</div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div class="d-flex align-items-center border rounded border-light">
                  <button class="qty-btn btn-cart-qty-minus" data-id="${item.product_id}" data-size="${item.size}"><i class="bi bi-minus"></i></button>
                  <input type="text" class="qty-input" value="${item.quantity}" readonly>
                  <button class="qty-btn btn-cart-qty-plus" data-id="${item.product_id}" data-size="${item.size}" data-stock="${item.stock}"><i class="bi bi-plus"></i></button>
                </div>
                <div class="fw-bold text-dark fs-6" data-price="${itemSubtotal}">${window.formatPrice(itemSubtotal)}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    updateCartSummary(subtotal);
    setupCartActions();

  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger col-12">${error.message}</div>`;
  }
}

function updateCartSummary(subtotal) {
  const subTotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');
  if (subTotalEl) {
    subTotalEl.setAttribute('data-price', subtotal);
    subTotalEl.textContent = window.formatPrice(subtotal);
  }
  if (totalEl) {
    totalEl.setAttribute('data-price', subtotal);
    totalEl.textContent = window.formatPrice(subtotal);
  }
}

function setupCartActions() {
  // Quantity Minus
  document.querySelectorAll('.btn-cart-qty-minus').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pId = btn.getAttribute('data-id');
      const size = btn.getAttribute('data-size');
      const input = btn.nextElementSibling;
      const currentVal = parseInt(input.value);
      
      const newVal = currentVal - 1;
      await updateCartItemQuantity(pId, size, newVal);
    });
  });

  // Quantity Plus
  document.querySelectorAll('.btn-cart-qty-plus').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pId = btn.getAttribute('data-id');
      const size = btn.getAttribute('data-size');
      const stock = parseInt(btn.getAttribute('data-stock'));
      const input = btn.previousElementSibling;
      const currentVal = parseInt(input.value);

      if (currentVal >= stock) {
        showAlert('cartNotification', `Cannot add more. Only ${stock} units left in size ${size}.`, 'danger');
        return;
      }

      const newVal = currentVal + 1;
      await updateCartItemQuantity(pId, size, newVal);
    });
  });

  // Remove
  document.querySelectorAll('.btn-cart-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const pId = btn.getAttribute('data-id');
      const size = btn.getAttribute('data-size');
      await removeCartItem(pId, size);
    });
  });
}

async function updateCartItemQuantity(productId, size, newQty) {
  try {
    const res = await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: newQty, size })
    });
    if (res.ok) {
      initCartPage();
      window.updateCartBadge();
    }
  } catch (error) {
    console.error('Failed to update quantity:', error);
  }
}

async function removeCartItem(productId, size) {
  try {
    const res = await fetch(`/api/cart/${productId}?size=${size}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      initCartPage();
      window.updateCartBadge();
    }
  } catch (error) {
    console.error('Failed to remove item:', error);
  }
}

// Core addToCart method supporting sizes
async function addToCart(productId, quantity = 1, size = 'M', showFeedback = true) {
  try {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, size })
    });

    if (res.status === 401) {
      window.location.href = '/login.html';
      return false;
    }

    const data = await res.json();
    const notifId = document.getElementById('shopNotification') ? 'shopNotification' : 'productNotification';

    if (res.ok) {
      if (showFeedback) {
        showAlert(notifId, `Item (Size: ${size}) added to shopping bag successfully.`, 'success');
      }
      window.updateCartBadge();
      return true;
    } else {
      showAlert(notifId, data.error || 'Failed to add item.', 'danger');
      return false;
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return false;
  }
}

// Grid quick Add-to-bag triggers
function setupFastAddToCart() {
  document.body.addEventListener('click', (e) => {
    const target = e.target.closest('.btn-add-cart, .btn-add-cart-fast');
    if (target) {
      e.preventDefault();
      const pId = target.getAttribute('data-id');
      const size = target.getAttribute('data-size') || 'M';
      addToCart(pId, 1, size);
    }
  });
}

// ----------------------------------------------------
// 4. CHECKOUT MANAGEMENT CODE
// ----------------------------------------------------
async function initCheckoutPage() {
  const form = document.getElementById('checkoutForm');
  const summaryList = document.getElementById('checkoutItemsList');
  if (!form || !summaryList) return;

  try {
    const res = await fetch('/api/cart');
    
    if (res.status === 401) {
      window.location.href = '/login.html';
      return;
    }

    const items = await res.json();
    if (!res.ok) throw new Error(items.error);

    if (items.length === 0) {
      window.location.href = '/shop.html';
      return;
    }

    let html = '';
    let total = 0;

    items.forEach(item => {
      const sub = item.price * item.quantity;
      total += sub;

      html += `
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <div class="fw-semibold text-dark" style="font-size: 0.95rem;">${item.name}</div>
            <div class="text-muted" style="font-size: 0.8rem;">Size: ${item.size} | Qty: ${item.quantity} x ${window.formatPrice(item.price)}</div>
          </div>
          <span class="fw-medium text-dark" style="font-size: 0.95rem;" data-price="${sub}">${window.formatPrice(sub)}</span>
        </div>
      `;
    });

    summaryList.innerHTML = html;
    
    const subTotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (subTotalEl) {
      subTotalEl.setAttribute('data-price', total);
      subTotalEl.textContent = window.formatPrice(total);
    }
    if (totalEl) {
      totalEl.setAttribute('data-price', total);
      totalEl.textContent = window.formatPrice(total);
    }

  } catch (error) {
    summaryList.innerHTML = `<div class="text-danger text-center">Failed to load order totals: ${error.message}</div>`;
  }

  // CC toggles
  const ccRadio = document.getElementById('payCreditCard');
  const bankRadio = document.getElementById('payBank');
  const ccBox = document.getElementById('creditCardDetails');

  if (ccRadio && bankRadio && ccBox) {
    ccRadio.addEventListener('change', () => ccBox.classList.remove('d-none'));
    bankRadio.addEventListener('change', () => ccBox.classList.add('d-none'));
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('checkoutAlert');
    alertBox.classList.add('d-none');

    const name = document.getElementById('shippingName').value;
    const address = document.getElementById('shippingAddressLine').value;
    const city = document.getElementById('shippingCity').value;
    const zip = document.getElementById('shippingZip').value;
    const phone = document.getElementById('shippingPhone').value;

    const fullShippingAddress = `${name}, Address: ${address}, ${city}, ZIP: ${zip}, Phone: ${phone}`;

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress: fullShippingAddress })
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = '/profile.html?ordered=true';
      } else {
        alertBox.textContent = data.error || 'Failed to place order.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error placing order.';
      alertBox.classList.remove('d-none');
    }
  });
}
