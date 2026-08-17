const ADMIN_STORAGE_KEY = 'gh_admin_users';
const ADMIN_PRODUCT_STORAGE_KEY = 'gh_admin_products';
const ADMIN_SESSION_KEY = 'gh_admin_session';
const ADMIN_CATEGORIES_KEY = 'gh_admin_categories';

const defaultCategories = [
  { id: 'street-lights', name: 'Solar Street Lights' },
  { id: 'power-plants', name: 'Solar Rooftop' },
  { id: 'water-heaters', name: 'Solar Water Heaters' },
  { id: 'solar-pumps', name: 'Solar Pumps' }
];

const defaultUsers = [
  { name: 'System Admin', email: 'admin@greenhorizons.com', password: 'ghadmin123', role: 'admin' }
];

const defaultProducts = [
  {
    id: 'aisl-15w',
    code: 'AISL33100115ML/MP',
    sub: 'All In One Solar Street Light - 15W 1900 Lumens',
    category: 'street-lights',
    status: 'New',
    desc: 'High-efficiency streetlight with built-in LiFePO4 battery and 40W panel.',
    image: 'assets/solar_street_light.png',
    pills: ['15W LED', '2000 Lumens', '40W Solar Panel', 'LiFePO4 Battery']
  },
  {
    id: 'roof-5kw',
    code: 'SS-GRID-5KW',
    sub: '5kW Solar Rooftop Power Plant - On-Grid',
    category: 'power-plants',
    status: 'Offer',
    desc: 'Complete rooftop plant with net meter compatibility and cloud monitoring.',
    image: 'assets/solar_rooftop.png',
    pills: ['5 kWp System', 'Net Meter Ready', 'App Monitoring']
  }
];

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  const users = safeRead(ADMIN_STORAGE_KEY, defaultUsers);
  return Array.isArray(users) && users.length ? users : defaultUsers;
}

function setUsers(users) {
  safeWrite(ADMIN_STORAGE_KEY, users);
}

function getProducts() {
  const products = safeRead(ADMIN_PRODUCT_STORAGE_KEY, defaultProducts);
  return Array.isArray(products) && products.length ? products : defaultProducts;
}

function setProducts(products) {
  safeWrite(ADMIN_PRODUCT_STORAGE_KEY, products);
}

function getCategories() {
  const categories = safeRead(ADMIN_CATEGORIES_KEY, defaultCategories);
  return Array.isArray(categories) && categories.length ? categories : defaultCategories;
}

function setCategories(categories) {
  safeWrite(ADMIN_CATEGORIES_KEY, categories);
}

function getSession() {
  return safeRead(ADMIN_SESSION_KEY, null);
}

function setSession(user) {
  safeWrite(ADMIN_SESSION_KEY, user);
}

function clearSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function isAdminLoggedIn() {
  const session = getSession();
  return !!session && !!session.email;
}

function showAdminScreen() {
  const loginScreen = document.getElementById('adminLoginScreen');
  const dashboard = document.getElementById('adminDashboard');
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  const openWebsiteBtn = document.getElementById('openWebsiteBtn');
  const adminUserLabel = document.getElementById('adminUserLabel');
  const session = getSession();

  if (loginScreen && dashboard) {
    if (session) {
      loginScreen.classList.add('hidden');
      dashboard.classList.remove('hidden');
      adminLogoutBtn.hidden = false;
      openWebsiteBtn.hidden = false;
      adminUserLabel.textContent = `${session.name || session.email} (${session.role})`;
    } else {
      loginScreen.classList.remove('hidden');
      dashboard.classList.add('hidden');
      adminLogoutBtn.hidden = true;
      openWebsiteBtn.hidden = true;
      adminUserLabel.textContent = 'Not signed in';
    }
  }
}

function renderUsers() {
  const userList = document.getElementById('userList');
  if (!userList) return;

  const users = getUsers();
  userList.innerHTML = users.map((user) => `
    <div class="user-item">
      <div>
        <strong>${user.name}</strong>
        <small>${user.email}</small>
      </div>
      <div class="user-item-meta">
        <span class="role-tag ${user.role === 'admin' ? 'role-admin' : 'role-editor'}">${user.role}</span>
      </div>
    </div>
  `).join('');
}

function renderCategoryList() {
  const categoryList = document.getElementById('categoryList');
  if (!categoryList) return;

  const categories = getCategories();
  categoryList.innerHTML = categories.map((cat) => `
    <div class="category-item">
      <div>
        <strong>${cat.name}</strong>
        <small>${cat.id}</small>
      </div>
      <button type="button" class="table-action-btn danger" data-action="remove-category" data-id="${cat.id}">Remove</button>
    </div>
  `).join('');
}

function updateProductCategoryDropdown() {
  const dropdown = document.getElementById('productCategory');
  if (!dropdown) return;
  
  const categories = getCategories();
  const currentValue = dropdown.value;
  
  dropdown.innerHTML = categories.map((cat) => `
    <option value="${cat.id}">${cat.name}</option>
  `).join('');
  
  if (categories.find((c) => c.id === currentValue)) {
    dropdown.value = currentValue;
  }
}

function renderProductsTable() {
  const adminProductTableBody = document.getElementById('adminProductTableBody');
  const productCountLabel = document.getElementById('productCountLabel');
  if (!adminProductTableBody) return;

  const products = getProducts();
  productCountLabel.textContent = `${products.length} Products`;

  adminProductTableBody.innerHTML = products.map((product) => `
    <tr>
      <td>${product.code}</td>
      <td>${product.sub}</td>
      <td>${getCategoryLabel(product.category)}</td>
      <td><span class="status-badge ${getStatusClass(product.status)}">${product.status}</span></td>
      <td>
        <button type="button" class="table-action-btn" data-action="edit" data-id="${product.id}">Edit</button>
        <button type="button" class="table-action-btn danger" data-action="remove" data-id="${product.id}">Remove</button>
      </td>
    </tr>
  `).join('');
}

function getCategoryLabel(category) {
  const map = {
    'street-lights': 'Solar Street Light',
    'power-plants': 'Solar Rooftop',
    'water-heaters': 'Solar Water Heater',
    'solar-pumps': 'Solar Pump'
  };
  return map[category] || category;
}

function getStatusClass(status) {
  const map = {
    New: 'status-new',
    Offer: 'status-offer',
    Popular: 'status-popular',
    'Best Seller': 'status-best-seller',
    Discontinued: 'status-discontinued',
    'Coming Soon': 'status-coming-soon'
  };
  return map[status] || 'status-new';
}

function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const user = getUsers().find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);

  if (!user) {
    alert('Invalid admin credentials. Please use the registered admin details.');
    return;
  }

  setSession({ ...user });
  showAdminScreen();
  event.target.reset();
}

function handleLogout() {
  clearSession();
  showAdminScreen();
}

function handleUserAccess(event) {
  event.preventDefault();

  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;

  if (!name || !email || !password) {
    alert('Please fill all user fields.');
    return;
  }

  const users = getUsers();
  const exists = users.some((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    alert('This user already has access.');
    return;
  }

  users.push({ name, email, password, role });
  setUsers(users);
  renderUsers();
  event.target.reset();
}

function handleProductSave(event) {
  event.preventDefault();

  const productCode = document.getElementById('productCode').value.trim();
  const productCategory = document.getElementById('productCategory').value;
  const productSub = document.getElementById('productSub').value.trim();
  const productImage = document.getElementById('productImage').value.trim() || 'assets/solar_rooftop.png';
  const productStatus = document.getElementById('productStatus').value;
  const productDesc = document.getElementById('productDesc').value.trim();
  const productPills = document.getElementById('productPills').value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (!productCode || !productSub || !productDesc) {
    alert('Please fill all required product fields.');
    return;
  }

  const products = getProducts();
  const currentId = productCode.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const existingIndex = products.findIndex((item) => item.id === currentId);

  const obj = {
    id: currentId,
    code: productCode,
    sub: productSub,
    category: productCategory,
    status: productStatus,
    desc: productDesc,
    image: productImage,
    pills: productPills.length ? productPills : ['Reliable Performance']
  };

  if (existingIndex >= 0) {
    products[existingIndex] = { ...products[existingIndex], ...obj };
  } else {
    products.unshift(obj);
  }

  setProducts(products);
  renderProductsTable();
  event.target.reset();
}

function handleTableAction(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === 'remove-category') {
    const categories = getCategories();
    const products = getProducts();

    // Check if category is in use
    if (products.some((p) => p.category === id)) {
      alert('Cannot delete category in use. Remove associated products first.');
      return;
    }

    const remaining = categories.filter((cat) => cat.id !== id);
    setCategories(remaining);
    renderCategoryList();
    updateProductCategoryDropdown();
    return;
  }

  const products = getProducts();

  if (action === 'remove') {
    const remaining = products.filter((item) => item.id !== id);
    setProducts(remaining);
    renderProductsTable();
  }

  if (action === 'edit') {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    document.getElementById('productCode').value = product.code;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSub').value = product.sub;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productStatus').value = product.status || 'New';
    document.getElementById('productDesc').value = product.desc || '';
    document.getElementById('productPills').value = Array.isArray(product.pills) ? product.pills.join(', ') : '';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function handleCategoryAdd(event) {
  event.preventDefault();

  const categoryName = document.getElementById('categoryName').value.trim();
  if (!categoryName) {
    alert('Please enter a category name.');
    return;
  }

  const categories = getCategories();
  const categoryId = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  if (categories.find((c) => c.id === categoryId)) {
    alert('This category already exists.');
    return;
  }

  categories.push({ id: categoryId, name: categoryName });
  setCategories(categories);
  renderCategoryList();
  updateProductCategoryDropdown();
  event.target.reset();
}

function setupAdmin() {
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const userAccessForm = document.getElementById('userAccessForm');
  const productForm = document.getElementById('productForm');
  const categoryForm = document.getElementById('categoryForm');
  const adminTable = document.getElementById('adminProductTableBody');
  const categoryList = document.getElementById('categoryList');

  // Initialize defaults in localStorage if not present
  if (!localStorage.getItem(ADMIN_CATEGORIES_KEY)) {
    setCategories(defaultCategories);
  }
  if (!localStorage.getItem(ADMIN_PRODUCT_STORAGE_KEY)) {
    setProducts(defaultProducts);
  }
  if (!localStorage.getItem(ADMIN_STORAGE_KEY)) {
    setUsers(defaultUsers);
  }

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (userAccessForm) userAccessForm.addEventListener('submit', handleUserAccess);
  if (categoryForm) categoryForm.addEventListener('submit', handleCategoryAdd);
  if (productForm) productForm.addEventListener('submit', handleProductSave);
  if (adminTable) adminTable.addEventListener('click', handleTableAction);
  if (categoryList) categoryList.addEventListener('click', handleTableAction);

  renderUsers();
  renderCategoryList();
  updateProductCategoryDropdown();
  renderProductsTable();
  showAdminScreen();
}

document.addEventListener('DOMContentLoaded', () => {
  setupAdmin();
});
