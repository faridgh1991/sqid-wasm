# sqid-wasm

[![TinyGo](https://img.shields.io/badge/TinyGo-0.30.0+-00ADD8?logo=go)](https://tinygo.org/)
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

* [TinyGo 0.30.0+](https://tinygo.org/getting-started/)
* [Sqids for Go](https://github.com/sqids/sqids-go)

### Build

```bash
tinygo build -o sqids.wasm -target wasm .
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

* Type number, then click **Encode**
* Click **Decode** to revert the Sqid back to numbers

## 📁 Project Structure

```
├── index.html
├── script.js
├── style.css
├── main.go
├── sqids.wasm
├── wasm_exec.js
└── README.md
```

## 📖 License

[MIT](LICENSE)

---

Created by [Farid Ghr](https://farid-ghr.pro)
