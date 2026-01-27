package generator

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"sync"

	"github.com/bwmarrin/snowflake"
)

var (
	snowflakeNode *snowflake.Node
	once          sync.Once
)

// GenerateRandomID generates a random unique ID using snowflake
func GenerateRandomID() (uint64, error) {
	// Initialize the snowflake node with the random node ID
	err := InitializeNode()
	if err != nil {
		return 0, err
	}

	// Generate the Snowflake ID
	snowflakeID := snowflakeNode.Generate().Int64()

	// Check if the snowflakeID is non-negative
	if snowflakeID < 0 {
		return 0, fmt.Errorf("generated Snowflake ID is negative: %d", snowflakeID)
	}

	// Safely convert int64 to uint64
	return uint64(snowflakeID), nil
}

// InitializeNode initializes the Snowflake node with a given node ID.
func InitializeNode() error {
	once.Do(
		func() {
			nodeID, err := rand.Int(rand.Reader, big.NewInt(1023))
			if err != nil {
				return
			}
			snowflakeNode, err = snowflake.NewNode(nodeID.Int64())
			if err != nil {
				// Log the error or handle it as needed
				snowflakeNode = nil
			}
		},
	)

	if snowflakeNode == nil {
		return fmt.Errorf("failed to initialize snowflake node")
	}

	return nil
}
