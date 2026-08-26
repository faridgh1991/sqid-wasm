## 2026-08-21 - [WASM Input Handling Performance]
**Learning:** Running WASM boundary calls on every keypress causes synchronous UI jank and jitter, particularly on heavy inputs. Standard Go compiled `.wasm` file is huge and `wasm_exec.js` is tied to the compiler used; mixing TinyGo-compiled `script.js` loading pattern with standard Go files breaks the app with `LinkError: WebAssembly.instantiate(): Import #0 "gojs" "runtime.scheduleTimeoutEvent"`.
**Action:** Always debounce WASM boundary calls triggered by keypresses. Never blindly replace `.wasm` and `wasm_exec.js` files with standard Go counterparts in a TinyGo project to maintain small bundle sizes.
## 2026-08-25 - [Sqids Instance Caching]
**Learning:** The `github.com/sqids/sqids-go` library performs validation, shuffling, and setup in `sqids.New()`. Calling it on every encode/decode request takes ~3ms and causes a massive bottleneck. `*sqids.Sqids` is stateless after creation.
**Action:** Always cache the `*sqids.Sqids` instance (e.g. using `sync.Once`) to reuse it across encode/decode calls. This reduces overhead by ~1000x and avoids memory allocations.
## 2026-08-26 - [WASM Preloading]
**Learning:** In Go WebAssembly applications, the .wasm file is typically fetched by `script.js` which delays download until the DOM and JS are parsed. Since WASM binaries are heavy (700KB+), this introduces a major bottleneck in time-to-interactive.
**Action:** Always add a `<link rel="preload" href="app.wasm" as="fetch" type="application/wasm" crossorigin="anonymous">` in the HTML `<head>` to start downloading the WASM payload simultaneously with JS/CSS parsing, bypassing the waterfall execution delay.
