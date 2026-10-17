## 2026-08-21 - [WASM Input Handling Performance]
**Learning:** Running WASM boundary calls on every keypress causes synchronous UI jank and jitter, particularly on heavy inputs. Standard Go compiled `.wasm` file is huge and `wasm_exec.js` is tied to the compiler used; mixing TinyGo-compiled `script.js` loading pattern with standard Go files breaks the app with `LinkError: WebAssembly.instantiate(): Import #0 "gojs" "runtime.scheduleTimeoutEvent"`.
**Action:** Always debounce WASM boundary calls triggered by keypresses. Never blindly replace `.wasm` and `wasm_exec.js` files with standard Go counterparts in a TinyGo project to maintain small bundle sizes.
## 2026-08-25 - [Sqids Instance Caching]
**Learning:** The `github.com/sqids/sqids-go` library performs validation, shuffling, and setup in `sqids.New()`. Calling it on every encode/decode request takes ~3ms and causes a massive bottleneck. `*sqids.Sqids` is stateless after creation.
**Action:** Always cache the `*sqids.Sqids` instance (e.g. using `sync.Once`) to reuse it across encode/decode calls. This reduces overhead by ~1000x and avoids memory allocations.
## 2026-08-26 - [WASM Preloading]
**Learning:** In Go WebAssembly applications, the .wasm file is typically fetched by `script.js` which delays download until the DOM and JS are parsed. Since WASM binaries are heavy (700KB+), this introduces a major bottleneck in time-to-interactive.
**Action:** Always add a `<link rel="preload" href="app.wasm" as="fetch" type="application/wasm" crossorigin="anonymous">` in the HTML `<head>` to start downloading the WASM payload simultaneously with JS/CSS parsing, bypassing the waterfall execution delay.
## 2026-08-30 - [WASM Boundary Caching]
**Learning:** Repeatedly crossing the JS/WASM boundary for identical inputs (e.g. from key presses) incurs unnecessary execution overhead and synchronous main thread blocking.
**Action:** Always memoize WASM boundary calls in JS to prevent redundant execution for previously computed values.
## 2026-09-02 - [JavaScript Event Truthiness Bypass]
**Learning:** Checking for truthiness on DOM Event handler arguments (e.g. `if (immediate)`) fails when triggered natively by an `Event` object, bypassing logic meant for explicit booleans like `debounce` skipping.
**Action:** Always use strict equality (e.g. `immediate === true`) when checking optional boolean arguments that might receive DOM `Event` objects as their first parameter.
## 2026-09-14 - [Redundant WASM Processing on Unchanged Inputs]
**Learning:** Event listeners attached to text inputs often trigger on non-visible state changes or spaces when inputs are normalized (e.g., using `.trim()`). Since this app calls into a WebAssembly boundary for conversion, re-processing structurally identical inputs introduces unnecessary execution latency.
**Action:** Track a composite state string (e.g., mode + trimmed input) to implement an early return bypass in the event handler, making sure UI side-effects tied to raw input (like character counters) still update beforehand.
## 2026-10-17 - [Bidirectional WASM Caching & True LRU Eviction]
**Learning:** In two-way encoder/decoder apps backed by WASM, swapping modes on an already converted value triggers an unnecessary recalculation. Furthermore, simply evicting the 'first key' from a JavaScript Map works for insertion-order, but does not implement an LRU cache unless the keys are deleted and re-inserted on access.
**Action:** Pre-populate inverse cache entries when calculating a result to avoid WASM boundary penalties during mode swaps. Implement true LRU in JS Maps by deleting and re-inserting keys upon cache hit.
