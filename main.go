//go:build js && wasm

package main

import (
	"strconv"
	"syscall/js"

	"sqid-wasm/sqids"
)

func encodeSqid(_ js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	input := args[0].Int()
	id, err := sqids.EncodeUint64(uint64(input))
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

func main() {
	js.Global().Set("encodeSqid", js.FuncOf(encodeSqid))
	js.Global().Set("decodeSqid", js.FuncOf(decodeSqid))

	select {}
}
