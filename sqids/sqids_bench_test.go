package sqids_test

import (
	"testing"

	"sqid-wasm/sqids"
)

func BenchmarkEncodeUint64(b *testing.B) {
	for i := range b.N {
		_, _ = sqids.EncodeUint64(uint64(i))
	}
}

func BenchmarkDecodeString(b *testing.B) {
	id, _ := sqids.EncodeUint64(456)
	b.ResetTimer()
	for range b.N {
		_, _ = sqids.DecodeString(id)
	}
}
