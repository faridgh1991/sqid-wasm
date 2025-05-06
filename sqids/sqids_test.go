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
	if got != 456 {
		t.Errorf("decodeString(%q) = %d, want 456", id, got)
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
