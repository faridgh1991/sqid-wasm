package sqids_test

import (
	"testing"

	"sqid-wasm/sqids"
)

func TestDecodeString(t *testing.T) {
	id, err := sqids.EncodeUint64(456)
	if err != nil {
		t.Fatalf("Failed to encode: %v", err)
	}

	got, err := sqids.DecodeString(id)
	if err != nil {
		t.Fatalf("decodeString(%q) failed: %v", id, err)
	}
	if len(got) != 1 || got[0] != 456 {
		t.Errorf("decodeString(%q) = %v, want [456]", id, got)
	}
}

func TestEncodeAndDecodeMultiple(t *testing.T) {
	inputs := []uint64{1, 2, 3, 456}
	id, err := sqids.EncodeUint64s(inputs)
	if err != nil {
		t.Fatalf("Failed to encode slice: %v", err)
	}

	got, err := sqids.DecodeString(id)
	if err != nil {
		t.Fatalf("DecodeString(%q) failed: %v", id, err)
	}

	if len(got) != len(inputs) {
		t.Fatalf("DecodeString length mismatch: got %d, want %d", len(got), len(inputs))
	}

	for i := range inputs {
		if got[i] != inputs[i] {
			t.Errorf("got[%d] = %d, want %d", i, got[i], inputs[i])
		}
	}
}

func TestEncodeUint64(t *testing.T) {
	tests := []struct {
		input   uint64
		wantErr bool
	}{
		{123, false},
		{0, false},
	}

	for _, tt := range tests {
		got, err := sqids.EncodeUint64(tt.input)
		if (err != nil) != tt.wantErr {
			t.Errorf("encodeUint64(%d) error = %v, wantErr %v", tt.input, err, tt.wantErr)
		}
		if got == "" && !tt.wantErr {
			t.Errorf("encodeUint64(%d) returned empty string", tt.input)
		}
	}
}
