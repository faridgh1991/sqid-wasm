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

	input := strings.TrimSpace(args[0].String())
	if input == "" {
		return js.ValueOf("Error: Empty input")
	}

	// Each comma-separated number gets its own Sqid: "1, 2, 3" -> "Uk, ..., ..."
	parts := strings.Split(input, ",")
	ids := make([]string, 0, len(parts))

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			return js.ValueOf("Error: Empty number in list")
		}
		parsedUint, err := strconv.ParseUint(part, 10, 64)
		if err != nil {
			return js.ValueOf("Error: " + err.Error())
		}
		id, err := sqids.EncodeUint64(parsedUint)
		if err != nil {
			return js.ValueOf("Error: " + err.Error())
		}
		ids = append(ids, id)
	}

	return js.ValueOf(strings.Join(ids, ", "))
}

func decodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	// Mirror of encode: each comma-separated Sqid is decoded on its own.
	// A Sqid that itself holds several numbers contributes all of them.
	var strNums []string
	for _, part := range strings.Split(args[0].String(), ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			return js.ValueOf("Error: Empty Sqid in list")
		}
		numbers, err := sqids.DecodeString(part)
		if err != nil {
			return js.ValueOf("Error: " + err.Error())
		}
		for _, num := range numbers {
			strNums = append(strNums, strconv.FormatUint(num, 10))
		}
	}

	return js.ValueOf(strings.Join(strNums, ", "))
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
