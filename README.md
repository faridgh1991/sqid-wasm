# sqid-wasm

[![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-Enabled-654FF0?logo=webassembly)](https://webassembly.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?logo=github)](https://farid-ghr.pro/sqid-wasm/)

A simple Go WebAssembly demo using [Sqids](https://sqids.org/go) to encode and decode short IDs in the browser.

## 🔗 Live Demo

👉 [https://farid-ghr.pro/sqid-wasm/](https://farid-ghr.pro/sqid-wasm/)

## 📦 Features

* Encode/decode integer arrays to short strings using Sqids
* Go + WebAssembly frontend
* No external JS frameworks
* Lightweight and fast

## 🚀 Getting Started

### Prerequisites

* [Go 1.21+](https://go.dev/dl/)

### Build

```bash
go install github.com/sqids/sqids-go@latest
 GOOS=js GOARCH=wasm go build -o sqids.wasm main.go
```

### Run Locally

Serve the directory with a static file server:

```bash
python3 -m http.server
# or use any static server, like `serve` or `http-server`
```

Visit [http://localhost:8000](http://localhost:8000).

## 🧪 Usage

In the live app:

* Type numbers separated by commas (e.g., `1, 2, 3`), then click **Encode**
* Click **Decode** to revert the Sqid back to numbers

## 📁 Project Structure

```
├── index.html
├── main.go
├── sqids.wasm
├── wasm_exec.js
└── README.md
```

## 📖 License

[MIT](LICENSE)

---

Created by [Farid Ghr](https://farid-ghr.pro)
