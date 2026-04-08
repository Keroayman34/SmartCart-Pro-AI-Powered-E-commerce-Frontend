/**
 * Main Application Logic
 * Responsible for DOM manipulation, wiring events, rendering the UI,
 * and calling API functions to ensure everything is connected and working.
 */

const DOM = {
  productsGrid: document.getElementById("products-grid"),
  loadingSpinner: document.getElementById("loading"),
  errorMessage: document.getElementById("error-message"),
  cartSidebar: document.getElementById("cart-sidebar"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartItemsList: document.getElementById("cart-items"),
  cartCountBadge: document.getElementById("cart-count"),
  cartTotalPrice: document.getElementById("cart-total-price"),
  toastContainer: document.getElementById("toast-container"),

  // New elements for search and filter
  searchInput: document.getElementById("search-input"),
  categoryFilter: document.getElementById("category-filter"),
};

let productsData = [];

/**
 * Entry point of the application running immediately when the script executes.
 */
document.addEventListener("DOMContentLoaded", async () => {
  initScrollAnimations();
  await initializeApp();
  setupEventListeners();
  renderCart(); // Render any existing items from localStorage
});

/**
 * Initializes the application state by fetching primary data and handling loading indicators.
 */
async function initializeApp() {
  showLoading(true);
  hideError();

  try {
    productsData = await getProducts();

    if (productsData && productsData.length > 0) {
      extractCategoriesForDropdown();
      renderProducts(productsData);
    } else {
      showError("No products available at the moment.");
    }
  } catch (err) {
    showError(
      "Unable to load products. Please check your connection and try again.",
    );
  } finally {
    showLoading(false);
  }
}

/**
 * Extract categories and populate dropdown
 */
function extractCategoriesForDropdown() {
  if (!DOM.categoryFilter) return;
  const categories = [...new Set(productsData.map((p) => p.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    // Capitalize first letter
    option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    DOM.categoryFilter.appendChild(option);
  });
}

/**
 * Connect Add to Cart buttons to cart system using event delegation
 * where appropriate.
 */
function setupEventListeners() {
  // Listen for custom event fired when cart state changes
  document.addEventListener("cartUpdated", renderCart);

  if (DOM.searchInput) {
    DOM.searchInput.addEventListener("input", filterProducts);
  }

  if (DOM.categoryFilter) {
    DOM.categoryFilter.addEventListener("change", filterProducts);
  }
}

function filterProducts() {
  const searchTerm = DOM.searchInput.value.toLowerCase().trim();
  const selectedCategory = DOM.categoryFilter.value;

  const filtered = productsData.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    DOM.productsGrid.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-outlined empty-state-icon">search_off</span>
        <h3 class="empty-state-title">No products found</h3>
        <p>Try adjusting your search or category filters.</p>
        <button class="empty-state-btn" onclick="resetFilters()">Reset Filters</button>
      </div>`;
  } else {
    renderProducts(filtered);
  }
}

/**
 * Controls the visibility of the primary loading spinner.
 * @param {boolean} show
 */
function showLoading(show) {
  if (show) {
    DOM.loadingSpinner.classList.remove("hidden");
    DOM.productsGrid.classList.add("hidden");
  } else {
    DOM.loadingSpinner.classList.add("hidden");
    DOM.productsGrid.classList.remove("hidden");
  }
}

/**
 * Displays error message directly on the UI and hides the grid.
 * @param {string} msg
 */
function showError(msg) {
  DOM.errorMessage.textContent = msg;
  DOM.errorMessage.classList.remove("hidden");
}

/**
 * Removes any visible error messages from the screen.
 */
function hideError() {
  DOM.errorMessage.classList.add("hidden");
}

/**
 * Generates an HTML star rating representation
 * @param {number} rate
 * @returns {string} HTML string of stars
 */
function getStarsHTML(rate) {
  const rounded = Math.round(rate);
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="material-icons-outlined star ${i <= rounded ? "filled" : ""}">star</span>`;
  }
  return starsHtml;
}

/**
 * Produces the HTML structure for displaying individual products dynamically.
 * Shortens description to maintain modern, cleaner layout alignment.
 * @param {Array} products
 */
function renderProducts(products) {
  DOM.productsGrid.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("div");
    card.className = "product-card animate-on-scroll";

    // Check if rating exists to avoid errors on older data
    const ratingValue = product.rating ? product.rating.rate : 0;
    const ratingCount = product.rating ? product.rating.count : 0;

    card.innerHTML = `
            <a href="product.html?id=${product.id}" class="product-link">
              <div class="product-image-container">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy" onerror="this.onerror=null;this.src='https://picsum.photos/300';">
              </div>
              <div class="product-info">
                <span class="product-category">${product.category || "Product"}</span>
                <h3 class="product-title" title="${product.title}">${product.title}</h3>
                
                <div class="product-rating">
                  ${getStarsHTML(ratingValue)}
                  <span class="rating-text">${ratingValue} (${ratingCount} reviews)</span>
                </div>
                
                <p class="product-desc" title="${product.description}">${product.description}</p>
              </div>
            </a>
            <div class="product-bottom">
              <div class="product-price">$${product.price.toFixed(2)}</div>
              <button class="btn add-to-cart-btn" onclick="handleAddToCart(event, ${product.id})">Add to Cart</button>
            </div>
        `;

    DOM.productsGrid.appendChild(card);
    if (window.scrollObserver) {
      window.scrollObserver.observe(card);
    }
  });
}

/**
 * Toggles the cart sidebar slide-in panel visibility and opacity background.
 */
function toggleCart() {
  DOM.cartSidebar.classList.toggle("open");
  DOM.cartOverlay.classList.toggle("show");
}

/**
 * Handler for 'Add to Cart' button actions triggered directly from the HTML click attribute.
 * Fetches the requested item from state, invokes cart engine, and pops a toast notification.
 * @param {Event} event - The click event
 * @param {number} id - Product internal ID
 */
function handleAddToCart(event, id) {
  if (event) event.preventDefault(); // Stop navigation if clicked within <a> tag

  const activeProduct = productsData.find((p) => p.id === id);
  if (!activeProduct) return;

  addToCart(activeProduct);
  showToast(`Added ${activeProduct.title.substring(0, 15)}... to cart!`);
}

/**
 * Refreshes the cart UI panel based on the latest central state in cart.js.
 * Called automatically via Event Listener whenever state changes.
 */
function renderCart() {
  const storedCart = window.getCartItems ? window.getCartItems() : [];

  // Update numeric count badge in Navbar
  DOM.cartCountBadge.textContent = window.getCartItemCount
    ? window.getCartItemCount()
    : 0;

  // Update textual subtotal price representation
  const total = window.getCartTotal ? window.getCartTotal() : 0;
  DOM.cartTotalPrice.textContent = `$${total.toFixed(2)}`;

  // Repopulate DOM node elements dynamically matching current items array
  DOM.cartItemsList.innerHTML = "";

  if (storedCart.length === 0) {
    DOM.cartItemsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-outlined empty-state-icon">shopping_bag</span>
        <h3 class="empty-state-title">Your cart is empty</h3>
        <button class="empty-state-btn" onclick="toggleCart(); window.scrollTo(0, document.getElementById('products-section').offsetTop)">Start Shopping</button>
      </div>`;
    return;
  }

  storedCart.forEach((item) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";

    itemEl.innerHTML = `
            <div class="cart-item-img-container">
              <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.onerror=null;this.src='https://picsum.photos/300';">
            </div>
            <div class="cart-item-info">
                <span class="cart-item-title" title="${item.title}">${item.title}</span>
                <span class="cart-item-price">$${item.price.toFixed(2)}</span>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <span class="material-icons-outlined" style="font-size: 18px;">delete</span>
                </button>
            </div>
        `;

    DOM.cartItemsList.appendChild(itemEl);
  });
}

/**
 * Produces a toast notification informing the user their action was successfully queued natively.
 * @param {string} message
 */
function showToast(message) {
  // Generate raw DOM elements representing visual popups
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  DOM.toastContainer.appendChild(toast);

  // Automatic cleanup via standard DOM timers since manual interaction isn't strictly requested
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

function resetFilters() {
  if (DOM.searchInput) DOM.searchInput.value = "";
  if (DOM.categoryFilter) DOM.categoryFilter.value = "all";
  filterProducts();
}

function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15,
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // Expose observer globally for dynamically added elements like product cards
  window.scrollObserver = observer;
}

// Global exposure for basic HTML click bindings
window.toggleCart = toggleCart;
window.handleAddToCart = handleAddToCart;
window.changeQuantity =
  typeof changeQuantity !== "undefined" ? changeQuantity : () => {};
window.removeFromCart =
  typeof removeFromCart !== "undefined" ? removeFromCart : () => {};
window.resetFilters = resetFilters;
window.clearCart = typeof clearCart !== "undefined" ? clearCart : () => {};
