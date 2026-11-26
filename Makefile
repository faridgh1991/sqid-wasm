.PHONY: build test vet lint fix hooks serve

# wasm_exec.js must come from the same TinyGo that built the binary, so copy it on every build.
# -no-debug drops DWARF, which embeds absolute local paths and made the binary differ per machine.
build:
	tinygo build -no-debug -o assets/sqids.wasm -target wasm ./cmd/wasm
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

# Run once per clone to enable .githooks/pre-commit (fix, vet, lint, test).
hooks:
	git config core.hooksPath .githooks

serve:
	python3 -m http.server 8000
