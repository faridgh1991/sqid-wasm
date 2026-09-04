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
## 2026-09-10 - [Redundant Input Processing Pipeline]
**Learning:** DOM event handlers that process text inputs (e.g., trimming strings) often trigger a full processing pipeline—including debounce timer allocations and cache lookups—even when the user types trailing whitespace that is stripped out anyway.
**Action:** Track the `lastTrimmedInput` state and early-return if the normalized input has not changed, preventing redundant debounce setups and unnecessary processing cycles.
