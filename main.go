//go:build js && wasm

package main

import (
	"fmt"
	"sqid-wasm/generator"
	"strconv"
	"syscall/js"

	"sqid-wasm/sqids"
)

func encodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	input := args[0].String()
	parsedUint, err := strconv.ParseUint(input, 10, 64)
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	id, err := sqids.EncodeUint64(parsedUint)
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	return js.ValueOf(id)
}

func decodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	number, err := sqids.DecodeString(args[0].String())
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	return js.ValueOf(strconv.FormatUint(number, 10))
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
