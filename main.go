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

	parts := strings.Split(input, ",")
	numbers := make([]uint64, 0, len(parts))

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			return js.ValueOf("Error: Empty number in list")
		}
		parsedUint, err := strconv.ParseUint(part, 10, 64)
		if err != nil {
			return js.ValueOf("Error: " + err.Error())
		}
		numbers = append(numbers, parsedUint)
	}

	id, err := sqids.EncodeUint64s(numbers)
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	return js.ValueOf(id)
}

func decodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	numbers, err := sqids.DecodeString(args[0].String())
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	strNums := make([]string, len(numbers))
	for i, num := range numbers {
		strNums[i] = strconv.FormatUint(num, 10)
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
