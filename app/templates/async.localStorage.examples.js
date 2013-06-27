



// Methods
// ========================================
// See https://github.com/slightlyoff/async-local-storage for methods.


// Examples
// ========================================


var storage = navigator.storage ||
              navigator.alsPolyfillStorage;

// Testing for a value
storage.has("thinger").then(function(doesHaveThinger) {
  if (doesHaveThinger) {
    // ...
  }
});

// Getting a value
storage.get("thinger").then(
  function(value) {
    // ...
  },
  function(e) { console.log("get failed with error:", e); }
);

// Setting a value without error handling is simple:
storage.set("thinger", "blarg");

// But setting is also async, so to read related values, it's best to wait
storage.set("thinger", "othervalue").then(function() {
  storage.get("...").then(function(value) {
    // ...
  });
});

// Iteration is also async. The returned Future resolves when the passed
// callback has been invoked for each item (or when one fails, in case of error)
var itemCount = 0;
storage.forEach(function(value, key) {
  itemCount++;
}).then(function() { console.log(itemCount, "items in storage"); });

// The above is equivalent to using .count():
storage.count().then(function(c) { console.log(c, "items in storage"); });

