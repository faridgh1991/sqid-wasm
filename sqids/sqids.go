package sqids

import (
	"errors"

	"github.com/sqids/sqids-go"
)

var (
	errNoNumbers = errors.New("no numbers decoded")

	// defaultSqids caches the Sqids instance.
	// Initializing sqids.New() is computationally expensive (approx 3ms per call)
	// because it validates options, shuffles the alphabet, and filters blocklists.
	// Since the Sqids instance is thread-safe for encoding/decoding, we instantiate
	// it once and reuse it to significantly improve performance.
	defaultSqids *sqids.Sqids
)

func init() {
	var err error
	defaultSqids, err = sqids.New()
	if err != nil {
		panic("failed to initialize sqids: " + err.Error())
	}
}

// EncodeUint64 encodes number n to the sqid
func EncodeUint64(n uint64) (string, error) {
	return defaultSqids.Encode([]uint64{n})
}

// DecodeString decodes an id to number
func DecodeString(sqid string) (uint64, error) {
	numbers := defaultSqids.Decode(sqid)
	if len(numbers) == 0 {
		return 0, errNoNumbers
	}

	return numbers[0], nil
}
