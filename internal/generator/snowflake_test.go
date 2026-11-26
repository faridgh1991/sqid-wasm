package generator

import (
	"testing"
)

func TestGenerateRandomID(t *testing.T) {
	tests := []struct {
		name        string
		expectError bool
	}{
		{
			name:        "generate random ID",
			expectError: false,
		},
	}

	for _, tc := range tests {
		t.Run(
			tc.name, func(t *testing.T) {
				got, err := GenerateRandomID()

				if tc.expectError {
					if err == nil {
						t.Errorf("GenerateRandomID() expected error, got nil")
					}
				} else {
					if err != nil {
						t.Errorf("GenerateRandomID() unexpected error: %v", err)
					}
					if got == 0 {
						t.Errorf("GenerateRandomID() returned zero ID")
					}
				}
			},
		)
	}
}

func TestGenerateRandomID_Uniqueness(t *testing.T) {
	// Test that multiple calls produce different IDs
	ids := make(map[uint64]bool)

	for range 100 {
		id, err := GenerateRandomID()
		if err != nil {
			t.Errorf("GenerateRandomID() failed: %v", err)
			continue
		}

		if ids[id] {
			t.Errorf("GenerateRandomID() produced duplicate ID: %d", id)
		}
		ids[id] = true
	}
}

func TestGenerateRandomID_NonNegative(t *testing.T) {
	// Test that generated IDs are valid (uint64 can never be negative)
	for range 10 {
		_, err := GenerateRandomID()
		if err != nil {
			t.Errorf("GenerateRandomID() failed: %v", err)
		}
	}
}

func TestInitializeNode(t *testing.T) {
	tests := []struct {
		name        string
		expectError bool
	}{
		{
			name:        "initialize node",
			expectError: false,
		},
	}

	for _, tc := range tests {
		t.Run(
			tc.name, func(t *testing.T) {
				err := InitializeNode()

				if tc.expectError {
					if err == nil {
						t.Errorf("InitializeNode() expected error, got nil")
					}
				} else {
					if err != nil {
						t.Errorf("InitializeNode() unexpected error: %v", err)
					}
				}
			},
		)
	}
}

func TestInitializeNode_ThreadSafety(t *testing.T) {
	// Test that InitializeNode is thread-safe by calling it multiple times concurrently
	// Since it uses sync.Once, it should be safe to call multiple times
	done := make(chan bool, 10)

	for range 10 {
		go func() {
			err := InitializeNode()
			if err != nil {
				t.Errorf("InitializeNode() failed in goroutine: %v", err)
			}
			done <- true
		}()
	}

	// Wait for all goroutines to complete
	for range 10 {
		<-done
	}
}

func TestInitializeNode_Idempotent(t *testing.T) {
	// Test that InitializeNode can be called multiple times without issues
	for range 5 {
		err := InitializeNode()
		if err != nil {
			t.Errorf("InitializeNode() failed: %v", err)
		}
	}
}

func TestGenerateRandomID_AfterInitializeNode(t *testing.T) {
	// Test that GenerateRandomID works after InitializeNode
	err := InitializeNode()
	if err != nil {
		t.Errorf("InitializeNode() failed: %v", err)
		return
	}

	id, err := GenerateRandomID()
	if err != nil {
		t.Errorf("GenerateRandomID() failed after InitializeNode: %v", err)
		return
	}

	if id == 0 {
		t.Errorf("GenerateRandomID() returned zero ID after InitializeNode")
	}
}

func TestGenerateRandomID_Consistency(t *testing.T) {
	// Test that GenerateRandomID produces consistent results
	// (i.e., it doesn't fail randomly)
	successCount := 0
	totalAttempts := 50

	for range totalAttempts {
		_, err := GenerateRandomID()
		if err == nil {
			successCount++
		}
	}

	// We expect most attempts to succeed
	successRate := float64(successCount) / float64(totalAttempts)
	if successRate < 0.9 { // 90% success rate
		t.Errorf(
			"GenerateRandomID() success rate too low: %.2f%% (%d/%d)",
			successRate*100, successCount, totalAttempts,
		)
	}
}
