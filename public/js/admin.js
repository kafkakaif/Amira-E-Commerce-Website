// Amira Admin Dashboard Management Client Logic (Rev 1)

document.addEventListener('DOMContentLoaded', () => {
  verifyAdminSession();
});

// Helper: Show alert banner in admin panel
function showAdminAlert(message, type = 'success') {
  const alertBox = document.getElementById('adminGlobalAlert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} mb-4`;
  alertBox.classList.remove('d-none');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(() => {
    alertBox.classList.add('d-none');
  }, 4500);
}

// ----------------------------------------------------
// 1. VERIFY ADMIN SEATS
// ----------------------------------------------------
async function verifyAdminSession() {
  try {
    const res = await fetch('/api/session');
    const data = await res.json();

    if (res.ok && data.loggedIn && data.user.role === 'admin') {
      document.getElementById('adminHeaderName').textContent = data.user.name;
      initAdminPanel();
    } else {
      window.location.href = '/admin-login.html';
    }
  } catch (error) {
    console.error('Admin session validation failed:', error);
    window.location.href = '/admin-login.html';
  }
}

// ----------------------------------------------------
// 2. INITIALIZE PANEL LOGIC
// ----------------------------------------------------
function initAdminPanel() {
  setupSidebarNavigation();
  setupAdminLogout();
  setupProductFormSubmit();
  
  // Default load: Dashboard Tab
  loadDashboardData();

  // Listen to currency changes to refresh active views
  window.addEventListener('currencychange', () => {
    const activeTab = document.querySelector('.admin-sidebar-nav .admin-nav-item.active');
    if (!activeTab) return;
    const targetTabId = activeTab.getAttribute('data-target');
    
    if (targetTabId === 'dashboardTab') loadDashboardData();
    if (targetTabId === 'productsTab') loadProductsData();
    if (targetTabId === 'ordersTab') loadOrdersData();
    if (targetTabId === 'usersTab') loadUsersData();
  });
}

function setupSidebarNavigation() {
  const navItems = document.querySelectorAll('.admin-sidebar-nav .admin-nav-item');
  const tabs = document.querySelectorAll('.admin-tab-content');
  const title = document.getElementById('adminPageTitle');
  const sidebar = document.getElementById('adminSidebar');
  const toggleBtn = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('adminSidebarOverlay');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (window.innerWidth < 992) {
        if (sidebar) sidebar.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
      }

      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      const targetTabId = item.getAttribute('data-target');
      tabs.forEach(tab => tab.classList.add('d-none'));
      document.getElementById(targetTabId).classList.remove('d-none');

      const text = item.textContent.trim();
      title.textContent = text;

      if (targetTabId === 'dashboardTab') loadDashboardData();
      if (targetTabId === 'productsTab') loadProductsData();
      if (targetTabId === 'ordersTab') loadOrdersData();
      if (targetTabId === 'usersTab') loadUsersData();
    });
  });

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('show');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('show');
    });
  }
}

function setupAdminLogout() {
  const logoutBtn = document.getElementById('adminLogoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (res.ok) {
        window.location.href = '/admin-login.html';
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  });
}

// ----------------------------------------------------
// 3. TAB 1: DASHBOARD METRICS & CHARTS
// ----------------------------------------------------
async function loadDashboardData() {
  try {
    const res = await fetch('/api/admin/dashboard');
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    // Format metrics using dynamic pricing formatter
    document.getElementById('metricTotalSales').textContent = window.formatPrice(data.metrics.totalSales);
    document.getElementById('metricTotalOrders').textContent = data.metrics.totalOrders;
    document.getElementById('metricTotalProducts').textContent = data.metrics.totalProducts;
    document.getElementById('metricTotalUsers').textContent = data.metrics.totalUsers;

    renderSalesTrendChart(data.salesTrend);

  } catch (error) {
    showAdminAlert(`Failed to pull metrics: ${error.message}`, 'danger');
  }
}

function renderSalesTrendChart(trend) {
  const container = document.getElementById('salesTrendChart');
  if (!container) return;

  if (!trend || trend.length === 0) {
    container.innerHTML = '<div class="text-center w-100 py-5 text-muted">No sales metrics recorded yet.</div>';
    return;
  }

  const maxSales = Math.max(...trend.map(t => t.sales), 100);

  let html = '';
  trend.forEach(day => {
    const heightPercent = (day.sales / maxSales) * 100;
    const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    html += `
      <div class="bar-chart-col">
        <div class="bar-chart-pillar" style="height: ${heightPercent}%;">
          <div class="bar-chart-value">${window.formatPrice(day.sales)}</div>
        </div>
        <div class="bar-chart-label">${formattedDate}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// ----------------------------------------------------
// 4. TAB 2: PRODUCT CATALOG CRUD (with Sizing Breakdown)
// ----------------------------------------------------
async function loadProductsData() {
  const tbody = document.getElementById('adminProductsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <span class="ms-2">Loading inventories...</span>
      </td>
    </tr>
  `;

  try {
    const res = await fetch('/api/admin/products');
    const products = await res.json();

    if (!res.ok) throw new Error(products.error);

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No products created yet.</td></tr>';
      return;
    }

    let html = '';
    products.forEach(p => {
      // Build Sizing Stocks breakdown list
      let stockBreakdownHtml = '';
      if (p.sizes && p.sizes.length > 0) {
        stockBreakdownHtml = p.sizes.map(s => `
          <span class="d-inline-block px-2 py-1 bg-light border rounded text-dark fs-8 me-1 mb-1" style="font-weight: 500;">
            ${s.size}: <strong>${s.stock}</strong>
          </span>
        `).join('');
      } else {
        stockBreakdownHtml = `<span class="text-muted fs-8">No Sizing Details</span>`;
      }

      html += `
        <tr>
          <td><img src="${p.image_url}" alt="${p.name}" class="rounded border" style="width: 50px; height: 50px; object-fit: cover; background-color: var(--bg-secondary);"></td>
          <td>
            <div class="fw-semibold text-dark">${p.name}</div>
            <div class="text-muted fs-8">${p.description ? p.description.slice(0, 50) + '...' : ''}</div>
          </td>
          <td>${p.category}</td>
          <td class="text-end fw-semibold" data-price="${p.price}">${window.formatPrice(p.price)}</td>
          <td>
            <div class="d-flex flex-wrap align-items-center">
              ${stockBreakdownHtml}
            </div>
          </td>
          <td>
            <div class="d-flex gap-2 justify-content-center">
              <button class="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 btn-edit-product" 
                      data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" 
                      data-stock="${p.stock}" data-category="${p.category}" data-description="${p.description || ''}">
                Edit
              </button>
              <button class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 btn-delete-product" data-id="${p.id}">
                Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
    setupProductCatalogActions();

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to fetch inventory: ${error.message}</td></tr>`;
  }
}

function setupProductCatalogActions() {
  const modalLabel = document.getElementById('productEditorModalLabel');
  const form = document.getElementById('productEditorForm');

  document.getElementById('adminCreateProductBtn').addEventListener('click', () => {
    modalLabel.textContent = 'Add New Gallery Creation';
    form.reset();
    document.getElementById('editorProductId').value = '';
  });

  document.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.addEventListener('click', () => {
      modalLabel.textContent = 'Edit Product Details';
      document.getElementById('editorProductId').value = btn.getAttribute('data-id');
      document.getElementById('editorName').value = btn.getAttribute('data-name');
      document.getElementById('editorPrice').value = btn.getAttribute('data-price');
      document.getElementById('editorStock').value = btn.getAttribute('data-stock');
      document.getElementById('editorCategory').value = btn.getAttribute('data-category');
      document.getElementById('editorDescription').value = btn.getAttribute('data-description');

      const myModal = new bootstrap.Modal(document.getElementById('productEditorModal'));
      myModal.show();
    });
  });

  document.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.addEventListener('click', async () => {
      const pId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to permanently delete this product? This will remove sizing entries and image assets.')) {
        try {
          const res = await fetch(`/api/admin/products/${pId}`, { method: 'DELETE' });
          const data = await res.json();
          if (res.ok) {
            showAdminAlert('Product removed successfully.');
            loadProductsData();
          } else {
            showAdminAlert(data.error || 'Failed to delete product.', 'danger');
          }
        } catch (error) {
          showAdminAlert('Connection error deleting product.', 'danger');
        }
      }
    });
  });
}

function setupProductFormSubmit() {
  const form = document.getElementById('productEditorForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('modalAlert');
    alertBox.classList.add('d-none');

    const productId = document.getElementById('editorProductId').value;
    const formData = new FormData(form);

    const isEdit = productId !== '';
    const url = isEdit ? `/api/admin/products/${productId}` : '/api/admin/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        body: formData
      });
      const data = await res.json();

      if (res.ok) {
        const modalElement = document.getElementById('productEditorModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) modalInstance.hide();
        
        showAdminAlert(isEdit ? 'Product details updated successfully.' : 'New product created successfully.');
        loadProductsData();
      } else {
        alertBox.textContent = data.error || 'Failed to save product details.';
        alertBox.classList.remove('d-none');
      }
    } catch (error) {
      alertBox.textContent = 'Server connection error during product creation.';
      alertBox.classList.remove('d-none');
    }
  });
}

// ----------------------------------------------------
// 5. TAB 3: CUSTOMER ORDERS COORDINATION
// ----------------------------------------------------
async function loadOrdersData() {
  const tbody = document.getElementById('adminOrdersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <span class="ms-2">Loading orders...</span>
      </td>
    </tr>
  `;

  try {
    const res = await fetch('/api/admin/orders');
    const orders = await res.json();

    if (!res.ok) throw new Error(orders.error);

    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No orders placed yet.</td></tr>';
      return;
    }

    let html = '';
    orders.forEach(order => {
      let statusClass = 'badge-pending';
      if (order.status === 'Shipped') statusClass = 'badge-shipped';
      if (order.status === 'Delivered') statusClass = 'badge-delivered';
      if (order.status === 'Cancelled') statusClass = 'badge-cancelled';

      let itemsListHtml = '';
      order.items.forEach(it => {
        // Render item name with sizing tag
        itemsListHtml += `
          <div class="mb-1" style="font-size: 0.85rem;">
            <span class="fw-semibold text-dark">${it.name}</span> 
            <span class="text-muted">(Size: ${it.size})</span> x${it.quantity}
          </div>`;
      });

      html += `
        <tr>
          <td class="fw-semibold">#${order.id}</td>
          <td>
            <div class="fw-medium text-dark">${order.customer_name}</div>
            <div class="text-muted" style="font-size: 0.75rem;">${order.customer_email}</div>
            <div class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-geo-alt"></i> ${order.shipping_address.split(', Address:')[1] || order.shipping_address}</div>
          </td>
          <td>${itemsListHtml}</td>
          <td class="text-end fw-semibold" data-price="${order.total_amount}">${window.formatPrice(order.total_amount)}</td>
          <td class="text-center">
            <span class="order-badge ${statusClass}">${order.status}</span>
          </td>
          <td>
            <div class="d-flex gap-2 align-items-center">
              <select class="form-select form-select-sm select-order-status" data-id="${order.id}">
                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
              <button class="btn btn-sm btn-dark btn-update-status" data-id="${order.id}">Update</button>
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    setupOrderCoordinators();

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to retrieve orders: ${error.message}</td></tr>`;
  }
}

function setupOrderCoordinators() {
  document.querySelectorAll('.btn-update-status').forEach(btn => {
    btn.addEventListener('click', async () => {
      const oId = btn.getAttribute('data-id');
      const select = btn.previousElementSibling;
      const status = select.value;

      try {
        const res = await fetch(`/api/admin/orders/${oId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        const data = await res.json();

        if (res.ok) {
          showAdminAlert(`Order #${oId} status updated to: ${status}.`);
          loadOrdersData();
        } else {
          showAdminAlert(data.error || 'Failed to update order status.', 'danger');
        }
      } catch (error) {
        showAdminAlert('Connection error updating order.', 'danger');
      }
    });
  });
}

// ----------------------------------------------------
// 6. TAB 4: REGISTERED USER DIRECTORIES
// ----------------------------------------------------
async function loadUsersData() {
  const tbody = document.getElementById('adminUsersTableBody');
  if (!tbody) return;

  tbody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center py-4 text-muted">
        <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
        <span class="ms-2">Loading user accounts...</span>
      </td>
    </tr>
  `;

  try {
    const res = await fetch('/api/admin/users');
    const users = await res.json();

    if (!res.ok) throw new Error(users.error);

    let html = '';
    users.forEach(user => {
      const regDate = new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });

      const isMe = user.role === 'admin';

      html += `
        <tr>
          <td class="text-center">${user.id}</td>
          <td class="fw-semibold text-dark">${user.name}</td>
          <td>${user.email}</td>
          <td class="text-center">
            <span class="${isMe ? 'admin-badge' : 'badge bg-secondary'}">${user.role}</span>
          </td>
          <td>${regDate}</td>
          <td>
            <div class="text-center">
              ${isMe ? '<span class="text-muted fs-8">System Account</span>' : `
                <button class="btn btn-outline-danger btn-sm rounded-pill px-3 py-1 btn-delete-user" data-id="${user.id}">
                  Deactivate
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
    setupUserCatalogActions();

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to pull accounts: ${error.message}</td></tr>`;
  }
}

function setupUserCatalogActions() {
  document.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.addEventListener('click', async () => {
      const uId = btn.getAttribute('data-id');
      if (confirm('Are you sure you want to deactivate this user account?')) {
        try {
          const res = await fetch(`/api/admin/users/${uId}`, { method: 'DELETE' });
          const data = await res.json();

          if (res.ok) {
            showAdminAlert('User account deactivated successfully.');
            loadUsersData();
          } else {
            showAdminAlert(data.error || 'Failed to deactivate account.', 'danger');
          }
        } catch (error) {
          showAdminAlert('Connection error deactivating user.', 'danger');
        }
      }
    });
  });
}
