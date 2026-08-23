## 2024-05-13 - [sqids.New() is expensive]
**Learning:** `sqids.New()` has substantial overhead because it shuffles the alphabet and sets up the default blocklist. Creating it on every call inside `EncodeUint64` and `DecodeString` caused a large performance bottleneck (from 4µs up to 3ms per op).
**Action:** Always cache and reuse `sqids.Sqids` instances using a Singleton pattern or `sync.Once` instead of instantiating new ones for every encode/decode operation.
