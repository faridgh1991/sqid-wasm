## 2024-05-19 - [Sqids Instance Caching]
**Learning:** Re-creating `sqids.New()` on every encode/decode operation is extremely expensive (~3.2ms per op). It parses character sets and sets up internal arrays from scratch every time.
**Action:** Use `sync.Once` to lazily initialize a singleton `sqids.Sqids` instance and reuse it for all encode/decode operations. This brought encode from ~3.2ms to ~4us.
