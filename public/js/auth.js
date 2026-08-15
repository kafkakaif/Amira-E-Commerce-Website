// Amira Authentication & Profile Updates Handler (Rev 1)

document.addEventListener('DOMContentLoaded', () => {
  setupLoginHandler();
  setupSignupHandler();
  setupAdminLoginHandler();
  setupProfileHandler();
  setupSocialLoginTooltips();
  setupForgotPasswordHandler();
  setupResetPasswordHandler();
});

// 1. Customer Login Form Submit
function setupLoginHandler() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('loginAlert');

    alertBox.classList.add('d-none');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role === 'admin') {
          window.location.href = '/admin.html';
        } else {
          window.location.href = '/profile.html';
        }
      } else {
        alertBox.textContent = data.error || 'Login failed.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('d-none');
    }
  });
}

// 2. Customer Registration Form Submit
function setupSignupHandler() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const alertBox = document.getElementById('signupAlert');

    alertBox.classList.add('d-none');

    if (password.length < 8) {
      alertBox.textContent = 'Password must be at least 8 characters long.';
      alertBox.classList.remove('d-none');
      return;
    }

    if (password !== confirmPassword) {
      alertBox.textContent = 'Passwords do not match.';
      alertBox.classList.remove('d-none');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        window.location.href = '/profile.html';
      } else {
        alertBox.textContent = data.error || 'Signup failed.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('d-none');
    }
  });
}

// 3. Administrator Portal Login Form Submit
function setupAdminLoginHandler() {
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (!adminLoginForm) return;

  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('loginAlert');

    alertBox.classList.add('d-none');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok) {
        if (data.user.role !== 'admin') {
          await fetch('/api/logout', { method: 'POST' });
          alertBox.textContent = 'Access denied. Account does not have administrator privileges.';
          alertBox.classList.remove('d-none');
        } else {
          window.location.href = '/admin.html';
        }
      } else {
        alertBox.textContent = data.error || 'Invalid credentials.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('d-none');
    }
  });
}

// 4. Customer Account Details Update Form Submit
async function setupProfileHandler() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const welcomeText = document.getElementById('profileWelcomeName');
  const alertBox = document.getElementById('profileAlert');

  try {
    const res = await fetch('/api/session');
    const data = await res.json();
    if (res.ok && data.loggedIn) {
      nameInput.value = data.user.name;
      emailInput.value = data.user.email;
      welcomeText.textContent = data.user.name;
      loadOrderHistory();
    } else {
      window.location.href = '/login.html';
    }
  } catch (error) {
    console.error('Failed to pre-load profile:', error);
  }

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = nameInput.value;
    const email = emailInput.value;
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    alertBox.classList.add('d-none');
    alertBox.className = 'alert';

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, currentPassword, newPassword })
      });
      const data = await res.json();

      if (res.ok) {
        alertBox.textContent = 'Account profile updated successfully.';
        alertBox.classList.add('alert-success');
        alertBox.classList.remove('d-none');
        welcomeText.textContent = name;
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
      } else {
        alertBox.textContent = data.error || 'Update failed.';
        alertBox.classList.add('alert-danger');
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error.';
      alertBox.classList.add('alert-danger');
      alertBox.classList.remove('d-none');
    }
  });
}

// 5. Load Customer Order History Timeline
async function loadOrderHistory() {
  const ordersContainer = document.getElementById('ordersContainer');
  if (!ordersContainer) return;

  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();

    if (res.ok) {
      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="text-center py-5 text-muted">
            <i class="bi bi-calendar-x fs-2"></i>
            <div class="mt-2">No commissions ordered yet.</div>
            <a href="/shop.html" class="btn btn-sm btn-editorial-outline mt-3">Commission Your First Dress</a>
          </div>
        `;
        return;
      }

      let html = '';
      orders.forEach((order) => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        
        let statusClass = 'badge-pending';
        if (order.status === 'Shipped') statusClass = 'badge-shipped';
        if (order.status === 'Delivered') statusClass = 'badge-delivered';
        if (order.status === 'Cancelled') statusClass = 'badge-cancelled';

        let itemsHtml = '';
        order.items.forEach((item) => {
          const itemPrice = item.price; // Stored in USD in DB
          itemsHtml += `
            <div class="d-flex align-items-center justify-content-between mb-2 py-1" style="font-size: 0.85rem;">
              <span class="text-muted">${item.name} (Size: <span class="fw-semibold text-dark">${item.size}</span>) <span class="fw-semibold text-dark">x${item.quantity}</span></span>
              <span class="fw-medium" data-price="${itemPrice * item.quantity}">${window.formatPrice(itemPrice * item.quantity)}</span>
            </div>
          `;
        });

        html += `
          <div class="order-history-box">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="text-muted" style="font-size: 0.8rem;">REF ID: #${order.id}</span>
                <h4 class="h6 text-dark mt-1" style="font-weight: 600;">Ordered on ${orderDate}</h4>
              </div>
              <span class="order-badge ${statusClass}">${order.status}</span>
            </div>
            
            <div class="bg-light p-3 rounded mb-3">
              ${itemsHtml}
              <hr class="my-2" style="border-color: var(--border-light);">
              <div class="d-flex justify-content-between align-items-center" style="font-size: 0.9rem;">
                <span class="text-muted">Total Paid</span>
                <span class="fw-bold text-dark" data-price="${order.total_amount}">${window.formatPrice(order.total_amount)}</span>
              </div>
            </div>
            
            <div class="text-muted" style="font-size: 0.8rem;">
              <i class="bi bi-geo-alt me-1"></i> Shipping to: <span class="text-dark">${order.shipping_address}</span>
            </div>
          </div>
        `;
      });
      ordersContainer.innerHTML = html;
      
      // Update DOM prices for currency formatting
      window.updateDomPrices();
    } else {
      ordersContainer.innerHTML = '<div class="text-danger text-center">Failed to load order history logs.</div>';
    }
  } catch (error) {
    ordersContainer.innerHTML = '<div class="text-danger text-center">Connection error loading orders.</div>';
  }

  // Listen to currency changes to dynamically re-render prices
  window.removeEventListener('currencychange', window.updateDomPrices);
  window.addEventListener('currencychange', window.updateDomPrices);
}

// 6. Setup Social Login Warning Tooltips
function setupSocialLoginTooltips() {
  const buttons = document.querySelectorAll('.social-btn-demo');
  const tooltip = document.getElementById('socialTooltip');
  if (!buttons.length || !tooltip) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      tooltip.classList.add('show');
      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    });
  });
}

// 7. Forgot Password Form Submit
function setupForgotPasswordHandler() {
  const forgotForm = document.getElementById('forgotPasswordForm');
  if (!forgotForm) return;

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    const alertBox = document.getElementById('forgotAlert');
    const feedbackBox = document.getElementById('resetFeedback');
    const simulatedLink = document.getElementById('simulatedLink');

    alertBox.classList.add('d-none');
    feedbackBox.classList.add('d-none');

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        // Show simulated reset link on the screen
        const absoluteResetLink = window.location.origin + data.resetLink;
        simulatedLink.href = data.resetLink;
        simulatedLink.textContent = absoluteResetLink;
        feedbackBox.classList.remove('d-none');
        forgotForm.reset();
      } else {
        alertBox.textContent = data.error || 'Failed to request reset token.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('d-none');
    }
  });
}

// 8. Reset Password Form Submit
function setupResetPasswordHandler() {
  const resetForm = document.getElementById('resetPasswordForm');
  if (!resetForm) return;

  // Attempt to auto-fill token if present in query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    const tokenInput = document.getElementById('resetToken');
    if (tokenInput) tokenInput.value = token;
  }

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const tokenVal = document.getElementById('resetToken').value;
    const password = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('confirmResetPassword').value;
    const alertBox = document.getElementById('resetAlert');
    const successBox = document.getElementById('resetSuccessMessage');

    alertBox.classList.add('d-none');
    successBox.classList.add('d-none');

    if (password.length < 8) {
      alertBox.textContent = 'Password must be at least 8 characters long.';
      alertBox.classList.remove('d-none');
      return;
    }

    if (password !== confirmPassword) {
      alertBox.textContent = 'Passwords do not match.';
      alertBox.classList.remove('d-none');
      return;
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenVal, password })
      });
      const data = await res.json();

      if (res.ok) {
        successBox.classList.remove('d-none');
        resetForm.reset();
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 3000);
      } else {
        alertBox.textContent = data.error || 'Failed to reset password.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error. Please try again.';
      alertBox.classList.remove('d-none');
    }
  });
}
