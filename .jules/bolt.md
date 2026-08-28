## 2026-08-21 - [WASM Input Handling Performance]
**Learning:** Running WASM boundary calls on every keypress causes synchronous UI jank and jitter, particularly on heavy inputs. Standard Go compiled `.wasm` file is huge and `wasm_exec.js` is tied to the compiler used; mixing TinyGo-compiled `script.js` loading pattern with standard Go files breaks the app with `LinkError: WebAssembly.instantiate(): Import #0 "gojs" "runtime.scheduleTimeoutEvent"`.
**Action:** Always debounce WASM boundary calls triggered by keypresses. Never blindly replace `.wasm` and `wasm_exec.js` files with standard Go counterparts in a TinyGo project to maintain small bundle sizes.
## 2026-08-25 - [Sqids Instance Caching]
**Learning:** The `github.com/sqids/sqids-go` library performs validation, shuffling, and setup in `sqids.New()`. Calling it on every encode/decode request takes ~3ms and causes a massive bottleneck. `*sqids.Sqids` is stateless after creation.
**Action:** Always cache the `*sqids.Sqids` instance (e.g. using `sync.Once`) to reuse it across encode/decode calls. This reduces overhead by ~1000x and avoids memory allocations.
## 2026-08-28 - [WASM Preloading]
**Learning:** In a pure WASM/JS application where the main logic is inside the WebAssembly binary, fetching the `.wasm` file via standard JavaScript `fetch()` during script execution delays time-to-interactive.
**Action:** Use `<link rel="preload" href="app.wasm" as="fetch" type="application/wasm" crossorigin="anonymous">` in the `index.html` head to start the download immediately.
