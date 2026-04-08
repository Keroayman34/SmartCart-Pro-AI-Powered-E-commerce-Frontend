# Fetch & Async/Await Explanation

## The `fetch()` API

In JavaScript, `fetch` is a built-in function used to make network requests (like retrieving data from an API).
It initiates an HTTP request (like GET, POST, DELETE) to a server and returns a **Promise**.
A Promise in JavaScript represents a value that is unknown now, but will be resolved in the future (like an IOU).

Example of a regular fetch:

```javascript
fetch("https://fakestoreapi.com/products")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

While `.then()` and `.catch()` work well, chaining too many `.then()` blocks can lead to complicated code.

---

## Async/Await simply explained

`async/await` is modern syntax built on top of Promises to make asynchronous code reading like regular, synchronous code.

1. **`async`**: Placing this keyword before a function declaration automatically tells JavaScript that the function will return a Promise.
2. **`await`**: This keyword can only be used _inside_ an `async` function. It tells the code to pause execution on that specific line until the Promise (like a `fetch` request) is resolved or rejected before moving to the next line.

By avoiding long `.then()` chains, the structure becomes much flatter and cleaner.

Example from `api.js`:

```javascript
async function getProducts() {
  try {
    // Pauses here until the server sends the HTTP headers
    const response = await fetch("https://fakestoreapi.com/products");

    // Pauses again until the response body is parsed into a JavaScript object
    const data = await response.json();

    return data;
  } catch (error) {
    // Automatically jumps here if await fetch(...) fails (e.g., no internet)
    console.error(error);
  }
}
```

Using `try/catch` with `async/await` catches both synchronous and asynchronous errors effortlessly in one centralized block.
