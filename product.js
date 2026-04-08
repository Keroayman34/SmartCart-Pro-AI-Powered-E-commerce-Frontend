/**
 * Product Description Logic
 * Handles single product display logic
 */

const DOM = {
  productDetails: document.getElementById("product-details"),
  loadingSpinner: document.getElementById("loading"),
  errorMessage: document.getElementById("error-message"),
  cartSidebar: document.getElementById("cart-sidebar"),
  cartOverlay: document.getElementById("cart-overlay"),
  cartItemsList: document.getElementById("cart-items"),
  cartCountBadge: document.getElementById("cart-count"),
  cartTotalPrice: document.getElementById("cart-total-price"),
  toastContainer: document.getElementById("toast-container"),
};

let currentProduct = null;

document.addEventListener("DOMContentLoaded", async () => {
  await initializeProductPage();
  setupEventListeners();
  renderCart();
});

async function initializeProductPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    showError("No product selected.");
    return;
  }

  showLoading(true);
  hideError();

  try {
    currentProduct = await getProductById(productId);

    if (currentProduct) {
      renderProductDetails(currentProduct);
    } else {
      showError("Product not found.");
    }
  } catch (err) {
    showError(
      "Unable to load product details. Please check your connection and try again.",
    );
  } finally {
    showLoading(false);
  }
}

function setupEventListeners() {
  document.addEventListener("cartUpdated", renderCart);
}

function showLoading(show) {
  if (show) {
    DOM.loadingSpinner.classList.remove("hidden");
    DOM.productDetails.classList.add("hidden");
  } else {
    DOM.loadingSpinner.classList.add("hidden");
    DOM.productDetails.classList.remove("hidden");
  }
}

function showError(msg) {
  DOM.errorMessage.textContent = msg;
  DOM.errorMessage.classList.remove("hidden");
}

function hideError() {
  DOM.errorMessage.classList.add("hidden");
}

function getStarsHTML(rate) {
  const rounded = Math.round(rate);
  let starsHtml = "";
  for (let i = 1; i <= 5; i++) {
    starsHtml += `<span class="material-icons-outlined star ${i <= rounded ? "filled" : ""}">star</span>`;
  }
  return starsHtml;
}

function renderProductDetails(product) {
  const ratingValue = product.rating ? product.rating.rate : 0;
  const ratingCount = product.rating ? product.rating.count : 0;

  DOM.productDetails.innerHTML = `
    <div class="product-details-image">
      <img src="${product.image}" alt="${product.title}" onerror="this.onerror=null;this.src='https://picsum.photos/300';">
    </div>
    <div class="product-details-info">
      <div class="product-category-lg">${product.category || "Product"}</div>
      <h1 class="product-title-lg">${product.title}</h1>
      
      <div class="product-rating-lg">
        ${getStarsHTML(ratingValue)}
        <span class="rating-text-lg">${ratingValue} (${ratingCount} reviews)</span>
      </div>
      
      <div class="product-price-lg">$${product.price.toFixed(2)}</div>
      <p class="product-desc-lg">${product.description}</p>
      
      <button class="btn add-to-cart-btn-lg" onclick="handleAddToCart(${product.id})">
        <span class="material-icons-outlined">add_shopping_cart</span> Add to Cart
      </button>
    </div>
  `;
}

function toggleCart() {
  DOM.cartSidebar.classList.toggle("open");
  DOM.cartOverlay.classList.toggle("show");
}

function handleAddToCart(id) {
  if (!currentProduct || currentProduct.id !== id) return;

  addToCart(currentProduct);
  showToast(`Added ${currentProduct.title.substring(0, 15)}... to cart!`);
}

function renderCart() {
  const storedCart = window.getCartItems ? window.getCartItems() : [];

  DOM.cartCountBadge.textContent = window.getCartItemCount
    ? window.getCartItemCount()
    : 0;

  const total = window.getCartTotal ? window.getCartTotal() : 0;
  DOM.cartTotalPrice.textContent = `$${total.toFixed(2)}`;

  DOM.cartItemsList.innerHTML = "";

  if (storedCart.length === 0) {
    DOM.cartItemsList.innerHTML =
      '<p class="text-center" style="color:var(--text-light);text-align:center;margin-top:20px;">Your cart is empty.</p>';
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

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

window.toggleCart = toggleCart;
window.handleAddToCart = handleAddToCart;
window.changeQuantity =
  typeof changeQuantity !== "undefined" ? changeQuantity : () => {};
window.removeFromCart =
  typeof removeFromCart !== "undefined" ? removeFromCart : () => {};
window.clearCart = typeof clearCart !== "undefined" ? clearCart : () => {};
