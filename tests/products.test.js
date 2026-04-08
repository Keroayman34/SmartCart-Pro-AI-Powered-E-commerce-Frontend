/**
 * Simple automated unit tests for `getProducts` logic in `api.js`.
 * Without frameworks (as requested): using built-in Node assert where available or simple console output.
 */

const { getProducts } = require("../api.js");

// Mock `fetch` globally since we're not running in a browser environment to execute this directly via Node.
global.fetch = async (url) => {
  if (url === "https://fakestoreapi.com/products") {
    return {
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 1,
          title: "Test Product",
          price: 9.99,
          description: "A great product",
          image: "test.jpg",
        },
      ],
    };
  } else if (url === "https://fakestoreapi.com/bad") {
    return {
      ok: false,
      status: 404,
    };
  }
  throw new Error("Network error");
};

async function runTests() {
  console.log("=== Running API Tests ===");

  // TEST 1: Test successful fetch
  try {
    const products = await getProducts();

    // Assertions
    if (!Array.isArray(products))
      throw new Error("Expected to receive an array");
    if (products.length !== 1)
      throw new Error("Expected 1 product to be returned from mock");
    if (products[0].title !== "Test Product") throw new Error("Title mismatch");
    if (products[0].price !== 9.99) throw new Error("Price mismatch");
    if (!products[0].image) throw new Error("Missing mapped image property");

    console.log("✅ Test successful fetch: PASSED");
  } catch (err) {
    console.error("❌ Test successful fetch: FAILED", err);
  }

  // TEST 2: Test error handling
  try {
    // Temporarily break the global URL inside `api.js` (simulated by overwriting fetch again)
    const originalFetch = global.fetch;
    global.fetch = async () => {
      return { ok: false, status: 500 };
    };

    let errorThrown = false;
    try {
      await getProducts();
    } catch (e) {
      errorThrown = true;
      if (e.message !== "HTTP error! Status: 500")
        throw new Error("Wrong error message thrown: " + e.message);
    }

    // Restore
    global.fetch = originalFetch;

    if (errorThrown) {
      console.log("✅ Test error handling: PASSED");
    } else {
      console.error("❌ Test error handling: FAILED (No exception thrown)");
    }
  } catch (err) {
    console.error("❌ Test error handling: FAILED", err.message);
  }
}

// Execute the test script natively
if (require.main === module) {
  runTests();
}
