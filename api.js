/**
 * API Module
 * Responsible for all external data fetching, error handling, and robust fallback mechanisms.
 */

const API_URL = "https://fakestoreapi.com/products";

// ==========================================
// FALLBACK DATA (16 Realistic Products)
// ==========================================
const MOCK_PRODUCTS = [
  // --- Electronics ---
  {
    id: 101,
    title: "QuantumX Pro Smartphone",
    price: 699.99,
    description: "Latest 5G smartphone with 120Hz AMOLED display and pro-grade camera system.",
    category: "electronics",
    image: "https://picsum.photos/300?random=101",
    rating: { rate: 4.8, count: 342 }
  },
  {
    id: 102,
    title: "UltraBook Thin 15\"",
    price: 1199.00,
    description: "Lightweight laptop with 16GB RAM, 512GB NVMe SSD, and all-day battery life.",
    category: "electronics",
    image: "https://picsum.photos/300?random=102",
    rating: { rate: 4.6, count: 128 }
  },
  {
    id: 103,
    title: "Noise-Cancelling Earbuds",
    price: 149.50,
    description: "True wireless earbuds with active noise cancellation and 24h playtime.",
    category: "electronics",
    image: "https://picsum.photos/300?random=103",
    rating: { rate: 4.3, count: 856 }
  },
  {
    id: 104,
    title: "SmartWatch Fitness Tracker",
    price: 199.99,
    description: "Waterproof smartwatch with heart rate, sleep tracking, and built-in GPS.",
    category: "electronics",
    image: "https://picsum.photos/300?random=104",
    rating: { rate: 4.5, count: 210 }
  },

  // --- Men's Clothing ---
  {
    id: 201,
    title: "Men's Premium Cotton T-Shirt",
    price: 24.99,
    description: "Breathable, 100% organic cotton crewneck tee for everyday wear.",
    category: "men's clothing",
    image: "https://picsum.photos/300?random=201",
    rating: { rate: 4.2, count: 145 }
  },
  {
    id: 202,
    title: "Vintage Denim Jacket",
    price: 79.00,
    description: "Classic blue denim jacket with warm fleece lining and sturdy metal buttons.",
    category: "men's clothing",
    image: "https://picsum.photos/300?random=202",
    rating: { rate: 4.7, count: 320 }
  },
  {
    id: 203,
    title: "Slim Fit Chino Pants",
    price: 45.50,
    description: "Stretch fabric chino pants perfect for business casual or weekend outings.",
    category: "men's clothing",
    image: "https://picsum.photos/300?random=203",
    rating: { rate: 4.1, count: 98 }
  },
  {
    id: 204,
    title: "Winter Wool Coat",
    price: 120.00,
    description: "Thick, formal wool-blend overcoat for elegant winter styling.",
    category: "men's clothing",
    image: "https://picsum.photos/300?random=204",
    rating: { rate: 4.9, count: 65 }
  },

  // --- Women's Clothing ---
  {
    id: 301,
    title: "Floral Summer Sundress",
    price: 39.99,
    description: "Lightweight, knee-length floral dress with adjustable straps.",
    category: "women's clothing",
    image: "https://picsum.photos/300?random=301",
    rating: { rate: 4.5, count: 275 }
  },
  {
    id: 302,
    title: "Elegant Silk Blouse",
    price: 55.00,
    description: "Smooth, wrinkle-resistant silk blouse with a modern neckline.",
    category: "women's clothing",
    image: "https://picsum.photos/300?random=302",
    rating: { rate: 4.8, count: 112 }
  },
  {
    id: 303,
    title: "High-Waisted Yoga Leggings",
    price: 29.99,
    description: "Moisture-wicking, squat-proof leggings with side pockets.",
    category: "women's clothing",
    image: "https://picsum.photos/300?random=303",
    rating: { rate: 4.6, count: 830 }
  },
  {
    id: 304,
    title: "Oversized Knitted Sweater",
    price: 49.50,
    description: "Cozy, relaxed-fit chunky knit sweater for chilly autumn days.",
    category: "women's clothing",
    image: "https://picsum.photos/300?random=304",
    rating: { rate: 4.4, count: 180 }
  },

  // --- Jewelery ---
  {
    id: 401,
    title: "18k Solid Gold Ring",
    price: 299.00,
    description: "Minimalist solid gold band suitable for stacking or standalone elegance.",
    category: "jewelery",
    image: "https://picsum.photos/300?random=401",
    rating: { rate: 4.9, count: 42 }
  },
  {
    id: 402,
    title: "Sterling Silver Pendant",
    price: 85.00,
    description: "Delicate silver chain with a polished teardrop pendant.",
    category: "jewelery",
    image: "https://picsum.photos/300?random=402",
    rating: { rate: 4.5, count: 215 }
  },
  {
    id: 403,
    title: "Diamond Stud Earrings",
    price: 450.00,
    description: "Ethically sourced 0.5-carat diamond earrings securely set in platinum.",
    category: "jewelery",
    image: "https://picsum.photos/300?random=403",
    rating: { rate: 4.8, count: 88 }
  },
  {
    id: 404,
    title: "Rose Gold Charm Bracelet",
    price: 150.00,
    description: "Beautiful rose gold bracelet featuring interchangeable modern charms.",
    category: "jewelery",
    image: "https://picsum.photos/300?random=404",
    rating: { rate: 4.3, count: 156 }
  }
];

// ==========================================
// CORE API LOGIC
// ==========================================

/**
 * Helper to fetch with a configurable timeout.
 * Prevents the app from freezing if the network connection hangs.
 * @param {string} resource - The URL to fetch from
 * @param {Object} options - Fetch options including timeout
 * @returns {Promise<Response>} 
 */
async function fetchWithTimeout(resource, options = {}) {
  // 6 seconds optimal timeout balance for product grids
  const { timeout = 6000 } = options; 
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetches the list of products from the API with retry logic, timeout, and a robust fallback.
 * @param {number} maxRetries - Maximum number of times to retry before giving up
 * @returns {Promise<Array>} List of product objects
 */
async function getProducts(maxRetries = 3) {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      console.log(`[API] Fetching products (Attempt ${attempt + 1} of ${maxRetries + 1})...`);
      
      // Fetch with a 6-second timeout to prevent indefinite hangs
      const response = await fetchWithTimeout(API_URL, { timeout: 6000 });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("[API] Products successfully fetched from external API.");
      
      // Map to ensure structured cleanliness
      return data.map((product) => ({
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        image: product.image,
        category: product.category,
        rating: product.rating,
      }));
      
    } catch (error) {
      console.error(`[API] Attempt ${attempt + 1} failed: ${error.message}`);
      
      // If we hit our maximum retry threshold, degrade gracefully gracefully to mock data
      if (attempt === maxRetries) {
        console.warn("[API] All network requests exhausted. Serving high-quality fallback mock data.");
        return MOCK_PRODUCTS;
      }
      
      // Wait progressively longer between retries (Exponential backoff visualization)
      const delay = 1000 * (attempt + 1);
      console.log(`[API] Retrying in ${delay / 1000} seconds...`);
      await new Promise(res => setTimeout(res, delay));
      
      attempt++;
    }
  }
}

/**
 * Fetches a single product by ID. Supports identical timeout and fallback matching.
 * @param {number|string} id
 * @returns {Promise<Object>} Single product object
 */
async function getProductById(id) {
  try {
    console.log(`[API] Fetching specific product ${id}...`);
    const response = await fetchWithTimeout(`${API_URL}/${id}`, { timeout: 6000 });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const product = await response.json();
    return {
      id: product.id,
      title: product.title,
      price: product.price,
      description: product.description,
      image: product.image,
      category: product.category,
      rating: product.rating,
    };
  } catch (error) {
    console.error(`[API] Failed to fetch product ${id} dynamically:`, error);
    
    // Cross-match local mock database if specific product lookup fails
    console.warn(`[API] Attempting to serve mock data for product ${id}...`);
    const mockMatch = MOCK_PRODUCTS.find(p => p.id == id); // Abstract equalization
    
    if (mockMatch) {
        console.log(`[API] Found fallback data for product ${id}.`);
        return mockMatch;
    }
    
    // Throw only if data totally doesn't exist
    throw new Error(`Product ${id} not found in live API or fallback data.`); 
  }
}

// Environment compatibility export for testing.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { getProducts, getProductById, MOCK_PRODUCTS };
}
