package sqids

import (
	"testing"
)

func BenchmarkEncodeUint64(b *testing.B) {
	for i := range b.N {
		_, _ = EncodeUint64(uint64(i))
	}
}

func BenchmarkDecodeString(b *testing.B) {
	s, _ := EncodeUint64(12345)
	b.ResetTimer()
	for range b.N {
		_, _ = DecodeString(s)
	}
}
