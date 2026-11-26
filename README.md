# sqid-wasm

[![TinyGo](https://img.shields.io/badge/TinyGo-0.39.0+-00ADD8?logo=go)](https://tinygo.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Enabled-654FF0?logo=webassembly)](https://webassembly.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GoDoc](https://godoc.org/github.com/faridgh1991/sqid-wasm?status.svg)](https://godoc.org/github.com/faridgh1991/sqid-wasm)
[![Deploy](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?logo=github)](https://farid-ghr.pro/sqid-wasm/)

A simple Go WebAssembly demo using [Sqids](https://sqids.org/go) to encode and decode short IDs in the browser — now compiled with [TinyGo](https://tinygo.org/).

## 🔗 Live Demo

👉 [https://farid-ghr.pro/sqid-wasm/](https://farid-ghr.pro/sqid-wasm/)

## 📦 Features

* Encode/decode integer arrays to short strings using Sqids
* Written in Go, compiled to WebAssembly with TinyGo
* No external JS frameworks
* Small binary size, fast startup

## 🚀 Getting Started

### Prerequisites

* [TinyGo 0.39.0+](https://tinygo.org/getting-started/)
* [Sqids for Go](https://github.com/sqids/sqids-go)

### Build

```bash
make build   # tinygo build -o assets/sqids.wasm -target wasm ./cmd/wasm
make test
```

### Git Hooks

```bash
make hooks   # enable the pre-commit hook: go fix -diff, go vet, golangci-lint, go test
```

### Run Locally

Serve the repository root with a static file server:

```bash
make serve   # python3 -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000).

## 🧪 Usage

In the live app:

* Type number, then click **Encode**
* Click **Decode** to revert the Sqid back to numbers

## 📁 Project Structure

```
├── index.html            # page entry (GitHub Pages serves the repo root)
├── assets/               # static files loaded by index.html
│   ├── script.js
│   ├── style.css
│   ├── wasm_exec.js      # TinyGo JS glue, copied by `make build`
│   ├── sqids.wasm        # build output
│   └── sqid-wasm.png
├── cmd/wasm/main.go      # WASM entry point, exports JS functions
├── internal/
│   ├── sqids/            # Sqids encode/decode
│   └── generator/        # Snowflake ID generator
└── Makefile
```

## 📖 License

[MIT](LICENSE)

---

Created by [Farid Ghr](https://farid-ghr.pro)
