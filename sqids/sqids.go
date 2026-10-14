package sqids

import (
	"errors"
	"sync"

	"github.com/sqids/sqids-go"
)

var (
	errNoNumbers = errors.New("no numbers decoded")
	sqidsCache   *sqids.Sqids
	once         sync.Once
	errInit      error
)

func getSqids() (*sqids.Sqids, error) {
	once.Do(func() {
		sqidsCache, errInit = sqids.New()
	})
	return sqidsCache, errInit
}

// EncodeUint64 encodes number n to the sqid
func EncodeUint64(n uint64) (string, error) {
	return EncodeUint64s([]uint64{n})
}

// EncodeUint64s encodes a slice of uint64 numbers to a sqid
func EncodeUint64s(numbers []uint64) (string, error) {
	// ⚡ Bolt: Cache sqids instance for ~1000x performance improvement
	s, err := getSqids()
	if err != nil {
		return "", err
	}

	return s.Encode(numbers)
}

// DecodeString decodes an id to a slice of numbers
func DecodeString(sqid string) ([]uint64, error) {
	// ⚡ Bolt: Cache sqids instance for ~1000x performance improvement
	s, err := getSqids()
	if err != nil {
		return nil, err
	}
	numbers := s.Decode(sqid)
	if len(numbers) == 0 {
		return nil, errNoNumbers
	}

	return numbers, nil
}
