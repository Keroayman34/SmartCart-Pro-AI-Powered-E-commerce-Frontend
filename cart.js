/**
 * Cart Module
 * Handles local storage synchronization, computing totals, and cart state mutations.
 */

// Initialize cart array from localStorage, or empty array if none found
let cart = JSON.parse(localStorage.getItem("smartCart")) || [];

/**
 * Updates localStorage to persist the current cart state across page reloads.
 */
function saveCart() {
  localStorage.setItem("smartCart", JSON.stringify(cart));
}

/**
 * Validates a product before adding to cart.
 * Ensures properties exist and prevent undefined objects from crashing the app.
 * @param {Object} product
 * @returns {boolean} Whether the product is valid
 */
function isValidProduct(product) {
  return product && product.id && product.price > 0 && product.title;
}

/**
 * Adds an item to the shopping cart. If it exists, increments quantity.
 * @param {Object} product - Product to add
 */
function addToCart(product) {
  if (!isValidProduct(product)) {
    console.error("Tried to add an invalid product to cart.");
    return;
  }

  // Check if the product is already inside the cart
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    // Prevent duplicate items (increase quantity instead)
    existingItem.quantity += 1;
  } else {
    // Add new item with a base quantity of 1
    cart.push({ ...product, quantity: 1 });
  }

  // Persist changes
  saveCart();
  // Dispatch an event so the UI knows the cart has updated
  document.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Change the quantity of a specific item in the cart.
 * @param {number} productId
 * @param {number} amount Change interval (positive or negative)
 */
function changeQuantity(productId, amount) {
  const item = cart.find((p) => p.id === productId);
  if (!item) return;

  item.quantity += amount;

  // Automatic removal if quantity hits zero
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else {
    saveCart();
    document.dispatchEvent(new Event("cartUpdated"));
  }
}

/**
 * Removes a single item from the cart permanently based on its core ID.
 * @param {number} productId
 */
function removeFromCart(productId) {
  // Filter out the requested product
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  document.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Empties all items from the requested cart and storage.
 */
function clearCart() {
  cart = [];
  saveCart();
  document.dispatchEvent(new Event("cartUpdated"));
}

/**
 * Calculates the total cost of all items currently residing in the cart.
 * @returns {number} The aggregated total price
 */
function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Computes the total quantity integer sum to display on badges.
 * @returns {number} The aggregated total count of items.
 */
function getCartItemCount() {
  return cart.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Get the current read-only cart array object.
 * @returns {Array} List of current cart items
 */
function getCartItems() {
  return [...cart];
}

// Module backward compatibility check for terminal tests.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    changeQuantity,
    getCartItems,
  };
}

/** Subtotal & Extended Checkout Cart Handlers */
function getCartSubtotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function getCartTax() {
  return getCartSubtotal() * 0.08; // 8% mock tax
}

function getCartShipping() {
  return getCartSubtotal() > 0 ? 15.00 : 0; // Flat $15 shipping
}

function getCartTotal() {
  return getCartSubtotal() + getCartTax() + getCartShipping();
}

if (typeof window !== "undefined") {
  window.getCartSubtotal = getCartSubtotal;
  window.getCartTax = getCartTax;
  window.getCartShipping = getCartShipping;
}
