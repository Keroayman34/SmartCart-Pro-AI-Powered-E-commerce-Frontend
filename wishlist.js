/**
 * Wishlist Module
 */

let wishlist = JSON.parse(localStorage.getItem("smartCartWishlist")) || [];

function saveWishlist() {
  localStorage.setItem("smartCartWishlist", JSON.stringify(wishlist));
  updateWishlistUI();
  document.dispatchEvent(new Event("wishlistUpdated"));
}

function toggleWishlist(product) {
  const index = wishlist.findIndex(item => item.id === product.id);
  if (index > -1) {
    wishlist.splice(index, 1);
    if(window.showToast) window.showToast("Removed from wishlist");
  } else {
    wishlist.push(product);
    if(window.showToast) window.showToast("Added to wishlist");
  }
  saveWishlist();
}

function isInWishlist(id) {
  return wishlist.some(item => item.id === id);
}

function updateWishlistUI() {
  const badges = document.querySelectorAll(".wishlist-count");
  badges.forEach(b => b.textContent = wishlist.length);
  
  // Update heart icons on cards
  const hearts = document.querySelectorAll(".wishlist-btn .material-icons-outlined");
  hearts.forEach(heart => {
    const card = heart.closest('.product-card') || heart.closest('.product-details-info');
    if(!card) return;
    const btn = heart.closest('button');
    const id = parseInt(btn.dataset.id);
    if (isInWishlist(id)) {
      heart.textContent = "favorite";
      heart.classList.add("active");
    } else {
      heart.textContent = "favorite_border";
      heart.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", updateWishlistUI);

if (typeof window !== "undefined") {
  window.toggleWishlist = toggleWishlist;
  window.isInWishlist = isInWishlist;
  window.getWishlist = () => wishlist;
}
    wishlist.splice(index, 1);
    if(window.showToast) window.showToast("Removed from wishlist");
  } else {
    wishlist.push(product);
    if(window.showToast) window.showToast("Added to wishlist");
  }
  saveWishlist();
}

function isInWishlist(id) {
  return wishlist.some(item => item.id === id);
}

function updateWishlistUI() {
  const badges = document.querySelectorAll(".wishlist-count");
  badges.forEach(b => b.textContent = wishlist.length);
  
  // Update heart icons on cards
  const hearts = document.querySelectorAll(".wishlist-btn .material-icons-outlined");
  hearts.forEach(heart => {
    const card = heart.closest('.product-card') || heart.closest('.product-details-info');
    if(!card) return;
    const btn = heart.closest('button');
    const id = parseInt(btn.dataset.id);
    if (isInWishlist(id)) {
      heart.textContent = "favorite";
      heart.classList.add("active");
    } else {
      heart.textContent = "favorite_border";
      heart.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", updateWishlistUI);

if (typeof window !== "undefined") {
  window.toggleWishlist = toggleWishlist;
  window.isInWishlist = isInWishlist;
  window.getWishlist = () => wishlist;
}

// Optional: Function to render empty state for wishlist if you create a wishlist page
function renderWishlistEmptyState(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const wish = getWishlist();
  if (wish.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="material-icons-outlined empty-state-icon">favorite_border</span>
        <h3 class="empty-state-title">No items in wishlist</h3>
        <p>Save your favorite items here to review them later.</p>
        <a href="index.html#products-section" class="empty-state-btn">Start Browsing</a>
      </div>
    `;
  }
}
window.renderWishlistEmptyState = renderWishlistEmptyState;
