.PHONY: build test vet lint fix serve

# wasm_exec.js must come from the same TinyGo that built the binary, so copy it on every build.
build:
	tinygo build -o assets/sqids.wasm -target wasm ./cmd/wasm
	cp "$$(tinygo env TINYGOROOT)/targets/wasm_exec.js" assets/wasm_exec.js

test:
	go test ./...

vet:
	go vet ./...
	GOOS=js GOARCH=wasm go vet ./...

lint:
	golangci-lint run
	GOOS=js GOARCH=wasm golangci-lint run

# main.go is built only for js/wasm, so run both targets.
fix:
	go fix ./...
	GOOS=js GOARCH=wasm go fix ./...

serve:
	python3 -m http.server 8000
