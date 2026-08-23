package sqids

import (
	"errors"
	"sync"

	"github.com/sqids/sqids-go"
)

var (
	errNoNumbers = errors.New("no numbers decoded")

	// Cache the Sqids instance since sqids.New() is expensive (shuffling, blocklist, etc.)
	defaultSqids *sqids.Sqids
	errInit      error
	once         sync.Once
)

// initSqids lazily initializes the default Sqids instance
func initSqids() {
	defaultSqids, errInit = sqids.New()
}

// EncodeUint64 encodes number n to the sqid
func EncodeUint64(n uint64) (string, error) {
	// Reusing the Sqids instance reduces allocation and processing time significantly
	once.Do(initSqids)
	if errInit != nil {
		return "", errInit
	}

	return defaultSqids.Encode([]uint64{n})
}

// DecodeString decodes an id to number
func DecodeString(sqid string) (uint64, error) {
	// Reusing the Sqids instance reduces allocation and processing time significantly
	once.Do(initSqids)
	if errInit != nil {
		return 0, errInit
	}

	numbers := defaultSqids.Decode(sqid)
	if len(numbers) == 0 {
		return 0, errNoNumbers
	}

	return numbers[0], nil
}
