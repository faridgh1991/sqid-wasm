//go:build js && wasm

package main

import (
	"fmt"
	"sqid-wasm/generator"
	"strconv"
	"strings"
	"syscall/js"

	"sqid-wasm/sqids"
)

func encodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	// One Sqid per line; comma-separated numbers on a line share one Sqid.
	// Blank lines stay blank so output lines up with input.
	lines := strings.Split(args[0].String(), "\n")
	for i, line := range lines {
		if strings.TrimSpace(line) == "" {
			lines[i] = ""
			continue
		}
		// ⚡ Bolt: Preallocate slice based on number of parts to prevent reallocations
		parts := strings.Split(line, ",")
		numbers := make([]uint64, 0, len(parts))
		for _, part := range parts {
			n, err := strconv.ParseUint(strings.TrimSpace(part), 10, 64)
			if err != nil {
				return js.ValueOf(fmt.Sprintf("Error: line %d: %q is not a valid number (0 to 18446744073709551615)", i+1, strings.TrimSpace(part)))
			}
			numbers = append(numbers, n)
		}
		id, err := sqids.EncodeUint64s(numbers)
		if err != nil {
			return js.ValueOf(fmt.Sprintf("Error: line %d: %s", i+1, err))
		}
		lines[i] = id
	}

	return js.ValueOf(strings.Join(lines, "\n"))
}

func decodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	lines := strings.Split(args[0].String(), "\n")
	for i, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			lines[i] = ""
			continue
		}
		numbers, err := sqids.DecodeString(line)
		if err != nil {
			return js.ValueOf(fmt.Sprintf("Error: line %d: %q is not a valid Sqid", i+1, line))
		}
		strs := make([]string, len(numbers))
		for j, n := range numbers {
			strs[j] = strconv.FormatUint(n, 10)
		}
		lines[i] = strings.Join(strs, ", ")
	}

	return js.ValueOf(strings.Join(lines, "\n"))
}

func generateRandomID(_ js.Value, _ []js.Value) interface{} {
	generatedID, err := generator.GenerateRandomID()
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	return js.ValueOf(strconv.FormatUint(generatedID, 10))
}

func main() {
	err := generator.InitializeNode()
	if err != nil {
		fmt.Printf("Error: %s\n", err.Error())
	}
	js.Global().Set("encodeSqid", js.FuncOf(encodeSqid))
	js.Global().Set("decodeSqid", js.FuncOf(decodeSqid))
	js.Global().Set("generateRandomID", js.FuncOf(generateRandomID))

	select {}
}
