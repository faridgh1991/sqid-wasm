package main

import (
	"syscall/js"

	"github.com/sqids/sqids-go"
)

func encodeSqid(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	input := args[0].Int()
	s, err := sqids.New()
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	id, err := s.Encode([]uint64{uint64(input)})
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	return js.ValueOf(id)
}

func decodeSqid(this js.Value, args []js.Value) interface{} {
	if len(args) < 1 {
		return js.ValueOf("Error: Missing input")
	}

	id := args[0].String()
	s, err := sqids.New()
	if err != nil {
		return js.ValueOf("Error: " + err.Error())
	}

	numbers := s.Decode(id)
	if len(numbers) == 0 {
		return js.ValueOf("Error: No numbers decoded")
	}

	return js.ValueOf(int(numbers[0]))
}

func main() {
	js.Global().Set("encodeSqid", js.FuncOf(encodeSqid))
	js.Global().Set("decodeSqid", js.FuncOf(decodeSqid))
	select {}
}
