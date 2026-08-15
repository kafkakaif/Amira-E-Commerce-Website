// Amira Global UI Coordinates (Rev 1)

document.addEventListener('DOMContentLoaded', () => {
  setupNavbarScroll();
  checkUserSession();
  injectCurrencyToggle();
  window.updateCartBadge();
});

// 1. Navbar Scroll Transition
function setupNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  if (!navbar) return;

  const isTransByDefault = !navbar.classList.contains('scrolled');

  if (isTransByDefault) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// 2. Validate User Session & Adjust Navbar Actions
async function checkUserSession() {
  const navLeft = document.getElementById('navLeftContainer');
  const navRight = document.getElementById('navRightContainer');

  if (!navLeft || !navRight) return;

  try {
    const res = await fetch('/api/session');
    const data = await res.json();

    if (data.loggedIn) {
      const user = data.user;
      navLeft.innerHTML = `<a class="nav-btn-outline w-100 text-center" href="/profile.html"><i class="bi bi-person me-1"></i> Account (${user.name.split(' ')[0]})</a>`;
      navRight.innerHTML = `<button class="nav-btn-outline w-100 text-center" id="navLogoutBtn">Logout</button>`;

      const logoutBtn = document.getElementById('navLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
      }
    }
  } catch (error) {
    console.error('Session validation error:', error);
  } finally {
    // Re-inject currency toggle since navRight HTML might have overwritten it
    injectCurrencyToggle();
  }
}

// 3. User Logout Handler
async function handleLogout() {
  try {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// 4. Update Global Cart Badge Count
window.updateCartBadge = async function() {
  const badge = document.getElementById('cartCount');
  if (!badge) return;

  try {
    const res = await fetch('/api/cart');
    if (res.status === 401) {
      badge.classList.add('d-none');
      return;
    }
    
    if (res.ok) {
      const cartItems = await res.json();
      const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('d-none');
      } else {
        badge.classList.add('d-none');
      }
    }
  } catch (error) {
    console.error('Error updating cart badge:', error);
  }
};

// ----------------------------------------------------
// CURRENCY ENGINE (USD / INR Toggle & Persistence)
// ----------------------------------------------------

window.getCurrentCurrency = () => localStorage.getItem('amira_currency') || 'USD';

window.formatPrice = (usdAmount) => {
  const currency = window.getCurrentCurrency();
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(usdAmount * 83); // 1 USD = 83 INR
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(usdAmount);
  }
};

window.updateDomPrices = () => {
  document.querySelectorAll('[data-price]').forEach(el => {
    const usdPrice = parseFloat(el.getAttribute('data-price'));
    if (!isNaN(usdPrice)) {
      el.textContent = window.formatPrice(usdPrice);
    }
  });
};

function injectCurrencyToggle() {
  const navRight = document.getElementById('navRightContainer');
  if (!navRight || document.getElementById('currencyToggle')) return;

  const currentCurrency = window.getCurrentCurrency();
  const usdActive = currentCurrency === 'USD' ? 'active' : '';
  const inrActive = currentCurrency === 'INR' ? 'active' : '';

  const toggleHtml = `
    <div class="currency-toggle-pill me-2" id="currencyToggle">
      <button class="currency-toggle-btn ${usdActive}" data-currency="USD">USD</button>
      <button class="currency-toggle-btn ${inrActive}" data-currency="INR">INR</button>
    </div>
  `;

  navRight.insertAdjacentHTML('afterbegin', toggleHtml);

  // Bind click events
  document.querySelectorAll('#currencyToggle .currency-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const currency = btn.getAttribute('data-currency');
      localStorage.setItem('amira_currency', currency);

      // Toggle active states
      document.querySelectorAll('#currencyToggle .currency-toggle-btn').forEach(b => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      // Update domestic page prices
      window.updateDomPrices();

      // Dispatch currency change event for individual pages to capture
      window.dispatchEvent(new Event('currencychange'));
    });
  });

  // Call formatting immediately to handle static elements
  window.updateDomPrices();
}
