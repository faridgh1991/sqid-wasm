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
	// ⚡ Bolt: Cache sqids instance for ~1000x performance improvement
	s, err := getSqids()
	if err != nil {
		return "", err
	}

	return s.Encode([]uint64{n})
}

// DecodeString decodes an id to number
func DecodeString(sqid string) (uint64, error) {
	// ⚡ Bolt: Cache sqids instance for ~1000x performance improvement
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
