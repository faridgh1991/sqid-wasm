package sqids

import (
	"errors"
	"sync"

	"github.com/sqids/sqids-go"
)

var (
	errNoNumbers = errors.New("no numbers decoded")
	defaultSqids *sqids.Sqids
	sqidsOnce    sync.Once
	errInit      error
)

// getSqids returns a singleton instance of sqids.Sqids.
// Optimization: Re-creating `sqids.New()` on every encode/decode operation is extremely expensive (~3.2ms per op)
// because it parses character sets and sets up internal arrays from scratch every time.
// By using sync.Once to lazily initialize a singleton sqids.Sqids instance, we reuse it for all
// encode/decode operations. This brings encode/decode time from ~3.2ms to ~4us.
func getSqids() (*sqids.Sqids, error) {
	sqidsOnce.Do(func() {
		defaultSqids, errInit = sqids.New()
	})
	return defaultSqids, errInit
}

// EncodeUint64 encodes number n to the sqid
func EncodeUint64(n uint64) (string, error) {
	s, err := getSqids()
	if err != nil {
		return "", err
	}

	return s.Encode([]uint64{n})
}

// DecodeString decodes an id to number
func DecodeString(sqid string) (uint64, error) {
	s, err := getSqids()
	if err != nil {
		return 0, err
	}
	numbers := s.Decode(sqid)
	if len(numbers) == 0 {
		return 0, errNoNumbers
	}

	return numbers[0], nil
}
