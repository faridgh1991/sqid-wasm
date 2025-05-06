package sqids

import (
	"errors"

	"github.com/sqids/sqids-go"
)

var errNoNumbers = errors.New("no numbers decoded")

// EncodeUint64 encodes number n to the sqid
func EncodeUint64(n uint64) (string, error) {
	s, err := sqids.New()
	if err != nil {
		return "", err
	}

	return s.Encode([]uint64{n})
}

// DecodeString decodes an id to number
func DecodeString(sqid string) (uint64, error) {
	s, err := sqids.New()
	if err != nil {
		return 0, err
	}
	numbers := s.Decode(sqid)
	if len(numbers) == 0 {
		return 0, errNoNumbers
	}

	return numbers[0], nil
}
