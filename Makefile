.PHONY: build test serve

# wasm_exec.js must come from the same TinyGo that built the binary, so copy it on every build.
build:
	tinygo build -o assets/sqids.wasm -target wasm ./cmd/wasm
	cp "$$(tinygo env TINYGOROOT)/targets/wasm_exec.js" assets/wasm_exec.js

test:
	go test ./...

serve:
	python3 -m http.server 8000
